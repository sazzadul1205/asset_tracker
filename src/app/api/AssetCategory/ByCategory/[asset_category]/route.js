// api/AssetCategory/ByCategory/[asset_category]/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const GET = async (req, context) => {
  try {
    // Unwrap params
    const params = await context.params;
    const asset_category = params.asset_category; // ac_id

    const db = await connectDB();
    const collection = db.collection("AssetCategory");

    const result = await collection
      .find(
        { ac_id: asset_category },
        {
          projection: {
            _id: 0, // hide _id
            ac_id: 1,
            category_name: 1,
            selectedColor: 1,
            iconImage: 1,
          },
        }
      )
      .toArray();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result[0], // single object since ac_id is unique
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching asset category:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while fetching asset category",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
