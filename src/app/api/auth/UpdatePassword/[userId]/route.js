// src/app/api/auth/UpdatePassword/[userId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// Bcrypt
import bcrypt from "bcrypt";

// POST: Update Password
export async function POST(req, context) {
  // Get user ID
  const { userId } = await context.params;

  try {
    // Get request body
    const body = await req.json();

    // Extract required fields
    const { oldPassword, newPassword, updatedBy = "SYSTEM" } = body;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old password and new password are required." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Find user
    const user = await usersCollection.findOne({ "personal.userId": userId });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check old password
    const isMatch = await bcrypt.compare(
      oldPassword,
      user.credentials.password
    );
    if (!isMatch) {
      return NextResponse.json(
        { error: "Old password is incorrect." },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    const updateResult = await usersCollection.updateOne(
      { "personal.userId": userId },
      {
        $set: {
          "credentials.password": hashedPassword,
          "credentials.oldPassword": user.credentials.password, // store previous password if needed
          "employment.lastUpdatedBy": updatedBy,
          "metadata.updatedAt": new Date(),
        },
      }
    );

    // Return response
    if (updateResult.modifiedCount === 1) {
      return NextResponse.json({ message: "Password updated successfully." });
    } else {
      return NextResponse.json(
        { error: "Password update failed." },
        { status: 500 }
      );
    }
    // End
  } catch (err) {
    console.error("[UpdatePassword]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
