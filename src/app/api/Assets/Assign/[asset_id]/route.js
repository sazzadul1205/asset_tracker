// api/Assets/Assign/[asset_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export const PUT = async (req, context) => {
  try {
    const params = await context.params;
    const { asset_id } = params;

    // Validate asset_id
    if (!asset_id) {
      return NextResponse.json(
        { message: "asset_id is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { employee_id, updated_by } = body;

    // MUST have employee_id
    if (!employee_id) {
      return NextResponse.json(
        { message: "employee_id is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Assets");

    // Build update object
    const updateDoc = {
      $set: {
        assigned_to: employee_id,
        assigned_at: new Date(),
        updated_by: updated_by || null,
        updated_at: new Date(),
        status: "assigned",
      },
    };

    // Update asset
    const result = await collection.updateOne({ asset_id }, updateDoc, {
      upsert: false,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Asset assigned successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning asset:", error);
    return NextResponse.json(
      { message: "Failed to assign asset", error: error.message },
      { status: 500 }
    );
  }
};
