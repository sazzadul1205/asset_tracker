// api/Company/[created_by]/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

// Helper for UTC timestamp
const getTimestamp = () => new Date().toISOString();

// GET: Fetch Company by created_by
export const GET = async (req, context) => {
  try {
    // Await params
    const params = await context.params;
    const { created_by } = params;

    if (!created_by) {
      return NextResponse.json(
        { error: "Missing created_by parameter" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Company");

    const company = await collection.find({ created_by }).toArray();

    if (!company.length) {
      return NextResponse.json({ error: "No Company found" }, { status: 404 });
    }

    return NextResponse.json({ data: company }, { status: 200 });
  } catch (error) {
    console.error("GET /Company/[created_by] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Company" },
      { status: 500 }
    );
  }
};

// PUT: Update Company by created_by
export const PUT = async (req, context) => {
  try {
    const params = await context.params;
    const { created_by } = params;

    if (!created_by) {
      return NextResponse.json(
        { error: "Missing created_by parameter" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const db = await connectDB();
    const collection = db.collection("Company");

    const updatedData = {
      ...body,
      updated_at: getTimestamp(),
    };

    const result = await collection.updateOne(
      { created_by },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Company updated successfully",
        updated_at: updatedData.updated_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /Company/[created_by] error:", error);
    return NextResponse.json(
      { error: "Failed to update Company" },
      { status: 500 }
    );
  }
};

// DELETE: Delete Company by created_by
export const DELETE = async (req, context) => {
  try {
    const params = await context.params;
    const { created_by } = params;

    if (!created_by) {
      return NextResponse.json(
        { error: "Missing created_by parameter" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Company");

    const result = await collection.deleteOne({ created_by });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /Company/[created_by] error:", error);
    return NextResponse.json(
      { error: "Failed to delete Company" },
      { status: 500 }
    );
  }
};
