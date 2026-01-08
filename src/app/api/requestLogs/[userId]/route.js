// src/app/api/requestLogs/route.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/connectDB";

const bad = (msg) =>
  NextResponse.json({ success: false, error: msg }, { status: 400 });

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    console.log(userId);
    

    if (!userId) return bad("Missing userId parameter");

    const db = await connectDB();
    const usersCol = db.collection("users");
    const logsCol = db.collection("requestLogs");

    // -------------------------------
    // 1️⃣ Fetch user info
    // -------------------------------
    const user = await usersCol.findOne({ "personal.userId": userId });
    if (!user) return bad("User not found");

    const position = user?.employment?.position || "";
    const departmentId = user?.employment?.departmentId || null;

    const isManager = position.toLowerCase().includes("manager");

    let performedByIds = [];

    if (isManager && departmentId) {
      // -------------------------------
      // 2️⃣ Manager: all users in department
      // -------------------------------
      const departmentUsers = await usersCol
        .find({ "employment.departmentId": departmentId })
        .project({ "personal.userId": 1 })
        .toArray();

      performedByIds = departmentUsers.map((u) => u.personal.userId);

      if (!performedByIds.length) {
        console.warn(
          "[WARN] Manager has no department users, defaulting to self",
          userId
        );
        performedByIds = [userId];
      }

      console.log("[DEBUG] Manager performedByIds:", performedByIds);
    } else {
      // -------------------------------
      // 2️⃣ Non-manager or missing department: use own ID
      // -------------------------------
      performedByIds = [userId];
      console.log("[DEBUG] Non-manager performedByIds:", performedByIds);
    }

    // -------------------------------
    // 3️⃣ Build requestLogs filter
    // -------------------------------
    const filter = { performedBy: { $in: performedByIds } };

    // Optional filters
    const requestId = searchParams.get("requestId");
    if (requestId) {
      if (!ObjectId.isValid(requestId)) return bad("Invalid requestId");
      filter._id = new ObjectId(requestId);
    }

    const states = searchParams.get("states");
    if (states) {
      const arr = states
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) filter.state = { $in: arr };
    }

    const types = searchParams.get("types");
    if (types) {
      const arr = types
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (arr.length) filter["details.type"] = { $in: arr };
    }

    const action = searchParams.get("action");
    if (action) filter.action = action;

    // -------------------------------
    // 4️⃣ Pagination
    // -------------------------------
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
    const skip = (page - 1) * limit;

    console.log(
      "[DEBUG] RequestLogs filter:",
      filter,
      "page:",
      page,
      "limit:",
      limit
    );

    // -------------------------------
    // 5️⃣ Query requestLogs
    // -------------------------------
    const logs = await logsCol
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await logsCol.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + logs.length < total,
      },
    });
  } catch (err) {
    console.error("[GET /api/requestLogs] ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
