// src/app/api/allCounts/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export async function GET() {
  try {
    const db = await connectDB();

    const usersCol = db.collection("users");
    const assetsCol = db.collection("assets");
    const requestsCol = db.collection("requests");
    const departmentCol = db.collection("department");

    // Run counts in parallel (faster, old-school sensible)
    const [usersCount, assetsCount, pendingRequestsCount, departmentsCount] =
      await Promise.all([
        usersCol.countDocuments(),
        assetsCol.countDocuments(),
        requestsCol.countDocuments({ "metadata.status": "pending" }),
        departmentCol.countDocuments(),
      ]);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        counts: {
          users: usersCount,
          assets: assetsCount,
          pendingRequests: pendingRequestsCount,
          departments: departmentsCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/allCounts]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
