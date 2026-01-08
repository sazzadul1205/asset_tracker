// api/requests/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

/* ===============================
   HELPERS
================================ */
const bad = (msg) =>
  NextResponse.json({ success: false, error: msg }, { status: 400 });

const isString = (v) => typeof v === "string" && v.trim() !== "";
const isPlainObject = (v) =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/* ===============================
   POST /api/requests
================================ */
export async function POST(req) {
  try {
    /* -----------------------------
       SESSION (SERVER AUTHORITY)
    ----------------------------- */
    const session = await getServerSession(authOptions);
    if (!session?.user?.userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const userId = session.user.userId;

    const db = await connectDB();
    const requestsCol = db.collection("requests");
    const logsCol = db.collection("requestLogs");

    const body = await req.json();

    /* -----------------------------
       STRICT REQUEST VALIDATION
    ----------------------------- */
    const requiredTop = [
      "assetId",
      "type",
      "priority",
      "description",
      "expectedCompletion",
      "participants",
    ];

    for (const f of requiredTop) {
      if (!(f in body)) return bad(`Missing field: ${f}`);
    }

    for (const key of Object.keys(body)) {
      if (!requiredTop.includes(key)) return bad(`Unexpected field: ${key}`);
    }

    if (!isString(body.assetId)) return bad("assetId must be string");
    if (!isString(body.type)) return bad("type must be string");
    if (!isString(body.priority)) return bad("priority must be string");
    if (!isString(body.description)) return bad("description must be string");

    const expectedCompletion = new Date(body.expectedCompletion);
    if (isNaN(expectedCompletion))
      return bad("expectedCompletion must be valid date");

    if (!isPlainObject(body.participants))
      return bad("participants must be object");

    const requiredParticipants = [
      "requestedById",
      "requestedToId",
      "departmentId",
    ];

    for (const p of requiredParticipants) {
      if (!isString(body.participants[p]))
        return bad(`participants.${p} must be string`);
    }

    for (const key of Object.keys(body.participants)) {
      if (!requiredParticipants.includes(key))
        return bad(`Unexpected participants field: ${key}`);
    }

    /* -----------------------------
       CREATE REQUEST
    ----------------------------- */
    const now = new Date();

    const requestDoc = {
      assetId: body.assetId,
      type: body.type,
      priority: body.priority,
      description: body.description,
      expectedCompletion,
      participants: body.participants,
      metadata: {
        status: "pending",
        createdAt: now,
        updatedAt: now,
      },
    };

    const insertResult = await requestsCol.insertOne(requestDoc);
    const requestId = insertResult.insertedId;

    /* -----------------------------
   CREATE REQUEST LOG
   (STRICT SCHEMA MATCH)
----------------------------- */
    const logDoc = {
      requestId: new ObjectId(requestId),
      action: "created",
      performedBy: userId,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      state: "pending",
      timestamp: now,
      details: {
        type: body.type, 
        priority: body.priority,
        expectedCompletion,
        departmentId: body.participants.departmentId,
        notes: "Request created",
        additionalData: {},
      },
    };

    await logsCol.insertOne(logDoc);

    /* -----------------------------
       SUCCESS
    ----------------------------- */
    return NextResponse.json(
      {
        success: true,
        requestId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/requests]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Fetch requests with pagination, filtering, and asset details
export async function GET(request) {
  try {
    const db = await connectDB();
    const requestsCol = db.collection("requests");
    const assetsCol = db.collection("assets");

    const { searchParams } = new URL(request.url);

    // Pagination (safe defaults)
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const assetId = searchParams.get("assetId");
    const requestedById = searchParams.get("requestedById");
    const requestedToId = searchParams.get("requestedToId");
    const departmentId = searchParams.get("departmentId");

    // Date range filters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build Mongo filter
    const filters = {};

    if (search) {
      filters.$or = [
        { description: { $regex: search, $options: "i" } },
        { assetId: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filters["metadata.status"] = status;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;
    if (assetId) filters.assetId = assetId;
    if (requestedById) filters["participants.requestedById"] = requestedById;
    if (requestedToId) filters["participants.requestedToId"] = requestedToId;
    if (departmentId) filters["participants.departmentId"] = departmentId;

    if (startDate || endDate) {
      filters["metadata.createdAt"] = {};
      if (startDate) filters["metadata.createdAt"].$gte = new Date(startDate);
      if (endDate) filters["metadata.createdAt"].$lte = new Date(endDate);
    }

    // Total count
    const totalItems = await requestsCol.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated requests
    const requests = await requestsCol
      .find(filters)
      .sort({ "metadata.createdAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Fetch asset details for each request
    const requestsWithAssetDetails = await Promise.all(
      requests.map(async (request) => {
        try {
          const asset = await assetsCol.findOne(
            { "identification.tag": request.assetId },
            {
              projection: {
                "identification.tag": 1,
                "identification.name": 1,
                "identification.categoryId": 1,
                "details.serialNumber": 1,
                "details.status": 1,
                "details.condition": 1,
                "purchase.location": 1,
              },
            }
          );

          return {
            ...request,
            assetDetails: asset
              ? {
                  tag: asset.identification.tag,
                  name: asset.identification.name,
                  categoryId: asset.identification.categoryId || null,
                  serialNumber: asset.details?.serialNumber || null,
                  status: asset.details?.status || null,
                  condition: asset.details?.condition || null,
                  location: asset.purchase?.location || null,
                }
              : null,
          };
        } catch (error) {
          console.error(
            `Error fetching asset for request ${request._id}:`,
            error
          );
          return {
            ...request,
            assetDetails: null,
          };
        }
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: requestsWithAssetDetails,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/requests error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
