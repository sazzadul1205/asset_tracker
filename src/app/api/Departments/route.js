// api/Departments/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { generateId } from "@/Utils/generateId";

// Helper to get current UTC timestamp
const getTimestamp = () => new Date().toISOString();

// GET Method - Fetch departments with optional search and pagination
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Departments");

    // Parse query parameters
    const {
      search,
      page = 1,
      limit = 10,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    // Build filters
    const filters = {};
    if (search) {
      filters.department_name = { $regex: search, $options: "i" };
    }

    // Get total count
    const total = await collection.countDocuments(filters);

    // Fetch departments with pagination
    const departments = await collection
      .find(filters)
      .sort({ created_at: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: departments,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /Departments error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while fetching departments",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
};

// POST Method - Add a new department
export const POST = async (request) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.department_name || !data.department_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Department name is required" },
        { status: 400 }
      );
    }

    // Budget is required
    const budget = Number(data.department_budget);
    if (!budget || budget <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Department budget is required and must be > 0",
        },
        { status: 400 }
      );
    }

    // Manager info is required
    if (!data.manager || !data.manager.employee_id) {
      return NextResponse.json(
        { success: false, message: "Department manager info is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Departments");

    // Check for duplicate department by name (case-insensitive)
    const exists = await collection.findOne({
      department_name: {
        $regex: new RegExp(`^${data.department_name.trim()}$`, "i"),
      },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Department already exists" },
        { status: 400 }
      );
    }

    // Generate unique department ID
    let uniqueDeptId;
    const allIds = await collection
      .find({}, { projection: { dept_id: 1 } })
      .toArray();
    const existingIds = allIds.map((item) => item.dept_id);

    do {
      uniqueDeptId = generateId(6, "DEPT", { numbersOnly: true });
    } while (existingIds.includes(uniqueDeptId));

    // Normalize payload (remove department_manager)
    const newDepartment = {
      dept_id: uniqueDeptId,
      manager: data.manager,
      iconImage: data.iconImage,
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
      created_by: data.created_by,
      positions: data.positions || [],
      selectedColor: data.selectedColor,
      department_name: data.department_name.trim(),
      department_budget: Number(data.department_budget),
      department_description: data.department_description?.trim() || "",
    };

    const result = await collection.insertOne(newDepartment);

    if (!result.acknowledged) {
      throw new Error("Failed to insert department");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Department added successfully",
        departmentId: result.insertedId,
        department: newDepartment,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /Departments error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
};
