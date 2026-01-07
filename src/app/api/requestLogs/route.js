// src/app/api/requestLogs/route.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/connectDB";

/* -------------------------------------------------
   HELPERS (STRICT & BORING — THE GOOD KIND)
------------------------------------------------- */
const isString = (v) => typeof v === "string" && v.trim() !== "";
const isPlainObject = (v) =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const bad = (msg) =>
  NextResponse.json({ success: false, error: msg }, { status: 400 });

/* =================================================
   GET /api/requestLogs
   - Optional filters:
     ?requestId=<ObjectId>
     ?state=pending
     ?action=created
================================================= */
export async function GET(req) {
  try {
    const db = await connectDB();
    const logsCol = db.collection("requestLogs");

    const { searchParams } = new URL(req.url);

    // Pagination params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (searchParams.get("requestId")) {
      const id = searchParams.get("requestId");
      if (!ObjectId.isValid(id))
        return NextResponse.json(
          { success: false, error: "Invalid requestId" },
          { status: 400 }
        );
      filter._id = new ObjectId(id);
    }
    if (searchParams.get("state")) {
      filter.state = searchParams.get("state");
    }
    if (searchParams.get("action")) {
      filter.action = searchParams.get("action");
    }

    // Fetch paginated logs
    const logs = await logsCol
      .find(filter)
      .sort({ timestamp: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .toArray();

    // Total count for this filter
    const total = await logsCol.countDocuments(filter);

    // Return JSON
    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        hasMore: skip + logs.length < total, // for infinite scroll
        total,
      },
    });
  } catch (err) {
    console.error("[GET /api/requestLogs]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =================================================
   POST /api/requestLogs
   STRICTLY MATCHES YOUR JSON SCHEMA
================================================= */
export async function POST(req) {
  try {
    const db = await connectDB();
    const logsCol = db.collection("requestLogs");

    const body = await req.json();

    /* -----------------------------
       TOP-LEVEL STRICT VALIDATION
    ----------------------------- */
    const requiredTop = [
      "requestId",
      "action",
      "performedBy",
      "ipAddress",
      "state",
      "timestamp",
      "details",
    ];

    for (const field of requiredTop) {
      if (!(field in body)) return bad(`Missing field: ${field}`);
    }

    for (const key of Object.keys(body)) {
      if (!requiredTop.includes(key)) return bad(`Unexpected field: ${key}`);
    }

    /* -----------------------------
       FIELD TYPE VALIDATION
    ----------------------------- */
    if (!ObjectId.isValid(body.requestId))
      return bad("requestId must be ObjectId");

    if (!isString(body.action)) return bad("action must be string");
    if (!isString(body.performedBy)) return bad("performedBy must be string");
    if (!isString(body.ipAddress)) return bad("ipAddress must be string");
    if (!isString(body.state)) return bad("state must be string");

    const timestamp = new Date(body.timestamp);
    if (isNaN(timestamp)) return bad("timestamp must be valid date");

    /* -----------------------------
       DETAILS OBJECT (STRICT)
    ----------------------------- */
    if (!isPlainObject(body.details)) return bad("details must be an object");

    const allowedDetails = [
      "priority",
      "expectedCompletion",
      "notes",
      "departmentId",
      "additionalData",
    ];

    for (const key of Object.keys(body.details)) {
      if (!allowedDetails.includes(key))
        return bad(`Unexpected details field: ${key}`);
    }

    if ("priority" in body.details && !isString(body.details.priority))
      return bad("details.priority must be string");

    if ("notes" in body.details && !isString(body.details.notes))
      return bad("details.notes must be string");

    if ("departmentId" in body.details && !isString(body.details.departmentId))
      return bad("details.departmentId must be string");

    if ("expectedCompletion" in body.details) {
      const d = new Date(body.details.expectedCompletion);
      if (isNaN(d)) return bad("details.expectedCompletion must be date");
      body.details.expectedCompletion = d;
    }

    if (
      "additionalData" in body.details &&
      !isPlainObject(body.details.additionalData)
    )
      return bad("details.additionalData must be object");

    /* -----------------------------
       FINAL DOCUMENT
    ----------------------------- */
    const logDoc = {
      requestId: new ObjectId(body.requestId),
      action: body.action,
      performedBy: body.performedBy,
      ipAddress: body.ipAddress,
      state: body.state,
      timestamp,
      details: body.details,
    };

    await logsCol.insertOne(logDoc);

    return NextResponse.json(
      { success: true, message: "Request log created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/requestLogs]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
