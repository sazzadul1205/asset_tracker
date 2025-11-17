// api/Users/ByEmail/[email]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// GET Method - Fetch user by email
export const GET = async (req, context) => {
  try {
    const params = await context.params; // <-- await here
    const { email } = params;

    if (!email) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const user = await db.collection("Users").findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = user; // Remove sensitive info
    return NextResponse.json(safeUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
};
