// src/app/api/department/[departmentId]/route.js

import { NextResponse } from "next/server";
import { getMongoClient, connectDB } from "@/lib/connectDB";

// Types
import { Decimal128, Int32 } from "mongodb";

// GET Department by ID
export async function GET(request, context) {
  try {
    // Must await context.params
    const params = await context.params;
    const { departmentId } = params;

    if (!departmentId) {
      return NextResponse.json(
        { success: false, message: "Department ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeFields = searchParams.get("include");
    const excludeFields = searchParams.get("exclude");

    if (includeFields && excludeFields) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot use both include and exclude at the same time",
        },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("department");

    let projection = {};

    if (includeFields) {
      includeFields.split(",").forEach((field) => {
        projection[field.trim()] = 1;
      });
      projection._id = 1;
    } else if (excludeFields) {
      excludeFields.split(",").forEach((field) => {
        projection[field.trim()] = 0;
      });
    } else {
      // Default: only return name + departmentId
      projection = { "info.name": 1, departmentId: 1, _id: 0 };
    }

    const department = await collection.findOne(
      { departmentId },
      { projection }
    );

    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: department },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/department/[departmentId] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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
            "employment.position": "Manager",
            "employment.role": "Manager",
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
