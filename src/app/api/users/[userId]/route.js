// src/app/api/users/[userId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import bcrypt from "bcrypt";

/* ============================================================
   GET /api/users/[userId]
   Fetch a single user by personal.userId
   ============================================================ */
export async function GET(request, context) {
  try {
    // Dynamic route params must be awaited in App Router
    const { userId } = await context.params;

    // Validate required parameter
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Read query parameters
    const { searchParams } = new URL(request.url);
    const includeSecrets = searchParams.get("includeSecrets") === "true";

    // Connect to MongoDB
    const db = await connectDB();
    const collection = db.collection("users");

    // Exclude sensitive fields unless explicitly requested
    const projection = includeSecrets
      ? {}
      : {
          "credentials.password": 0,
          "credentials.oldPassword": 0,
        };

    // Find user by schema-defined identifier
    const user = await collection.findOne(
      { "personal.userId": userId },
      { projection }
    );

    // Handle not found
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Success response
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[userId] error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ============================================================
   PATCH /api/users/[userId]
   Update user while enforcing MongoDB schema rules
   ============================================================ */
export async function PATCH(request, { params }) {
  try {
    // Extract route parameter correctly
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    // Validate required parameter
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const payload = await request.json();

    // Connect to MongoDB
    const db = await connectDB();
    const collection = db.collection("users");

    // Fetch existing user to preserve required fields
    const existingUser = await collection.findOne({
      "personal.userId": userId,
    });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------------
       Build full update document
       - Merge existing data with payload
       - Preserve all required fields for schema
       - userId is immutable
    ---------------------------------------------------------- */
    const update = {
      personal: {
        ...existingUser.personal,
        ...(payload.personal || {}),
        userId: existingUser.personal.userId, // must never change
        hireDate: payload.personal?.hireDate
          ? new Date(payload.personal.hireDate)
          : existingUser.personal.hireDate,
      },
      credentials: {
        ...existingUser.credentials,
        ...(payload.credentials || {}),
        // Preserve lastLogin if exists, otherwise set to now
        lastLogin: existingUser.credentials.lastLogin || new Date(),
      },
      employment: {
        ...existingUser.employment,
        ...(payload.employment || {}),
        // Preserve lastUpdatedBy or set default
        lastUpdatedBy:
          payload.employment?.lastUpdatedBy ||
          existingUser.employment.lastUpdatedBy ||
          "SYSTEM",
      },
      metadata: {
        ...existingUser.metadata,
        // Preserve createdAt, always update updatedAt
        createdAt: existingUser.metadata?.createdAt || new Date(),
        updatedAt: new Date(),
      },
    };

    /* ----------------------------------------------------------
       Password handling
       - Hash new password if provided
       - Preserve old password for audit/history
    ---------------------------------------------------------- */
    if (payload.credentials?.password) {
      update.credentials.oldPassword = existingUser.credentials.password;
      update.credentials.password = await bcrypt.hash(
        payload.credentials.password,
        10
      );
    }

    /* ----------------------------------------------------------
       Apply update to MongoDB
    ---------------------------------------------------------- */
    await collection.updateOne({ "personal.userId": userId }, { $set: update });

    // Return success response
    return NextResponse.json(
      { success: true, message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/users/[userId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   DELETE /api/users/[userId]
   Delete a user by personal.userId
   ============================================================ */
export async function DELETE(request, { params }) {
  try {
    // Dynamic route params must be awaited in App Router
    const { userId } = await params;

    // Validate required parameter
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();
    const collection = db.collection("users");

    // Delete the user
    const result = await collection.deleteOne({ "personal.userId": userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Success response
    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/users/[userId] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
