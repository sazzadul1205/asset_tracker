// src/app/api/department/[departmentId]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// Types
import { Decimal128, Int32 } from "mongodb";

// PATCH Department
export const PATCH = async (request, context) => {
  try {
    const { departmentId } = await context.params;

    if (!departmentId) {
      return NextResponse.json(
        { success: false, message: "Department ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { info, manager, stats, positions } = body;

    // Validate required fields
    const missingFields = [];
    if (!info?.name) missingFields.push("info.name");
    if (!info?.description) missingFields.push("info.description");
    if (!info?.status) missingFields.push("info.status");
    if (!info?.icon) missingFields.push("info.icon");
    if (!info?.iconBgColor) missingFields.push("info.iconBgColor");
    if (!manager?.userId) missingFields.push("manager.userId");
    if (stats?.employeeCount === undefined)
      missingFields.push("stats.employeeCount");
    if (stats?.budget === undefined) missingFields.push("stats.budget");
    if (!positions || !Array.isArray(positions) || positions.length === 0)
      missingFields.push("positions");
    const invalidPositions = positions?.filter(
      (p) => !p.position_name || typeof p.position_name !== "string"
    );
    if (invalidPositions?.length > 0) missingFields.push("positions.invalid");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing or invalid fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("department");

    // Fetch existing document to preserve createdAt
    const existing = await collection.findOne({ departmentId });
    if (!existing)
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 }
      );

    // Prepare update payload with proper types
    const updatePayload = {
      info: {
        name: info.name,
        description: info.description,
        status: info.status,
        icon: info.icon,
        iconBgColor: info.iconBgColor,
      },
      manager: { userId: manager.userId },
      stats: {
        employeeCount: new Int32(Number(stats.employeeCount)),
        budget: Decimal128.fromString(Number(stats.budget).toString()),
      },
      positions: positions.map((p) => ({ position_name: p.position_name })),
      metadata: {
        createdAt: existing.metadata?.createdAt || new Date(),
        updatedAt: new Date(),
      },
    };

    await collection.updateOne({ departmentId }, { $set: updatePayload });

    return NextResponse.json(
      { success: true, message: "Department updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH /api/department/[departmentId] error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
};

// Delete Department
export const DELETE = async (request, { params }) => {
  try {
    // Dynamic route params must be awaited in App Router
    const { departmentId } = await params;

    // Validate required parameter
    if (!departmentId) {
      return NextResponse.json(
        { success: false, message: "Department ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();
    const collection = db.collection("department");

    // Delete the department
    const result = await collection.deleteOne({ departmentId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Department deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/department/[departmentId] error:", error);
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
};
