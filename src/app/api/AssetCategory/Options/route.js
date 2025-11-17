// api/AssetCategory/Options/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

// GET Method - Fetch Options for Asset Categories
export const GET = async () => {
  try {
    const db = await connectDB();
    const collection = db.collection("AssetCategory");

    // Fetch categories
    const categories = await collection
      .find({})
      .project({ ac_id: 1, category_name: 1 })
      .toArray();

    // Format data
    const formatted = categories.map((cat) => ({
      label: cat.category_name,
      value: cat.ac_id,
    }));

    return NextResponse.json({ data: formatted }, { status: 200 });
  } catch (error) {
    console.error("Error fetching AssetCategory:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
