// api/Assets/[asset_id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// GET Method - Fetch a single asset by asset_id or asset_tag
export const GET = async (req, context) => {
  try {
    const params = await context.params;
    const { asset_id } = params;

    if (!asset_id) {
      return NextResponse.json(
        { message: "asset_id or asset_tag is required" },
        { status: 400 }
      );
    }

    // Parse optional fields from query parameters
    const url = new URL(req.url);
    const fieldsParam = url.searchParams.get("fields"); // e.g., "status,location,asset_name"
    let projection = {};
    if (fieldsParam) {
      const fieldsArray = fieldsParam.split(",");
      fieldsArray.forEach((field) => {
        projection[field.trim()] = 1; // include field
      });
    }

    const db = await connectDB();
    const assetsCollection = db.collection("Assets");

    const asset = await assetsCollection.findOne(
      { $or: [{ asset_id }, { asset_tag: asset_id }] },
      { projection: Object.keys(projection).length ? projection : undefined }
    );

    if (!asset) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ data: asset }, { status: 200 });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { message: "Failed to fetch asset", error: error.message },
      { status: 500 }
    );
  }
};

// PUT Method - Update an asset by asset_id
export const PUT = async (req, context) => {
  try {
    const params = await context.params;
    const { asset_id } = params;
    const data = await req.json();

    // Ensure updated_at and updated_by are always set
    data.updated_at = new Date();
    if (!data.updated_by) data.updated_by = "System";

    const db = await connectDB();
    const assetsCollection = db.collection("Assets");

    const result = await assetsCollection.updateOne(
      { asset_id },
      { $set: data }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Asset updated successfully",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { message: "Failed to update asset", error: error.message },
      { status: 500 }
    );
  }
};

// DELETE Method - Remove an asset by asset_id
export const DELETE = async (req, context) => {
  try {
    const params = await context.params;
    const { asset_id } = params;

    const db = await connectDB();
    const assetsCollection = db.collection("Assets");

    const result = await assetsCollection.deleteOne({ asset_id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Asset deleted successfully",
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { message: "Failed to delete asset", error: error.message },
      { status: 500 }
    );
  }
};
