// api/AssetCategory/[id]/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Helper to get current UTC timestamp
const getTimestamp = () => new Date().toISOString();

// PUT: Update Asset Category by ID
export const PUT = async (req, context) => {
  try {
    // await params from context
    const params = await context.params;
    const id = params.id;

    console.log("Received id:", id, "Type:", typeof id);

    if (!ObjectId.isValid(id)) {
      console.log("Invalid ObjectId detected!");
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body);

    const db = await connectDB();
    const collection = db.collection("AssetCategory");

    const updatedData = {
      ...body,
      updated_at: getTimestamp,
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("PUT /AssetCategory/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
};

// DELETE: Delete Asset Category by ID
export const DELETE = async (req, context) => {
  try {
    const params = await context.params;
    const id = params.id;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      console.log("Invalid ObjectId detected!");
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("AssetCategory");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /AssetCategory/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
};
