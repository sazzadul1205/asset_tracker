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
    console.log("====== [PUT USER] Incoming Request ======");

    const params = await context.params;
    const { employee_id } = params;

    console.log("➡ Employee ID received:", employee_id);

    if (!employee_id) {
      console.log("❌ ERROR: Employee ID missing!");
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    console.log("✔ Connected to DB");

    const data = await req.json();
    console.log("➡ Incoming Body:", data);

    data.updated_at = new Date();

    // Build update object
    const updateDoc = {};
    console.log("➡ Building update document...");

    if (data.identity) {
      updateDoc.identity = data.identity;
      console.log("   • identity updated");
    }
    if (data.contact) {
      updateDoc.contact = data.contact;
      console.log("   • contact updated");
    }
    if (data.employment) {
      updateDoc.employment = data.employment;
      console.log("   • employment updated");
    }
    if (data.audit) {
      updateDoc.audit = data.audit;
      console.log("   • audit updated");
    }
    if (data.fixed !== undefined) {
      updateDoc.fixed = data.fixed;
      console.log("   • fixed updated:", data.fixed);
    }
    if (data.security) {
      updateDoc.security = data.security;
      console.log("   • security updated");
    }
    if (data.last_login) {
      updateDoc.last_login = data.last_login;
      console.log("   • last_login updated");
    }

    console.log("➡ Final updateDoc:", updateDoc);

    console.log(
      "➡ Searching for user with identity.employee_id =",
      employee_id
    );

    const result = await db
      .collection("Users")
      .updateOne({ "identity.employee_id": employee_id }, { $set: updateDoc });

    console.log("➡ MongoDB result:", result);

    if (result.matchedCount === 0) {
      console.log("❌ No user matched the provided employee_id");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("✔ User updated successfully!");
    console.log("----------------------------------------");

    return NextResponse.json(
      {
        message: "User updated successfully",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating user:", error);
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
