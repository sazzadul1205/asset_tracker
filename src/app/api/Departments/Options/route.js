// api/Departments/Options/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Departments");

    const departments = await collection
      .find({})
      .project({ dept_id: 1, department_name: 1 })
      .toArray();

    const formatted = departments.map((dept) => ({
      label: dept.department_name,
      value: dept.dept_id,
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
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
