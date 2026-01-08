// src/app/api/allCounts/[manager_Id]/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export async function GET(req, context) {
  try {
    const { manager_Id } = await context.params;

    if (!manager_Id) {
      return NextResponse.json(
        { success: false, message: "Manager/User ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const usersCol = db.collection("users");
    const assetsCol = db.collection("assets");
    const requestsCol = db.collection("requests");
    const departmentCol = db.collection("department");

    // 1️⃣ Fetch the user
    const user = await usersCol.findOne({ "personal.userId": manager_Id });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isManager = user?.employment?.position
      ?.toLowerCase()
      .includes("manager");
    let userIds = [];
    let usersCount = 0;

    if (isManager) {
      // 2️⃣ Manager → all users in the department
      const departmentId = user?.employment?.departmentId;

      if (!departmentId || departmentId === "unassigned") {
        return NextResponse.json({
          success: true,
          counts: {
            users: 0,
            assets: 0,
            requests: { pending: 0, rejected: 0, accepted: 0 },
            departments: 0,
          },
        });
      }

      const departmentUsers = await usersCol
        .find({ "employment.departmentId": departmentId })
        .project({ "personal.userId": 1 })
        .toArray();

      userIds = departmentUsers.map((u) => u.personal.userId);
      usersCount = userIds.length;
    } else {
      // 2️⃣ Non-manager → only own ID
      userIds = [manager_Id];
      usersCount = 1;
    }

    // 3️⃣ Count assets assigned to the user(s)
    const assetsCount = await assetsCol.countDocuments({
      "assigned.assignedTo": { $in: userIds },
    });

    // 4️⃣ Count requests
    const requests = await requestsCol
      .find({
        "participants.requestedById": { $in: userIds },
      })
      .project({ "metadata.status": 1 })
      .toArray();

    let pending = 0,
      rejected = 0,
      accepted = 0;

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

    // 5️⃣ Department count (only relevant for managers)
    const departmentsCount = isManager
      ? await departmentCol.countDocuments({
          departmentId: user?.employment?.departmentId,
        })
      : 0;

    // 6️⃣ Response
    return NextResponse.json({
      success: true,
      departmentId: user?.employment?.departmentId || null,
      counts: {
        users: usersCount,
        assets: assetsCount,
        requests: { pending, rejected, accepted },
        departments: departmentsCount,
      },
    });
  } catch (error) {
    console.error("[GET /api/allCounts/:manager_Id] ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
