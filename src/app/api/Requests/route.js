// api/Requests/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { generateId } from "@/Utils/generateId";

// Helper to get current UTC timestamp
const getTimestamp = () => new Date().toISOString();

// GET: Fetch all Requests with optional search, pagination, requested_by OR assigned_to
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Requests");

    const {
      search,
      requested_by,
      assigned_to,
      page = 1,
      limit = 10,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const filters = {};
    const orConditions = [];

    // Search by asset label
    if (search) {
      filters["asset.label"] = { $regex: search, $options: "i" };
    }

    // requested_by condition
    if (requested_by) {
      orConditions.push({ "requested_by.email": requested_by });
    }

    // assigned_to condition
    if (assigned_to) {
      orConditions.push({ "assign_to.value": assigned_to });
    }

    // Apply OR only if conditions exist
    if (orConditions.length > 0) {
      filters["$or"] = orConditions;
    }

    const total = await collection.countDocuments(filters);

    const requests = await collection
      .find(filters)
      .sort({ created_at: -1, _id: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray();

    // Ensure unique by request_id (optional safety)
    const unique = Array.from(
      new Map(requests.map((r) => [r.request_id, r])).values()
    );

    return NextResponse.json(
      {
        success: true,
        data: unique,
        total: unique.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(unique.length / limitNum),
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
