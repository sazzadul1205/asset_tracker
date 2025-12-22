// src/app/api/users/updateRole/[userId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * POST /api/users/updateRole/:userId
 * Updates personal info (name, phone, email) for a user
 * Ensures email uniqueness and follows MongoDB schema validation
 */
export async function POST(req, context) {
  // Unwrap params (Next.js App Router passes a Promise)
  const params = await context.params;
  const { userId } = params;

  // If userId is missing, return 400
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Get data from request body
    const body = await req.json();
    const { personal, credentials, updatedBy } = body;

    // Validate that required data exists
    if (!personal || !credentials) {
      return NextResponse.json(
        { error: "Missing personal or credentials data" },
        { status: 400 }
      );
    }

    // Check if email already exists for another user
    const existingEmail = await usersCollection.findOne({
      "credentials.email": credentials.email,
      "personal.userId": { $ne: userId },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Fetch current user to preserve required fields
    const user = await usersCollection.findOne({ "personal.userId": userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update object safely (only updating provided fields)
    const updateFields = {
      "personal.name": personal.name || user.personal.name,
      "personal.phone": personal.phone || user.personal.phone,
      "credentials.email": credentials.email || user.credentials.email,
      "employment.lastUpdatedBy": updatedBy || user.employment.lastUpdatedBy,
      "metadata.updatedAt": new Date(),
    };

    // Update user info
    const updateResult = await usersCollection.updateOne(
      { "personal.userId": userId },
      { $set: updateFields }
    );

    // If user not found after update, return 404
    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Success response
    return NextResponse.json(
      { message: "Personal info updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    // Catch any errors and return 500
    console.error("[Update Personal Info API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
