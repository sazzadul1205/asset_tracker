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
      "metadata",
    ];

    for (const field of requiredTop) {
      if (!(field in body)) {
        return NextResponse.json(
          { success: false, error: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Reject additional properties
    const allowedTopKeys = new Set(requiredTop);
    for (const key of Object.keys(body)) {
      if (!allowedTopKeys.has(key)) {
        return NextResponse.json(
          { success: false, error: `Unexpected field: ${key}` },
          { status: 400 }
        );
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
    // METADATA VALIDATION
    // -------------------------------
    const metadata = body.metadata;
    const requiredMetadata = ["createdAt", "updatedAt", "status"];

    if (typeof metadata !== "object" || metadata === null)
      return bad("metadata must be an object");

    const createdAt = new Date(metadata.createdAt);
    const updatedAt = new Date(metadata.updatedAt);

    if (!isDate(createdAt))
      return bad("metadata.createdAt must be a valid date");

    if (!isDate(updatedAt))
      return bad("metadata.updatedAt must be a valid date");

    if (!isString(metadata.status))
      return bad("metadata.status must be a string");

    // Reject extra metadata fields
    for (const key of Object.keys(metadata)) {
      if (!requiredMetadata.includes(key)) {
        return bad(`Unexpected metadata field: ${key}`);
      }
    }

    // -------------------------------
    // FINAL DOCUMENT (SAFE)
    // -------------------------------
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
        createdAt,
        updatedAt,
        status: metadata.status,
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


// Small helper for clean errors
function bad(message) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}
