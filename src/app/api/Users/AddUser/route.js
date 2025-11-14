// api/Users/AddUser/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

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
