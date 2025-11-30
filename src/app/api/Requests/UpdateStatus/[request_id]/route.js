// api/Requests/UpdateStatus/[request_id]/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const PATCH = async (req, context) => {
  try {
    const params = await context.params;
    const { request_id } = params;

    if (!request_id) {
      return NextResponse.json(
        { error: "Missing request_id parameter" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Missing status in request body" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Requests");

    const updateResult = await collection.updateOne(
      { request_id },
      { $set: { status } },
      { upsert: false }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Status updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /Requests/UpdateStatus error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
};
