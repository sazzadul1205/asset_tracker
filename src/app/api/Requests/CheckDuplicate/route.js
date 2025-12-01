// api/Requests/CheckDuplicate/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Requests");

    // Extract only the params sent
    const { asset_value, requested_by_id, action_type } = await req.json();

    if (!asset_value || !requested_by_id || !action_type) {
      return NextResponse.json(
        {
          success: false,
          message: "asset_value, requested_by_id and action_type are required",
        },
        { status: 400 }
      );
    }

    // Check active duplicates (ignore accepted/rejected)
    const existing = await collection.findOne({
      "asset.value": asset_value,
      "requested_by.id": requested_by_id,
      action_type, // only match same type
      status: { $nin: ["accepted", "rejected"] }, // ignore completed requests
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Duplicate request" },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("CheckDuplicate POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};
