// src/app/api/Users/[employee_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * GET Method - Fetch user by employee_id
 */
export const GET = async (req, context) => {
  try {
    const params = await context.params;
    const { employee_id } = params;

    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    // Use nested query: identity.employee_id
    const user = await db
      .collection("Users")
      .findOne({ "identity.employee_id": employee_id });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove sensitive info (password)
    const { security, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
};

/**
 * PUT Method - Update user by employee_id
 */
export const PUT = async (req, context) => {
  try {
    const params = await context.params;
    const { employee_id } = params;

    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const data = await req.json();
    data.updated_at = new Date();

    // Build update object
    const updateDoc = {};

    // Only update fields provided in the request body
    if (data.identity) updateDoc.identity = data.identity;
    if (data.contact) updateDoc.contact = data.contact;
    if (data.employment) updateDoc.employment = data.employment;
    if (data.audit) updateDoc.audit = data.audit;
    if (data.fixed !== undefined) updateDoc.fixed = data.fixed;
    if (data.security) updateDoc.security = data.security; 
    if (data.last_login) updateDoc.last_login = data.last_login;

    const result = await db
      .collection("Users")
      .updateOne({ "identity.employee_id": employee_id }, { $set: updateDoc });

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

/**
 * DELETE Method - Remove a user by employee_id
 */
export const DELETE = async (req, context) => {
  try {
    const params = await context.params;
    const { employee_id } = params;

    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const result = await db
      .collection("Users")
      .deleteOne({ "identity.employee_id": employee_id });

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
