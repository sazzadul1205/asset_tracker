// src/app/api/allCounts/[manager_Id]/route.js
 

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const { manager_Id } = params;

    if (!manager_Id) {
      return NextResponse.json(
        { success: false, message: "Manager ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const usersCol = db.collection("users");
    const assetsCol = db.collection("assets");
    const requestsCol = db.collection("requests");
    const departmentCol = db.collection("department");

    /* ======================================
       1️⃣ Find manager & department
    ====================================== */
    const manager = await usersCol.findOne({
      "personal.userId": manager_Id,
    });

    if (!manager) {
      return NextResponse.json(
        { success: false, message: "Manager not found" },
        { status: 404 }
      );
    }

    const departmentId = manager?.employment?.departmentId;

    if (!departmentId || departmentId === "unassigned") {
      return NextResponse.json(
        {
          success: true,
          counts: {
            users: 0,
            assets: 0,
            requests: {
              pending: 0,
              rejected: 0,
              accepted: 0,
            },
            departments: 0,
          },
        },
        { status: 200 }
      );
    }

    /* ======================================
       2️⃣ Get all users in department
    ====================================== */
    const departmentUsers = await usersCol
      .find({ "employment.departmentId": departmentId })
      .project({ "personal.userId": 1 })
      .toArray();

    const userIds = departmentUsers.map((u) => u.personal.userId);

    const usersCount = userIds.length;

    /* ======================================
       3️⃣ Count assets assigned to users
    ====================================== */
    const assetsCount = await assetsCol.countDocuments({
      "assigned.assignedTo": { $in: userIds },
    });

    /* ======================================
       4️⃣ Fetch requests by users
    ====================================== */
    const requests = await requestsCol
      .find({
        "participants.requestedById": { $in: userIds },
      })
      .project({ "metadata.status": 1 })
      .toArray();

    let pending = 0;
    let rejected = 0;
    let accepted = 0;

    for (const req of requests) {
      switch (req.metadata.status) {
        case "pending":
          pending++;
          break;
        case "rejected":
          rejected++;
          break;
        case "accepted":
        case "approved":
          accepted++;
          break;
      }
    }

    /* ======================================
       5️⃣ Department count (always 1 here)
    ====================================== */
    const departmentsCount = await departmentCol.countDocuments({
      departmentId,
    });

    /* ======================================
       ✅ Response
    ====================================== */
    return NextResponse.json(
      {
        success: true,
        departmentId,
        counts: {
          users: usersCount,
          assets: assetsCount,
          requests: {
            pending,
            rejected,
            accepted,
          },
          departments: departmentsCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/allCounts/:manager_Id]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
