// api/AssetCategory/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { generateId } from "../../../Utils/generateId";

// Helper to get current UTC timestamp
const getTimestamp = () => new Date().toISOString();

/**
 * POST Method - Add a new asset category
 */
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

// GET Method - Fetch all asset categories
export const GET = async () => {
  try {
    const db = await connectDB();
    const collection = db.collection("AssetCategory");

    const categories = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /AssetCategory error:", err);
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
