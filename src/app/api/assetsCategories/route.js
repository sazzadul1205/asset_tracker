// src/app/api/assetsCategories/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// POST: Create Asset Category
export async function POST(req) {
  try {
    const db = await connectDB();
    const categoriesCollection = db.collection("categories");

    const body = await req.json();
    const { info, depreciation } = body;

    // --- Validation ---
    const missingFields = [];

    if (!info?.categoryId) missingFields.push("info.categoryId");
    if (!info?.name) missingFields.push("info.name");
    if (!info?.description) missingFields.push("info.description");
    if (!info?.status) missingFields.push("info.status");
    if (!info?.icon) missingFields.push("info.icon");
    if (!info?.iconBgColor) missingFields.push("info.iconBgColor");

    if (depreciation?.averageRate === undefined)
      missingFields.push("depreciation.averageRate");
    if (depreciation?.defaultWarrantyMonths === undefined)
      missingFields.push("depreciation.defaultWarrantyMonths");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // --- Uniqueness check ---
    if (
      await categoriesCollection.findOne({
        "info.categoryId": info.categoryId,
      })
    ) {
      return NextResponse.json(
        { success: false, error: "CategoryId already exists" },
        { status: 409 }
      );
    }

    // --- Prepare category document ---
    const newCategory = {
      info: {
        categoryId: String(info.categoryId),
        name: String(info.name),
        description: String(info.description),
        status: String(info.status),
        icon: String(info.icon),
        iconBgColor: String(info.iconBgColor),
      },
      depreciation: {
        averageRate: Number(depreciation.averageRate),
        defaultWarrantyMonths: Number(depreciation.defaultWarrantyMonths),
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    await categoriesCollection.insertOne(newCategory);

    return NextResponse.json(
      {
        success: true,
        message: "Asset category created successfully",
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/assetsCategories] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Fetch Asset Categories
export async function GET(request) {
  try {
    const db = await connectDB();
    const categoriesCol = db.collection("categories");

    const { searchParams } = new URL(request.url);

    // Pagination (safe defaults)
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");

    // Build Mongo filter
    const filters = {};

    if (search) {
      filters.$or = [
        { "info.name": { $regex: search, $options: "i" } },
        { "info.categoryId": { $regex: search, $options: "i" } },
        { "info.description": { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filters["info.status"] = status;
    }

    // Total count
    const totalItems = await categoriesCol.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated data
    const categories = await categoriesCol
      .find(filters)
      .sort({ "metadata.createdAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: categories,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/assetsCategories error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
