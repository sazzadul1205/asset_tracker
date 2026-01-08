// src/app/api/assetsCategories/CategoryOptions/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * GET /api/assetsCategories/CategoryOptions
 *
 * Returns:
 * - info.name
 * - info.categoryId
 */
export async function GET(request) {
  try {
    const db = await connectDB();
    const categoriesCol = db.collection("categories");

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const excludeStatus = searchParams.get("excludeStatus");
    const search = searchParams.get("search")?.trim();

    const filters = {};

    // Inclusion
    if (status) {
      filters["info.status"] = status;
    }

    // Exclusion
    if (excludeStatus) {
      filters["info.status"] = { $ne: excludeStatus };
    }

    // Search (name or categoryId)
    if (search) {
      filters.$or = [
        { "info.name": { $regex: search, $options: "i" } },
        { "info.categoryId": { $regex: search, $options: "i" } },
      ];
    }

    // Projection (ONLY required fields)
    const projection = {
      "info.name": 1,
      "info.categoryId": 1,
      _id: 0,
    };

    const categories = await categoriesCol
      .find(filters, { projection })
      .sort({ "info.name": 1 })
      .toArray();

    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/assetsCategories/CategoryOptions error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
