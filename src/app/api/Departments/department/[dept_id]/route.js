// api/Departments/department/[dept_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export const GET = async (req, context) => {
  try {
    // MUST await this!
    const { dept_id } = await context.params;

    const db = await connectDB();
    const collection = db.collection("Departments");

    // Find department by dept_id
    const result = await collection.findOne(
      { dept_id },
      {
        projection: {
          _id: 0, // remove _id
          dept_id: 1,
          department_name: 1,
        },
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("GET /Departments/[dept_id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
