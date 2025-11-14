// api/Users/route.js
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// POST Method - Add a new user
export async function POST(req) {
  try {
    const db = await connectDB();
    const body = await req.json();

    const {
      full_name,
      email,
      employee_id,
      phone,
      department,
      position,
      hire_date,
      status,
      access_level,
      password,
      created_by = "system", // optional – you can override
    } = body;

    // 1. Validate inputs
    if (
      !full_name ||
      !email ||
      !employee_id ||
      !phone ||
      !department ||
      !position ||
      !hire_date ||
      !status ||
      !access_level ||
      !password
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // 2. Check duplicates
    const existingEmail = await db.collection("Users").findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    const existingEmpID = await db.collection("Users").findOne({ employee_id });

    if (existingEmpID) {
      return NextResponse.json(
        { message: "Employee ID already exists" },
        { status: 409 }
      );
    }

    // 3. Encrypt password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Prepare user object
    const newUser = {
      full_name,
      email,
      employee_id,
      phone,
      department,
      position,
      hire_date: new Date(hire_date),
      status,
      access_level,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
      created_by,
    };

    // 5. Insert into DB
    await db.collection("Users").insertOne(newUser);

    return NextResponse.json(
      { message: "User added successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("AddUser Error:", error);
    return NextResponse.json(
      { message: "Failed to add user" },
      { status: 500 }
    );
  }
}

// GET Method - Fetch Users with pagination & optional search
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Users");

    // Parse query params
    const {
      search,
      page = 1,
      limit = 10,
      status,
      department,
      access_level,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    // Filters
    const filters = {};

    // Search by name, email, phone, employee_id
    if (search) {
      filters.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { employee_id: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) filters.status = status;

    // Filter by department
    if (department) filters.department = department;

    // Filter by access level
    if (access_level) filters.access_level = access_level;

    // Total count
    const total = await collection.countDocuments(filters);

    // Fetch paginated users
    const users = await collection
      .find(filters)
      .sort({ created_at: -1 }) // newest first
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: users,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while fetching users",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
