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

    // Check if user is a manager based on role, not position
    const isManager = user?.employment?.role?.toLowerCase() === "manager";

    let userIds = [];
    let usersCount = 0;

    if (isManager) {
      // 2️⃣ Manager → all users in the department (EXCLUDING THE MANAGER THEMSELVES)
      const departmentId = user?.employment?.departmentId;

      if (!departmentId || departmentId === "unassigned") {
        return NextResponse.json({
          success: true,
          isManager: true,
          counts: {
            users: 0,
            assets: 0,
            requests: { pending: 0, rejected: 0, accepted: 0 },
            departments: 0,
          },
        });
      }

      // Get all users in the department EXCEPT the manager themselves
      const departmentUsers = await usersCol
        .find({
          "employment.departmentId": departmentId,
          "personal.userId": { $ne: manager_Id }, // Exclude manager from count
        })
        .project({ "personal.userId": 1, "employment.role": 1 })
        .toArray();

      userIds = departmentUsers.map((u) => u.personal.userId);
      usersCount = userIds.length;

      // Include manager's own ID for asset and request queries if needed
      userIds = [...userIds, manager_Id];
    } else {
      // 2️⃣ Non-manager → only own ID
      userIds = [manager_Id];
      usersCount = 0; // For non-manager, they don't have "users" count
    }

    // 3️⃣ Count assets assigned to the user(s)
    // For manager: count assets assigned to any department member (including themselves)
    // For non-manager: count assets assigned only to themselves
    const assetsCount = await assetsCol.countDocuments({
      "assigned.assignedTo": { $in: userIds },
    });

    // 4️⃣ Count requests
    // Count requests where the user(s) are either requester OR requestedTo
    const allRequests = await requestsCol
      .find({
        $or: [
          { "participants.requestedById": { $in: userIds } },
          { "participants.requestedToId": { $in: userIds } },
        ],
      })
      .project({
        "metadata.status": 1,
        "participants.requestedById": 1,
        "participants.requestedToId": 1,
      })
      .toArray();

    let pending = 0,
      rejected = 0,
      accepted = 0;

    for (const req of allRequests) {
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
      isManager: isManager,
      departmentId: user?.employment?.departmentId || null,
      counts: {
        users: usersCount, // This is the count of employees under manager (excluding manager)
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
