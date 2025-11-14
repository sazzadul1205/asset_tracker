// api/Users/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

// GET Method - Fetch Users with pagination & optional search
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Users");

    // Parse query params
    const {
      search,
      page = 1,
      limit = 10,
      status,
      department,
      access_level,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    // Filters
    const filters = {};

    // Search by name, email, phone, employee_id
    if (search) {
      filters.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { employee_id: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) filters.status = status;

    // Filter by department
    if (department) filters.department = department;

    // Filter by access level
    if (access_level) filters.access_level = access_level;

    // Total count
    const total = await collection.countDocuments(filters);

    // Fetch paginated users
    const users = await collection
      .find(filters)
      .sort({ created_at: -1 }) // newest first
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: users,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while fetching users",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
