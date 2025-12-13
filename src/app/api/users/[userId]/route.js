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
export async function PATCH(request, context) {
  try {
    // Extract route parameter
    const { userId } = await context.params;

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
       - Prevent schema violations
       - userId is immutable
    ---------------------------------------------------------- */
    const update = {
      personal: {
        ...existingUser.personal,
        ...(payload.personal || {}),
        userId: existingUser.personal.userId, // must never change
      },
      credentials: {
        ...existingUser.credentials,
        ...(payload.credentials || {}),
      },
      employment: {
        ...existingUser.employment,
        ...(payload.employment || {}),
      },
      metadata: {
        ...existingUser.metadata,
        updatedAt: new Date(), // always update timestamp
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
       Schema validation safety net
       Ensures all required fields still exist
    ---------------------------------------------------------- */
    const requiredChecks = [
      update.personal?.name,
      update.personal?.phone,
      update.personal?.hireDate,
      update.personal?.status,
      update.personal?.userId,
      update.credentials?.email,
      update.credentials?.password,
      update.credentials?.lastLogin,
      update.employment?.departmentId,
      update.employment?.position,
      update.employment?.role,
      update.employment?.lastUpdatedBy,
      update.metadata?.createdAt,
      update.metadata?.updatedAt,
    ];

    if (requiredChecks.some((value) => value === undefined)) {
      return NextResponse.json(
        {
          success: false,
          message: "Update violates schema requirements",
        },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       Apply update
    ---------------------------------------------------------- */
    await collection.updateOne({ "personal.userId": userId }, { $set: update });

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
      },
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
