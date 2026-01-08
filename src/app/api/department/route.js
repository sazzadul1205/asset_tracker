// src/app/api/department/route.js

import { NextResponse } from "next/server";
import { connectDB, getMongoClient } from "@/lib/connectDB";

// Types
import { Decimal128, Int32 } from "mongodb";

/**
 * POST: Create Department + Assign Manager (TRANSACTION SAFE)
 */
export async function POST(req) {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "assets_tracker";
  const db = client.db(dbName);
  const session = client.startSession();

  try {
    const departmentCol = db.collection("department");
    const usersCol = db.collection("users");

    const body = await req.json();
    const { departmentId, info, manager, stats, items, updatedBy } = body;

    // ---------------- VALIDATION ----------------
    const missingFields = [];

    if (!departmentId) missingFields.push("departmentId");

    if (!info?.name) missingFields.push("info.name");
    if (!info?.description) missingFields.push("info.description");
    if (!info?.status) missingFields.push("info.status");
    if (!info?.icon) missingFields.push("info.icon");
    if (!info?.iconBgColor) missingFields.push("info.iconBgColor");

    if (!manager?.userId) missingFields.push("manager.userId");

    if (stats?.employeeCount === undefined)
      missingFields.push("stats.employeeCount");
    if (stats?.budget === undefined) missingFields.push("stats.budget");

    if (!Array.isArray(items) || items.length === 0)
      missingFields.push("positions");

    const invalidPositions = items?.filter(
      (p) => !p.position_name || typeof p.position_name !== "string"
    );
    if (invalidPositions?.length) missingFields.push("positions.invalid");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing or invalid required fields: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // ---------------- TRANSACTION ----------------
    let createdDepartmentId = null;

    await session.withTransaction(async () => {
      // --- Check if department exists ---
      const exists = await departmentCol.findOne({ departmentId }, { session });
      if (exists) throw new Error("Department already exists");

      // --- Check if manager exists ---
      const managerExists = await usersCol.findOne(
        { "personal.userId": manager.userId },
        { session }
      );
      if (!managerExists) {
        throw new Error(`Manager user not found: ${manager.userId}`);
      }

      // --- Convert types ---
      const employeeCount = new Int32(Number(stats.employeeCount));
      const budgetNumber = Number(stats.budget);
      if (isNaN(budgetNumber)) throw new Error("Invalid budget value");

      // --- Create department ---
      const newDepartment = {
        departmentId,
        info: { ...info },
        manager: { userId: manager.userId },
        stats: {
          employeeCount,
          budget: Decimal128.fromString(budgetNumber.toString()),
        },
        positions: items.map((p) => ({ position_name: p.position_name })),
        metadata: { createdAt: new Date(), updatedAt: new Date() },
      };

      const insertResult = await departmentCol.insertOne(newDepartment, {
        session,
      });
      createdDepartmentId = insertResult.insertedId;

      // --- Update manager role ---
      const userUpdate = await usersCol.updateOne(
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

      if (userUpdate.matchedCount === 0) {
        throw new Error(
          `Manager user not found during update: ${manager.userId}`
        );
      }
    });

    // ---------------- SUCCESS ----------------
    return NextResponse.json(
      {
        success: true,
        message: "Department created and manager assigned successfully",
        departmentId: createdDepartmentId || departmentId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/department TRANSACTION FAILED]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}

/**
 * GET: Fetch Department
 */
export async function GET(req) {
  try {
    const db = await connectDB();
    const departmentCol = db.collection("department");

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const managerId = searchParams.get("managerId");

    const filters = {};

    if (search) {
      filters.$or = [
        { departmentId: { $regex: search, $options: "i" } },
        { "info.name": { $regex: search, $options: "i" } },
        { "info.description": { $regex: search, $options: "i" } },
      ];
    }

    if (status) filters["info.status"] = status;
    if (managerId) filters["manager.userId"] = managerId;

    // Count
    const totalItems = await departmentCol.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch
    const department = await departmentCol
      .find(filters)
      .sort({ "metadata.createdAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: department,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/department] Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
