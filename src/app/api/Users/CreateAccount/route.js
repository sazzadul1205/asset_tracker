// api/Users/CreateAccount/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

// Bcrypt
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    // Connect to MongoDB
    const db = await connectDB();

    // Parse the request body
    const body = await req.json();
    const { name, email, password } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.collection("Users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "Employee",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("Users").insertOne(newUser);

    return NextResponse.json(
      { message: "Account created successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("CreateAccount Error:", error);
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
    );
  }
}
