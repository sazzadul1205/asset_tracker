// src/app/api/requests/[requestedBy]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { ObjectId } from "mongodb";

// GET : Fetch all requests
export async function GET(request, context) {
  try {
    const { requestedBy } = await context.params;
    const { searchParams } = new URL(request.url);

    // Pagination params
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 50);
    const skip = (page - 1) * limit;

    if (!requestedBy) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");
    const requestsCollection = db.collection("requests");
    const assetsCollection = db.collection("assets");

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
    if (role?.toLowerCase() === "manager" && departmentId) {
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
       3. Create deduplication pipeline for counts
    -------------------------------- */
    const dedupePipeline = [
      { $match: query },
      { $sort: { "metadata.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },
    ];

    /* --------------------------------
       4. Get paginated data AND total count in parallel
    -------------------------------- */
    const [paginatedPipeline, totalCountPipeline] = await Promise.all([
      // Paginated data pipeline
      requestsCollection
        .aggregate([...dedupePipeline, { $skip: skip }, { $limit: limit }])
        .toArray(),

      // Total count pipeline
      requestsCollection
        .aggregate([...dedupePipeline, { $count: "total" }])
        .toArray(),
    ]);

    const requests = paginatedPipeline;
    const totalItems = totalCountPipeline[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    /* --------------------------------
       5. Fetch only asset name and serial number
    -------------------------------- */
    const requestsWithAssetInfo = await Promise.all(
      requests.map(async (request) => {
        let assetInfo = null;

        if (request.assetId) {
          // Find asset by identification.tag (assetId)
          const asset = await assetsCollection.findOne(
            { "identification.tag": request.assetId },
            {
              projection: {
                _id: 0,
                "identification.name": 1,
                "details.serialNumber": 1,
                "details.status": 1,
                "details.condition": 1,
              },
            }
          );

          if (asset) {
            assetInfo = {
              name: asset.identification.name,
              serialNumber: asset.details.serialNumber,
              status: asset.details.status,
              condition: asset.details.condition,
            };
          }
        }

        return {
          ...request,
          _id: request._id.toString(),
          assetInfo,
        };
      })
    );

    /* --------------------------------
       6. Calculate request counts by type (WITH deduplication)
    -------------------------------- */
    const countPipeline = [
      ...dedupePipeline,
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ];

    const countResults = await requestsCollection
      .aggregate(countPipeline)
      .toArray();

    const allTypes = [
      "assign",
      "request",
      "return",
      "repair",
      "retire",
      "transfer",
      "update",
      "dispose",
    ];

    const detailedCounts = {};
    allTypes.forEach((type) => {
      detailedCounts[type] = 0;
    });

    countResults.forEach((result) => {
      if (result._id) {
        detailedCounts[result._id] = result.count;
      }
    });

    const total = Object.values(detailedCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    const counts = {
      total,
      detailed: detailedCounts,
    };

    /* --------------------------------
       7. Response
    -------------------------------- */
    return NextResponse.json(
      {
        success: true,
        user: { userId: requestedBy, role, departmentId },
        data: requestsWithAssetInfo,
        counts: counts,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
        },
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

// DELETE : deleted a request by its ID
export async function DELETE(request, context) {
  try {
    const { requestedBy } = await context.params;

    // Validate requestedBy as a valid ObjectId
    if (!requestedBy || !ObjectId.isValid(requestedBy)) {
      return NextResponse.json(
        { success: false, message: "Valid request ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();
    const requestsCollection = db.collection("requests");

    // Delete the request
    const result = await requestsCollection.deleteOne({
      _id: new ObjectId(requestedBy),
    });

    // Check if a request was deleted
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { success: true, message: "Request deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/requests/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
