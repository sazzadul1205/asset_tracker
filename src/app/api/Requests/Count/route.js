// api/Requests/Count/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Requests");

    // Read query param ?email=someone@example.com
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Build filter
    const filter = email ? { requested_by: email } : {};

    // 1. Count all matching documents
    const totalCount = await collection.countDocuments(filter);

    // 2. Build aggregated action_type counts
    const pipeline = [
      { $match: filter },
      {
        $group: {
          _id: "$action_type",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          action_type: "$_id",
          count: 1,
        },
      },
    ];

    const actionBreakdownArray = await collection.aggregate(pipeline).toArray();

    // Convert array → object format you want
    const actionBreakdown = {};
    actionBreakdownArray.forEach((item) => {
      actionBreakdown[item.action_type] = item.count;
    });

    return NextResponse.json({
      success: true,
      total: totalCount,
      detailed: actionBreakdown,
    });
  } catch (error) {
    console.error("GET /Requests/Count error:", error);
    return (
      NextResponse.json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      }),
      { status: 500 }
    );
  }
};
