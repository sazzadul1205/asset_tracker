// src/app/api/requests/[requestedBy]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export async function GET(request, context) {
  try {
    const { requestedBy } = await context.params;

    if (!requestedBy) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");
    const requestsCollection = db.collection("requests");

    /* --------------------------------
       1. Fetch current user
    -------------------------------- */
    const user = await usersCollection.findOne(
      { "personal.userId": requestedBy },
      {
        projection: {
          _id: 0,
          "personal.userId": 1,
          "employment.role": 1,
          "employment.departmentId": 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const role = user.employment?.role;
    const departmentId = user.employment?.departmentId;

    let query = {};

    /* --------------------------------
       2. Build query based on role
    -------------------------------- */
    if (role === "manager" && departmentId) {
      // Manager → requests from department users
      const departmentUsers = await usersCollection
        .find(
          { "employment.departmentId": departmentId },
          { projection: { _id: 0, "personal.userId": 1 } }
        )
        .toArray();

      const userIds = departmentUsers.map((u) => u.personal.userId);

      query = {
        $or: [
          { "participants.requestedById": { $in: userIds } },
          { "participants.requestedToId": { $in: userIds } },
        ],
      };
    } else if (role === "admin") {
      // Admin → get all requests
      query = {}; // empty query → fetch everything
    } else {
      // Regular user → only their own requests
      query = {
        $or: [
          { "participants.requestedById": requestedBy },
          { "participants.requestedToId": requestedBy },
        ],
      };
    }

    /* --------------------------------
       3. Fetch requests without duplicates
    -------------------------------- */
    const requests = await requestsCollection
      .aggregate([
        { $match: query },
        { $sort: { "metadata.createdAt": -1 } },
        {
          $group: {
            _id: "$_id", // unique by request ID
            doc: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$doc" } },
      ])
      .toArray();

    /* --------------------------------
       4. Response
    -------------------------------- */
    return NextResponse.json(
      {
        success: true,
        user: { userId: requestedBy, role, departmentId },
        data: requests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/requests/[requestedBy] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
