// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// Bcrypt
import bcrypt from "bcrypt";

// POST: Create User
export async function POST(req) {
  try {
    const db = await connectDB();
    const {
      name,
      email,
      password,
      phone = "",
      role = "Employee",
      departmentId = "",
      position = "",
    } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .collection("Users")
      .findOne({ "credentials.email": email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build new user object following your strict schema
    const newUser = {
      personal: {
        name,
        phone,
        hireDate: new Date(),
        status: "active",
        userId: `USR-${Date.now()}`,
      },
      credentials: {
        email,
        password: hashedPassword,
        oldPassword: "",
        lastLogin: null,
      },
      employment: {
        departmentId,
        position,
        role,
        lastUpdatedBy: "SYSTEM",
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    await db.collection("Users").insertOne(newUser);

    return NextResponse.json(
      { success: true, message: "User created successfully", data: newUser },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users error:", err);
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
