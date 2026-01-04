// src/app/api/requests/Rejected/[id]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { ObjectId } from "mongodb";

export async function PUT(req, context) {
  try {
    const db = await connectDB();
    const requestsCollection = db.collection("requests");

    // Must await context.params
    const params = await context.params;
    const { id } = params;

    // Validate ObjectId
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid request ID is required" },
        { status: 400 }
      );
    }

    const result = await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "metadata.status": "rejected",
          "metadata.updatedAt": new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error rejecting request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject request" },
      { status: 500 }
    );
  }
}
