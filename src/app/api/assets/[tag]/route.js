// src/app/api/assets/[tag]/route.js
import { NextResponse } from "next/server";
import { getMongoClient, connectDB } from "@/lib/connectDB";

// Types
import { Decimal128 } from "mongodb";

//  GET Asset by identification.tag
export const GET = async (request, context) => {
  try {
    const params = await context.params;
    const { tag } = params;

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Asset tag is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeFields = searchParams.get("include");
    const excludeFields = searchParams.get("exclude");

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
    const assetsCol = db.collection("assets");

    let projection = {};
    if (includeFields) {
      includeFields
        .split(",")
        .forEach((field) => (projection[field.trim()] = 1));
      projection._id = 1;
    } else if (excludeFields) {
      excludeFields
        .split(",")
        .forEach((field) => (projection[field.trim()] = 0));
    }

    const asset = await assetsCol.findOne(
      { "identification.tag": tag },
      { projection }
    );

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset }, { status: 200 });
  } catch (err) {
    console.error("GET /api/assets/[tag] error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};

//  PATCH Asset by identification.tag
export const PATCH = async (request, { params }) => {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "assets_tracker";
  const db = client.db(dbName);
  const session = client.startSession();

  try {
    const { tag } = await params;

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Asset tag is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { identification, details, purchase, assigned, updatedBy } = body;

    await session.withTransaction(async () => {
      const assetsCol = db.collection("assets");

      const existingAsset = await assetsCol.findOne(
        { "identification.tag": tag },
        { session }
      );

      if (!existingAsset) throw new Error("Asset not found");

      const updateDoc = {};

      // Merge identification
      updateDoc.identification = {
        ...existingAsset.identification,
        ...identification,
      };

      // Merge details
      updateDoc.details = { ...existingAsset.details, ...details };

      // Merge purchase
      updateDoc.purchase = {
        ...existingAsset.purchase,
        ...purchase,
        cost:
          purchase?.cost != null
            ? Decimal128.fromString(String(purchase.cost))
            : existingAsset.purchase.cost || 0,
        purchasedAt: purchase?.purchasedAt
          ? new Date(purchase.purchasedAt)
          : existingAsset.purchase.purchasedAt || null,
        warrantyExpiry: purchase?.warrantyExpiry
          ? new Date(purchase.warrantyExpiry)
          : existingAsset.purchase.warrantyExpiry || null,
      };

      // Merge assigned
      updateDoc.assigned = {
        ...existingAsset.assigned,
        ...assigned,
        assignedAt: assigned?.assignedAt
          ? new Date(assigned.assignedAt)
          : existingAsset.assigned.assignedAt || null,
      };

      // Preserve metadata
      updateDoc.metadata = {
        ...existingAsset.metadata,
        updatedAt: new Date(),
        ...(updatedBy && { updatedBy }),
      };

      await assetsCol.updateOne(
        { "identification.tag": tag },
        { $set: updateDoc },
        { session }
      );
    });

    return NextResponse.json(
      { success: true, message: "Asset updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH /api/assets/[tag] error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
};

//  DELETE Asset by identification.tag (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { tag } = await params;

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Asset tag is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("assets");

    // Soft delete by setting metadata.deletedAt
    const result = await collection.updateOne(
      { "identification.tag": tag },
      { $set: { "metadata.deletedAt": new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Asset deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/assets/[tag] error:", error);
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
