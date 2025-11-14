// api/Users/BasicInfo/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// GET Method - Fetch Users Basic Info
export const GET = async () => {
  try {
    const db = await connectDB();
    const collection = db.collection("Users");

    // Fetch only the selected fields
    const users = await collection
      .find(
        {},
        { projection: { full_name: 1, email: 1, department: 1, position: 1 } }
      )
      .toArray();

    // Return as array
    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Basic Info Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user basic info",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
