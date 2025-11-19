// /route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import bcrypt from "bcrypt";

export const PATCH = async (req, context) => {
  try {
    // await params from context
    const { employee_id } = await context.params;

    // check if employee_id is provided
    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // check if old_password and new_password are provided
    const { old_password, new_password } = await req.json();

    // check if old_password and new_password are provided
    if (!old_password || !new_password) {
      return NextResponse.json(
        { message: "Old and new password required" },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = await connectDB();
    const user = await db.collection("Users").findOne({ employee_id });

    // Check if user exists
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if old_password is correct
    const isMatch = await bcrypt.compare(old_password, user.password);

    // Is the old password correct
    if (!isMatch) {
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await db.collection("Users").updateOne(
      { employee_id },
      {
        $set: {
          password: hashedPassword,
          password_changed_at: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
};
