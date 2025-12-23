// src/app/api/department/[departmentId]/route.js

import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/connectDB";

// Types
import { Decimal128, Int32 } from "mongodb";

// PATCH Department (TRANSACTION SAFE + Reset current users)
export const PATCH = async (request, context) => {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "assets_tracker";
  const db = client.db(dbName);
  const session = client.startSession();

  try {
    // --- Unwrap params properly ---
    const params = await context.params;
    const { departmentId } = params;

    if (!departmentId) {
      return NextResponse.json(
        { success: false, message: "Department ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { info, manager, stats, positions, updatedBy } = body;

    // ---------------- VALIDATION ----------------
    const missingFields = [];

    if (!info?.name) missingFields.push("info.name");
    if (!info?.description) missingFields.push("info.description");
    if (!info?.status) missingFields.push("info.status");
    if (!info?.icon) missingFields.push("info.icon");
    if (!info?.iconBgColor) missingFields.push("info.iconBgColor");

    if (!manager?.userId) missingFields.push("manager.userId");

    if (stats?.employeeCount === undefined)
      missingFields.push("stats.employeeCount");
    if (stats?.budget === undefined) missingFields.push("stats.budget");

    if (!Array.isArray(positions) || positions.length === 0)
      missingFields.push("positions");

    const invalidPositions = positions?.filter(
      (p) => !p.position_name || typeof p.position_name !== "string"
    );
    if (invalidPositions?.length) missingFields.push("positions.invalid");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing or invalid fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const departmentCol = db.collection("department");
    const usersCol = db.collection("users");

    // ---------------- TRANSACTION ----------------
    await session.withTransaction(async () => {
      // --- Check if department exists ---
      const existing = await departmentCol.findOne(
        { departmentId },
        { session }
      );
      if (!existing) throw new Error("Department not found");

      // --- Reset all current users in this department ---
      await usersCol.updateMany(
        { "employment.departmentId": departmentId },
        {
          $set: {
            "employment.departmentId": "UnAssigned",
            "employment.position": "UnAssigned",
            "employment.role": "employee",
            "employment.lastUpdatedBy": "system",
            "metadata.updatedAt": new Date(),
          },
        },
        { session }
      );

      // --- Check if manager exists ---
      const managerExists = await usersCol.findOne(
        { "personal.userId": manager.userId },
        { session }
      );
      if (!managerExists)
        throw new Error(`Manager user not found: ${manager.userId}`);

      // --- Type conversions ---
      const employeeCount = new Int32(Number(stats.employeeCount));
      const budgetNumber = Number(stats.budget);
      if (isNaN(budgetNumber)) throw new Error("Invalid budget value");

      // --- Update department ---
      await departmentCol.updateOne(
        { departmentId },
        {
          $set: {
            info: { ...info },
            manager: { userId: manager.userId },
            stats: {
              employeeCount,
              budget: Decimal128.fromString(budgetNumber.toString()),
            },
            positions: positions.map((p) => ({
              position_name: p.position_name,
            })),
            "metadata.updatedAt": new Date(),
          },
        },
        { session }
      );

      // --- Assign manager ---
      const managerUpdate = await usersCol.updateOne(
        { "personal.userId": manager.userId },
        {
          $set: {
            "employment.departmentId": departmentId,
            "employment.position": "manager",
            "employment.role": "manager",
            "employment.lastUpdatedBy": updatedBy || manager.userId,
            "metadata.updatedAt": new Date(),
          },
        },
        { session }
      );

      if (managerUpdate.matchedCount === 0) {
        throw new Error(
          `Manager user not found during update: ${manager.userId}`
        );
      }
    });

    // ---------------- SUCCESS ----------------
    return NextResponse.json(
      { success: true, message: "Department updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH /api/department TRANSACTION FAILED:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
};

// Delete Department
export const DELETE = async (request, { params }) => {
  const { departmentId } = await params;

  if (!departmentId) {
    return NextResponse.json(
      { success: false, message: "Department ID is required" },
      { status: 400 }
    );
  }

  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB || "assets_tracker");
  const session = client.startSession();

  try {
    const departmentCol = db.collection("department");
    const usersCol = db.collection("users");

    await session.withTransaction(async () => {
      // Delete department
      const result = await departmentCol.deleteOne(
        { departmentId },
        { session }
      );
      if (result.deletedCount === 0) throw new Error("Department not found");

      // Reset manager(s) in that department
      await usersCol.updateMany(
        { "employment.departmentId": departmentId },
        {
          $set: {
            "employment.departmentId": "UnAssigned",
            "employment.position": "UnAssigned",
            "employment.role": "employee",
            "employment.lastUpdatedBy": "system",
            "metadata.updatedAt": new Date(),
          },
        },
        { session }
      );
    });

    return NextResponse.json(
      { success: true, message: "Department deleted and users updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/department/[departmentId] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
};
