// src/app/api/Users/[employee_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// GET Method - Fetch user by employee_id
export const GET = async (req, context) => {
  try {
    const params = await context.params; // <-- await here
    const { employee_id } = params;

    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const user = await db.collection("Users").findOne({ employee_id });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = user; // Remove sensitive info
    return NextResponse.json(safeUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
};

// PUT Method - Update user
export const PUT = async (req, context) => {
  try {
    const params = await context.params;
    const { employee_id } = params;

    const db = await connectDB();
    const data = await req.json();
    data.updated_at = new Date();

    const result = await db
      .collection("Users")
      .updateOne({ employee_id }, { $set: data });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "User updated successfully",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
};

// DELETE Method - Remove a user
export const DELETE = async (req, context) => {
  try {
    const params = await context.params;
    const { employee_id } = params;

    const db = await connectDB();
    const result = await db.collection("Users").deleteOne({ employee_id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "User deleted successfully",
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 }
    );
  }
};
