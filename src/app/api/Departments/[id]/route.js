// api/Departments/[id]/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Helper for UTC timestamp
const getTimestamp = () => new Date().toISOString();

// PUT: Update Department by ID
export const PUT = async (req, context) => {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const db = await connectDB();
    const collection = db.collection("Departments");

    const updatedData = {
      ...body,
      updated_at: getTimestamp(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Department updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /Departments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
};

// DELETE: Delete Department by ID
export const DELETE = async (req, context) => {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Departments");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Department deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /Departments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
};
