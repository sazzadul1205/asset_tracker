// src/app/api/users/MyEmployees/[userId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// GET: Fetch all users in the same department as given userId
export async function GET(request, context) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const usersCol = db.collection("users");

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    // Optional search/filter
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const role = searchParams.get("access_level");

    // 1️⃣ Find the given user to extract departmentId
    const user = await usersCol.findOne(
      { "personal.userId": userId },
      { projection: { _id: 0, "employment.departmentId": 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const departmentId = user.employment?.departmentId || "unassigned";

    // 2️⃣ Build filter for all users in the same department
    const filters = {
      "employment.departmentId": departmentId,
    };

    if (search) {
      filters.$or = [
        { "personal.name": { $regex: search, $options: "i" } },
        { "personal.phone": { $regex: search, $options: "i" } },
        { "personal.userId": { $regex: search, $options: "i" } },
        { "credentials.email": { $regex: search, $options: "i" } },
      ];
    }

    if (status) filters["personal.status"] = status;
    if (role) filters["employment.role"] = role;

    // Exclude passwords by default
    const projection = {
      "credentials.password": 0,
      "credentials.oldPassword": 0,
    };

    // 3️⃣ Count total
    const totalItems = await usersCol.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // 4️⃣ Fetch paginated users
    const users = await usersCol
      .find(filters, { projection })
      .sort({ "metadata.createdAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        departmentId,
        data: users,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/users/MyEmployees/[userId] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
