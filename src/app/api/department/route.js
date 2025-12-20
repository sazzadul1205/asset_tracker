// src/app/api/department/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * POST: Create Department
 */
export async function POST(req) {
  try {
    const db = await connectDB();
    const departmentCol = db.collection("department");

    const body = await req.json();
    const { departmentId, info, manager, stats } = body;

    // --- Validation ---
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

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // --- Uniqueness check ---
    const exists = await departmentCol.findOne({ departmentId });
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Department already exists" },
        { status: 409 }
      );
    }

    // --- Prepare document ---
    const newDepartment = {
      departmentId,
      info: {
        name: info.name,
        description: info.description,
        status: info.status,
        icon: info.icon,
        iconBgColor: info.iconBgColor,
      },
      manager: {
        userId: manager.userId,
      },
      stats: {
        employeeCount: Number(stats.employeeCount),
        budget: Number(stats.budget),
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    await departmentCol.insertOne(newDepartment);

    return NextResponse.json(
      {
        success: true,
        message: "Department created successfully",
        data: newDepartment,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/department] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
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
