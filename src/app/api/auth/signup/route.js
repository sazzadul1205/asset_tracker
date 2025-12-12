import { connectDB } from "@/lib/connectDB";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const db = await connectDB();
    const {
      name,
      email,
      password,
      role = "Employee",
      departmentId = "",
    } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "All fields required" }), {
        status: 400,
      });
    }

    // Check if user already exists
    const existingUser = await db
      .collection("Users")
      .findOne({ "credentials.email": email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
      });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = {
      personal: {
        name,
        phone: "",
        hireDate: new Date(),
        status: "active",
        userId: `USR-${Date.now()}`, // simple unique ID
      },
      credentials: {
        email,
        password: hashedPassword,
        lastLogin: null,
      },
      employment: {
        role,
        position: "",
        departmentId,
        lastUpdatedBy: "SYSTEM",
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    await db.collection("user").insertOne(newUser);

    return new Response(
      JSON.stringify({ success: true, message: "Account created" }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
