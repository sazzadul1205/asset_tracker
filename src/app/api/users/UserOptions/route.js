// src/app/api/users/UserOptions/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * GET /api/UserOptions
 *
 * Returns a simplified list of users containing only:
 * - personal.name
 * - personal.userId
 *
 * Useful for populating dropdowns or options.
 *
 * Supports:
 * 1. Search by name or userId (case-insensitive)
 * 2. Include filters: role, departmentId, status, position
 * 3. Exclude filters: excludeRole, excludeDepartmentId, excludeStatus, excludePosition
 */
export async function GET(request) {
  try {
    const db = await connectDB();
    const usersCol = db.collection("users");

    const { searchParams } = new URL(request.url);

    // Inclusion filters
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const position = searchParams.get("position");
    const department = searchParams.get("departmentId");

    // Exclusion filters (can be comma-separated to exclude multiple roles)
    const excludeRole = searchParams.get("excludeRole"); // e.g., "manager,admin"
    const excludeStatus = searchParams.get("excludeStatus");
    const excludePosition = searchParams.get("excludePosition");
    const excludeDepartment = searchParams.get("excludeDepartmentId");

    const search = searchParams.get("search")?.trim();

    // Build MongoDB filter object
    const filters = {};

    // Include filters
    if (role) filters["employment.role"] = role;
    if (status) filters["personal.status"] = status;
    if (position) filters["employment.position"] = position;
    if (department) filters["employment.departmentId"] = department;

    // Exclude filters
    if (excludeRole) {
      const roles = excludeRole.split(",").map((r) => r.trim());
      filters["employment.role"] = { $nin: roles };
    }
    if (excludeDepartment)
      filters["employment.departmentId"] = { $ne: excludeDepartment };
    if (excludeStatus) filters["personal.status"] = { $ne: excludeStatus };
    if (excludePosition)
      filters["employment.position"] = { $ne: excludePosition };

    // Search by name or userId (case-insensitive)
    if (search) {
      filters.$or = [
        { "personal.name": { $regex: search, $options: "i" } },
        { "personal.userId": { $regex: search, $options: "i" } },
      ];
    }

    // Projection for dropdown
    const projection = {
      "personal.name": 1,
      "personal.userId": 1,
      _id: 0,
    };

    const users = await usersCol
      .find(filters, { projection })
      .sort({ "personal.name": 1 })
      .toArray();

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("GET /api/UserOptions error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
