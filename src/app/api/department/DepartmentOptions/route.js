// src/app/api/department/DepartmentOptions/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * GET /api/DepartmentOptions
 *
 * Returns simplified list of departments:
 * - departmentId
 * - info.name
 * - positions (array)
 *
 * Supports optional:
 * - Search by department name or ID
 * - Inclusion filters: status, managerId
 * - Exclusion filters: excludeStatus, excludeManagerId
 */
export async function GET(request) {
  try {
    const db = await connectDB();
    const departmentsCol = db.collection("department");

    const { searchParams } = new URL(request.url);

    // Inclusion filters
    const status = searchParams.get("status");
    const managerId = searchParams.get("managerId");

    // Exclusion filters
    const excludeStatus = searchParams.get("excludeStatus");
    const excludeManagerId = searchParams.get("excludeManagerId");

    const search = searchParams.get("search")?.trim();

    // Build filters object
    const filters = {};

    // Inclusion
    if (status) filters["info.status"] = status;
    if (managerId) filters["manager.userId"] = managerId;

    // Exclusion
    if (excludeStatus) filters["info.status"] = { $ne: excludeStatus };
    if (excludeManagerId) filters["manager.userId"] = { $ne: excludeManagerId };

    // Search by name or ID
    if (search) {
      filters.$or = [
        { "info.name": { $regex: search, $options: "i" } },
        { departmentId: { $regex: search, $options: "i" } },
      ];
    }

    // Projection: include departmentId, info.name, and positions
    const projection = {
      departmentId: 1,
      "info.name": 1,
      positions: 1,
      _id: 0,
    };

    const departments = await departmentsCol
      .find(filters, { projection })
      .sort({ "info.name": 1 })
      .toArray();

    return NextResponse.json(
      { success: true, data: departments },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/DepartmentOptions error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
