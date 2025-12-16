// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// Bcrypt
import bcrypt from "bcrypt";

// POST: Create User
export async function POST(req) {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const body = await req.json();
    const { personal, credentials, employment } = body;

    // --- Validation ---
    const missingFields = [];
    if (!personal?.name) missingFields.push("personal.name");
    if (!personal?.phone) missingFields.push("personal.phone");
    if (!personal?.hireDate) missingFields.push("personal.hireDate");
    if (!personal?.status) missingFields.push("personal.status");
    if (!personal?.userId) missingFields.push("personal.userId");
    if (!credentials?.email) missingFields.push("credentials.email");
    if (!credentials?.password) missingFields.push("credentials.password");
    if (!employment?.departmentId)
      missingFields.push("employment.departmentId");
    if (!employment?.position) missingFields.push("employment.position");
    if (!employment?.role) missingFields.push("employment.role");
    if (!employment?.lastUpdatedBy)
      missingFields.push("employment.lastUpdatedBy");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // --- Uniqueness checks ---
    if (
      await usersCollection.findOne({ "credentials.email": credentials.email })
    ) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 409 }
      );
    }
    if (await usersCollection.findOne({ "personal.userId": personal.userId })) {
      return NextResponse.json(
        { success: false, error: "UserId already exists" },
        { status: 409 }
      );
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    // --- Prepare user document ---
    const newUser = {
      personal: {
        name: personal.name,
        phone: personal.phone,
        hireDate: new Date(personal.hireDate?.$date || personal.hireDate),
        status: personal.status,
        userId: personal.userId,
      },
      credentials: {
        email: credentials.email,
        password: hashedPassword,
        oldPassword: "",
        lastLogin: new Date(),
      },
      employment: {
        departmentId: employment.departmentId,
        position: employment.position,
        role: employment.role,
        lastUpdatedBy: employment.lastUpdatedBy,
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/users] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Fetch Users (exclude passwords by default)
export async function GET(request) {
  try {
    const db = await connectDB();
    const usersCol = db.collection("users");

    const { searchParams } = new URL(request.url);

    // Pagination (safe defaults)
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const role = searchParams.get("access_level");
    const department = searchParams.get("department");

    // Include sensitive fields?
    const includeSecrets = searchParams.get("includeSecrets") === "true";

    // Build Mongo filter
    const filters = {};

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
    if (department) filters["employment.departmentId"] = department;

    // Projection (security first)
    const projection = includeSecrets
      ? {}
      : {
          "credentials.password": 0,
          "credentials.oldPassword": 0,
        };

    // Total count
    const totalItems = await usersCol.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated data
    const users = await usersCol
      .find(filters, { projection })
      .sort({ "metadata.createdAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        success: true,
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
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
