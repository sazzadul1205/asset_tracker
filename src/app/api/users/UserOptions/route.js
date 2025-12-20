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
    const db = await connectDB(); // Connect to MongoDB
    const usersCol = db.collection("users"); // Get the users collection

    const { searchParams } = new URL(request.url);

    /**
     * Inclusion filters (optional)
     * Only include users matching these fields
     */
    const role = searchParams.get("role"); // e.g., role=manager
    const status = searchParams.get("status"); // e.g., status=active
    const position = searchParams.get("position"); // e.g., position=teamLead
    const department = searchParams.get("departmentId"); // e.g., departmentId=123

    /**
     * Exclusion filters (optional)
     * Exclude users matching these fields
     */
    const excludeRole = searchParams.get("excludeRole");
    const excludeStatus = searchParams.get("excludeStatus");
    const excludePosition = searchParams.get("excludePosition");
    const excludeDepartment = searchParams.get("excludeDepartmentId");

    /** Optional search query for name or userId */
    const search = searchParams.get("search")?.trim();

    // Build MongoDB filter object
    const filters = {};

    // Include filters: only match these if provided
    if (role) filters["employment.role"] = role;
    if (status) filters["personal.status"] = status;
    if (position) filters["employment.position"] = position;
    if (department) filters["employment.departmentId"] = department;

    // Exclude filters: remove matching users if provided
    if (excludeRole) filters["employment.role"] = { $ne: excludeRole };
    if (excludeDepartment)
      filters["employment.departmentId"] = { $ne: excludeDepartment };
    if (excludeStatus) filters["personal.status"] = { $ne: excludeStatus };
    if (excludePosition)
      filters["employment.position"] = { $ne: excludePosition };

    // Search by name or userId (case-insensitive regex)
    if (search) {
      filters.$or = [
        { "personal.name": { $regex: search, $options: "i" } },
        { "personal.userId": { $regex: search, $options: "i" } },
      ];
    }

    /**
     * Projection: only return fields needed for dropdowns/options
     * - personal.name
     * - personal.userId
     * Exclude _id and other sensitive fields
     */
    const projection = {
      "personal.name": 1,
      "personal.userId": 1,
      _id: 0,
    };

    // Fetch matching users, sorted alphabetically by name
    const users = await usersCol
      .find(filters, { projection })
      .sort({ "personal.name": 1 })
      .toArray();

    // Return response in JSON
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("GET /api/UserOptions error:", error);

    // Return 500 if something goes wrong
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
