// api/Departments/department/[dept_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

export const GET = async (req, context) => {
  try {
    const { dept_id } = await context.params;

    const db = await connectDB();
    const collection = db.collection("Departments");

    // Parse requested fields from query params
    const { searchParams } = new URL(req.url);
    const fieldsParam = searchParams.get("fields");

    let projection = { _id: 0 }; // always exclude _id

    if (fieldsParam) {
      // Build projection based on requested fields
      const fields = fieldsParam.split(",").map((f) => f.trim());
      fields.forEach((field) => {
        if (field) projection[field] = 1;
      });
    } else {
      // Default fields
      projection = {
        _id: 0,
        dept_id: 1,
        department_name: 1,
      };
    }

    const result = await collection.findOne({ dept_id }, { projection });

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
