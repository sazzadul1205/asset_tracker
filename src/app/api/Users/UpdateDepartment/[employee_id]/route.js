// api/Users/UpdateDepartment/[employee_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export const PUT = async (req, context) => {
  try {
    const { employee_id } = await context.params; // IMPORTANT FIX

    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const body = await req.json();

    // Final update object (will only contain fields that exist)
    const update = {};

    // ---- CONTACT FIELDS ----
    if (body.contact) {
      for (const key of ["department", "position", "phone"]) {
        if (body.contact[key] !== undefined) {
          update[`contact.${key}`] = body.contact[key];
        }
      }
    }

    // ---- EMPLOYMENT FIELDS ----
    if (body.employment) {
      for (const key of ["department", "position", "access_level", "fixed"]) {
        if (body.employment[key] !== undefined) {
          update[`employment.${key}`] = body.employment[key];
        }
      }
    }

    update.updated_at = new Date();

    const result = await db
      .collection("Users")
      .updateOne({ "identity.employee_id": employee_id }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User updated", modifiedCount: result.modifiedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { message: "Update failed", error: error.message },
      { status: 500 }
    );
  }
};
