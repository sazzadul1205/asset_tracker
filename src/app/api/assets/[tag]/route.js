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
export const PATCH = async (request, context) => {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "assets_tracker";
  const db = client.db(dbName);
  const session = client.startSession();

  try {
    const params = await context.params;
    const { tag } = params;

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
      if (identification) updateDoc.identification = { ...identification };
      if (details) updateDoc.details = { ...details };
      if (purchase) {
        updateDoc.purchase = {
          ...purchase,
          cost: purchase.cost
            ? Decimal128.fromString(String(purchase.cost))
            : 0,
          purchasedAt: purchase.purchasedAt
            ? new Date(purchase.purchasedAt)
            : null,
          warrantyExpiry: purchase.warrantyExpiry
            ? new Date(purchase.warrantyExpiry)
            : null,
        };
      }
      if (assigned) {
        updateDoc.assigned = {
          ...assigned,
          assignedAt: assigned.assignedAt
            ? new Date(assigned.assignedAt)
            : null,
        };
      }

      updateDoc["metadata.updatedAt"] = new Date();
      if (updatedBy) updateDoc["metadata.updatedBy"] = updatedBy;

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
export const DELETE = async (request, context) => {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "assets_tracker";
  const db = client.db(dbName);
  const session = client.startSession();

  try {
    const params = await context.params;
    const { tag } = params;

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Asset tag is required" },
        { status: 400 }
      );
    }

    await session.withTransaction(async () => {
      const assetsCol = db.collection("assets");

      const result = await assetsCol.updateOne(
        { "identification.tag": tag },
        { $set: { "metadata.deletedAt": new Date() } },
        { session }
      );

      if (result.matchedCount === 0) throw new Error("Asset not found");
    });

    return NextResponse.json(
      { success: true, message: "Asset deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/assets/[tag] error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
};
