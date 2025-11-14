// api/Users/[employee_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// PUT Method - Update a user
export const PUT = async (req, context) => {
  try {
    // Await params if it's a promise
    const params = await context.params;
    const { employee_id } = params;

    // Connect to DB
    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // Parse request body
    const data = await req.json();

    // Ensure updated_at is always set
    data.updated_at = new Date();

    // Update the user directly with whatever is in the request body
    const result = await usersCollection.updateOne(
      { employee_id },
      { $set: data }
    );

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

// DELETE Method - Remove a user by employee_id
export const DELETE = async (req, context) => {
  try {
    const params = await context.params;
    const { employee_id } = params;

    const db = await connectDB();
    const usersCollection = db.collection("Users");

    const result = await usersCollection.deleteOne({ employee_id });

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
