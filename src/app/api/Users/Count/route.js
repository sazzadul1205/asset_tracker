// api/Users/count/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export async function GET(req) {
  try {
    // Connect to MongoDB
    const db = await connectDB();
    const usersCollection = db.collection("Users");

    // Get the department from query params
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    if (!department) {
      return NextResponse.json(
        { error: "Department is required" },
        { status: 400 }
      );
    }

    // Count users matching the department
    const count = await usersCollection.countDocuments({ department });

    return NextResponse.json({ department, count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user count:", error);
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
}
