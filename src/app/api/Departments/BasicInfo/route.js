// api/Departments/BasicInfo/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export const GET = async (req) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Departments");

    // Optional query params (if needed later)
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name"); // example filter

    // Build filter
    let filter = {};

    if (name) {
      filter.department_name = { $regex: name, $options: "i" };
    }

    // Fields to return
    const projection = {
      _id: 0,
      dept_id: 1,
      positions: 1,
      department_name: 1,
    };

    const departments = await collection.find(filter, { projection }).toArray();

    return NextResponse.json(
      {
        success: true,
        data: departments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Department Info Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch departments",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
