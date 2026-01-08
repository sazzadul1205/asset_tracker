// src/app/api/users/CountEmployee/[departmentId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

//  GET: Count employees by department
export async function GET(request, context) {
  try {
    // Unwrap params (Next.js App Router passes a Promise)
    const params = await context.params;
    const { departmentId } = params;

    // If departmentId is missing, return 400
    if (!departmentId) {
      return NextResponse.json(
        { message: "Department ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();
    const usersCol = db.collection("users");

    // Count only ACTIVE employees in this department
    const count = await usersCol.countDocuments({
      "employment.departmentId": departmentId,
      "personal.status": "active",
      "employment.role": { $ne: "admin" },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        departmentId,
        employeeCount: count,
        message: "Successfully fetched Employee count by department",
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error
    console.error("GET /api/users/CountEmployee error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
