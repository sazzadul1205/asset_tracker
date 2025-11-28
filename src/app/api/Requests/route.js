// api/Requests/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { generateId } from "@/Utils/generateId";

// Helper to get current UTC timestamp
const getTimestamp = () => new Date().toISOString();

// GET: Fetch all Requests with optional search, pagination & requested_by filter
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Requests");

    const {
      search,
      requested_by,
      page = 1,
      limit = 10,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const filters = {};

    // Filter by search term (asset label)
    if (search) {
      filters["asset.label"] = { $regex: search, $options: "i" };
    }

    // Filter by requested_by if provided
    if (requested_by) {
      filters["requested_by.email"] = requested_by;
    }

    const total = await collection.countDocuments(filters);

    const requests = await collection
      .find(filters)
      .sort({ created_at: -1, _id: -1 }) // added _id for tie-breaking
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: requests,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /Requests error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while fetching requests",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
};

// POST: Create a new Request
export const POST = async (request) => {
  try {
    const data = await request.json();

    // Connect to DB
    const db = await connectDB();
    const collection = db.collection("Requests");

    // Generate unique request ID
    let uniqueRequestId;
    const allIds = await collection
      .find({}, { projection: { request_id: 1 } })
      .toArray();
    const existingIds = allIds.map((item) => item.request_id);

    do {
      uniqueRequestId = generateId(10, "REQ_");
    } while (existingIds.includes(uniqueRequestId));

    // Merge client data with server-generated fields
    const newRequest = {
      ...data, // all client-provided fields
      request_id: uniqueRequestId,
      created_at: getTimestamp,
      updated_at: getTimestamp,
    };

    const result = await collection.insertOne(newRequest);

    if (!result.acknowledged) {
      throw new Error("Failed to create request");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Request created successfully",
        requestId: result.insertedId,
        request_id: uniqueRequestId,
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /Requests error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
};
