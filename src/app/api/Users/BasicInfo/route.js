// api/Users/BasicInfo/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export const GET = async (req) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Users");

    const { searchParams } = new URL(req.url);

    // Query params:
    const includeFixed = searchParams.get("includeFixed") === "true";
    const onlyFixed = searchParams.get("onlyFixed") === "true";

    // Build MongoDB filter
    let filter = {};

    if (onlyFixed) {
      filter.fixed = true; // return ONLY fixed
    } else if (!includeFixed) {
      filter.$or = [{ fixed: false }, { fixed: { $exists: false } }];
    }

    // Fields to return
    const projection = {
      _id: 0,
      email: 1,
      full_name: 1,
      employee_id: 1,
    };

    const users = await collection.find(filter, { projection }).toArray();

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
