// src/app/api/assetsCategories/[categoryId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// Types
import { Decimal128 } from "mongodb";

/*
  GET /api/assetsCategories/[categoryId]
  Fetch a single asset category by info.categoryId
*/
export async function GET(request, context) {
  try {
    // --- Unwrap params properly ---
    const params = await context.params;
    const { categoryId } = params;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Query params
    const { searchParams } = new URL(request.url);
    const includeFields = searchParams.get("include"); // comma separated
    const excludeFields = searchParams.get("exclude"); // comma separated

    if (includeFields && excludeFields) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot use both include and exclude at the same time",
        },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("categories");

    // Build projection
    let projection = {};

    if (includeFields) {
      projection = {};
      includeFields.split(",").forEach((field) => {
        projection[field.trim()] = 1;
      });
      projection._id = 1;
    }

    if (excludeFields) {
      excludeFields.split(",").forEach((field) => {
        projection[field.trim()] = 0;
      });
    }

    const category = await collection.findOne(
      { "info.categoryId": categoryId },
      { projection }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/assetsCategories/[categoryId] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/*
  PATCH /api/assetsCategories/[categoryId]
  Update asset category while preserving schema integrity
*/
export async function PATCH(request, context) {
  try {
    // --- Unwrap params properly ---
    const params = await context.params;
    const { categoryId } = params;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    const payload = await request.json();
    const db = await connectDB();
    const collection = db.collection("categories");

    const existingCategory = await collection.findOne({
      "info.categoryId": categoryId,
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // --- Merge info ---
    const updatedInfo = {
      ...existingCategory.info,
      ...(payload.info || {}),
      categoryId: existingCategory.info.categoryId, // immutable
      icon: payload.info?.icon || existingCategory.info.icon || "",
      iconBgColor:
        payload.info?.iconBgColor || existingCategory.info.iconBgColor || "",
    };

    // --- Merge depreciation with Decimal128 conversion ---
    const updatedDepreciation = {
      averageRate:
        payload.depreciation?.averageRate !== undefined
          ? Decimal128.fromString(payload.depreciation.averageRate.toString())
          : existingCategory.depreciation.averageRate,
      defaultWarrantyMonths:
        payload.depreciation?.defaultWarrantyMonths !== undefined
          ? Decimal128.fromString(
              payload.depreciation.defaultWarrantyMonths.toString()
            )
          : existingCategory.depreciation.defaultWarrantyMonths,
    };

    // --- Update metadata ---
    const updatedMetadata = {
      ...existingCategory.metadata,
      updatedAt: new Date(),
    };

    // --- Perform update ---
    await collection.updateOne(
      { "info.categoryId": categoryId },
      {
        $set: {
          info: updatedInfo,
          depreciation: updatedDepreciation,
          metadata: updatedMetadata,
        },
      }
    );

    return NextResponse.json(
      { success: true, message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/assetsCategories/[categoryId] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/*
  DELETE /api/assetsCategories/[categoryId]
  Delete asset category by info.categoryId
*/
export async function DELETE(request, { params }) {
  try {
    const { categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("categories");

    const result = await collection.deleteOne({
      "info.categoryId": categoryId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/assetsCategories/[categoryId] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
