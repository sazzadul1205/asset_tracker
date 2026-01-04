// src/app/api/requests/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// Helper: strict type checks
const isString = (v) => typeof v === "string" && v.trim() !== "";
const isDate = (v) => v instanceof Date && !isNaN(v.valueOf());

export async function POST(req) {
  try {
    const db = await connectDB();
    const requestsCollection = db.collection("requests");

    const body = await req.json();

    // -------------------------------
    // STRICT TOP-LEVEL VALIDATION
    // -------------------------------
    const requiredTop = [
      "assetId",
      "type",
      "priority",
      "description",
      "expectedCompletion",
      "participants",
    ];

    for (const field of requiredTop) {
      if (!(field in body)) {
        return bad(`Missing field: ${field}`);
      }
    }

    // Reject additional properties
    const allowedTopKeys = new Set(requiredTop);
    for (const key of Object.keys(body)) {
      if (!allowedTopKeys.has(key)) {
        return bad(`Unexpected field: ${key}`);
      }
    }

    // -------------------------------
    // FIELD TYPE VALIDATION
    // -------------------------------
    if (!isString(body.assetId)) return bad("assetId must be a string");
    if (!isString(body.type)) return bad("type must be a string");
    if (!isString(body.priority)) return bad("priority must be a string");
    if (!isString(body.description)) return bad("description must be a string");

    const expectedCompletion = new Date(body.expectedCompletion);
    if (!isDate(expectedCompletion))
      return bad("expectedCompletion must be a valid date");

    // -------------------------------
    // PARTICIPANTS VALIDATION
    // -------------------------------
    const participants = body.participants;
    const requiredParticipants = [
      "requestedById",
      "requestedToId",
      "departmentId",
    ];

    if (typeof participants !== "object" || participants === null)
      return bad("participants must be an object");

    for (const field of requiredParticipants) {
      if (!isString(participants[field])) {
        return bad(`participants.${field} must be a string`);
      }
    }

    // Reject extra participant fields
    for (const key of Object.keys(participants)) {
      if (!requiredParticipants.includes(key)) {
        return bad(`Unexpected participants field: ${key}`);
      }
    }

    // -------------------------------
    // FINAL DOCUMENT (SERVER AUTHORITY)
    // -------------------------------
    const now = new Date();

    const requestDoc = {
      assetId: body.assetId,
      type: body.type,
      priority: body.priority,
      description: body.description,
      expectedCompletion,
      participants: {
        requestedById: participants.requestedById,
        requestedToId: participants.requestedToId,
        departmentId: participants.departmentId,
      },
      metadata: {
        createdAt: now,
        updatedAt: now,
        status: "pending",
      },
    };

    await requestsCollection.insertOne(requestDoc);

    return NextResponse.json(
      { success: true, message: "Request created successfully" },
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

// -------------------------------
// Helper
// -------------------------------
function bad(message) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}
