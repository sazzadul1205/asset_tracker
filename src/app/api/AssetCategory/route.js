// api/AssetCategory/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { generateId } from "../../../Utils/generateId";

// Helper to get current UTC timestamp
const getTimestamp = () => new Date().toISOString();

//  POST Method - Add a new asset category
export const POST = async (request) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.category_name || !data.category_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("AssetCategory");

    // Check duplicate by category_name (case-insensitive)
    const exists = await collection.findOne({
      category_name: {
        $regex: new RegExp(`^${data.category_name.trim()}$`, "i"),
      },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 }
      );
    }

    // Generate a unique ac_id (search all existing IDs)
    let uniqueAcId;
    const allIds = await collection
      .find({}, { projection: { ac_id: 1 } })
      .toArray();
    const existingIds = allIds.map((item) => item.ac_id);

    do {
      uniqueAcId = generateId(6, "AC", { numbersOnly: true }); // e.g., AC1234
    } while (existingIds.includes(uniqueAcId));

    // Normalize payload
    const newCategory = {
      ac_id: uniqueAcId,
      category_name: data.category_name.trim(),
      category_description: data.category_description?.trim() || "",
      depreciation_rate: data.depreciation_rate || null,
      warranty: data.warranty || null,
      selectedColor: data.selectedColor || "#ffffff",
      iconImage: data.iconImage || "",
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };

    const result = await collection.insertOne(newCategory);

    if (!result.acknowledged) {
      throw new Error("Failed to insert category");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category added successfully",
        categoryId: result.insertedId,
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /AssetCategory error:", err);
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

// GET Method - Fetch Asset Categories with pagination & optional filters
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("AssetCategory");

    // Parse query parameters
    const {
      search,
      page = 1,
      limit = 10,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    // Build filters
    const filters = {};
    if (search) {
      filters.category_name = { $regex: search, $options: "i" }; // case-insensitive
    }

    // Get total count
    const total = await collection.countDocuments(filters);

    // Fetch categories with pagination
    const categories = await collection
      .find(filters)
      .sort({ created_at: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: categories,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching asset categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while fetching asset categories",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
