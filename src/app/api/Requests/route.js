// api/Requests/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { generateId } from "@/Utils/generateId";

// Helper to get current UTC timestamp
const getTimestamp = () => new Date().toISOString();

// GET: Fetch all Requests with optional search & pagination
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Requests");

    const {
      search,
      page = 1,
      limit = 10,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    const filters = {};
    if (search) {
      filters.request_title = { $regex: search, $options: "i" };
    }

    const total = await collection.countDocuments(filters);

    const requests = await collection
      .find(filters)
      .sort({ created_at: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: requests,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
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
