// api/Users/ByEmail/[email]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * GET Method - Fetch user by email
 *
 * Steps:
 * 1. Validate email param
 * 2. Fetch user from DB using identity.email
 * 3. Remove sensitive info before returning
 */
export const GET = async (req, context) => {
  try {
    // Extract email from URL params
    const { email } = context.params;

    // Validate
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();

    // Fetch user by email inside identity object
    const user = await db
      .collection("Users")
      .findOne({ "identity.email": email });

    // Check if user exists
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove sensitive info like password before returning
    const { security, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
};
