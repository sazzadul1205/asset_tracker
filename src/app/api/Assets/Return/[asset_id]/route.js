// api/Assets/Return/[asset_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export const PUT = async (req, context) => {
  try {
    const params = await context.params;
    const { asset_id } = params;

    if (!asset_id) {
      return NextResponse.json(
        { message: "asset_id is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { updated_by, condition_rating } = body;

    const db = await connectDB();
    const collection = db.collection("Assets");

    // Build update object for return
    const updateDoc = {
      $set: {
        assigned_to: null,
        assigned_at: null,
        updated_by: updated_by || null,
        updated_at: new Date(),
        status: "available",
      },
    };

    // Optionally update condition rating if provided
    if (condition_rating) {
      updateDoc.$set.condition_rating = condition_rating;
    }

    const result = await collection.updateOne({ asset_id }, updateDoc, {
      upsert: false,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Asset returned successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error returning asset:", error);
    return NextResponse.json(
      { message: "Failed to return asset", error: error.message },
      { status: 500 }
    );
  }
};
