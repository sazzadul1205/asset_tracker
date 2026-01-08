// src/app/api/users/EmployeeManager/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

const ADMIN_FALLBACK = {
  name: "Admin",
  email: "admin@gmail.com",
  departmentId: null,
  userId: null,
};

export async function POST(request) {
  try {
    const { requestedById, requestedToId } = await request.json();

    if (!requestedById || !requestedToId) {
      return NextResponse.json(
        {
          success: false,
          message: "Both requestedById and requestedToId are required",
        },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const usersCol = db.collection("users");
    const departmentsCol = db.collection("departments");

    // --------------------------------------
    // Helper: resolve user by userId
    // --------------------------------------
    const resolveUser = async (userId) => {
      const user = await usersCol.findOne({
        "personal.userId": userId,
      });

      if (!user) return null;

      return {
        name: user.personal?.name,
        email: user.credentials?.email,
        departmentId: user.employment?.departmentId || null,
        userId: user.personal?.userId || null,
      };
    };

    // --------------------------------------
    // Helper: resolve manager via user
    // --------------------------------------
    const resolveManagerFromUser = async (userId) => {
      const user = await resolveUser(userId);
      if (!user?.departmentId) return ADMIN_FALLBACK;

      const department = await departmentsCol.findOne({
        departmentId: user.departmentId,
      });

      if (!department?.managerUserId) return ADMIN_FALLBACK;

      const manager = await usersCol.findOne({
        "personal.userId": department.managerUserId,
      });

      if (!manager) return ADMIN_FALLBACK;

      return {
        name: manager.personal?.name || ADMIN_FALLBACK.name,
        email: manager.credentials?.email || ADMIN_FALLBACK.email,
        departmentId: manager.employment?.departmentId || null,
        userId: manager.personal?.userId || null,
      };
    };

    // --------------------------------------
    // Invalid: both "-"
    // --------------------------------------
    if (requestedById === "-" && requestedToId === "-") {
      return NextResponse.json({
        success: true,
        data: {
          requestedBy: ADMIN_FALLBACK,
          requestedTo: ADMIN_FALLBACK,
        },
      });
    }

    // --------------------------------------
    // Resolve requestedBy
    // --------------------------------------
    const requestedBy =
      requestedById === "-"
        ? await resolveManagerFromUser(requestedToId)
        : (await resolveUser(requestedById)) || ADMIN_FALLBACK;

    // --------------------------------------
    // Resolve requestedTo
    // --------------------------------------
    const requestedTo =
      requestedToId === "-"
        ? await resolveManagerFromUser(requestedById)
        : (await resolveUser(requestedToId)) || ADMIN_FALLBACK;

    return NextResponse.json({
      success: true,
      data: {
        requestedBy,
        requestedTo,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
