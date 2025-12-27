// src/app/api/assets/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

// Types
import { Decimal128 } from "mongodb";

// POST : Create Asset
export async function POST(req) {
  try {
    const db = await connectDB();
    const assetsCollection = db.collection("assets");

    const data = await req.json();

    // Top-level required check
    const requiredTop = [
      "identification",
      "details",
      "purchase",
      "assigned",
      "metadata",
    ];
    for (const key of requiredTop) {
      if (!data[key]) {
        return NextResponse.json(
          { error: `Missing top-level field: ${key}` },
          { status: 400 }
        );
      }
    }

    const { identification, details, purchase, assigned, metadata } = data;

    // Identification validation
    if (
      !identification.tag ||
      !identification.name ||
      !identification.categoryId
    ) {
      return NextResponse.json(
        { error: "Identification fields are required" },
        { status: 400 }
      );
    }

    // Check for uniqueness of tag
    const existingAsset = await assetsCollection.findOne({
      "identification.tag": identification.tag,
    });
    if (existingAsset) {
      return NextResponse.json(
        { error: `Asset with tag '${identification.tag}' already exists` },
        { status: 400 }
      );
    }

    // Details validation
    const allowedStatus = [
      "available",
      "assigned",
      "under_maintenance",
      "lost",
      "retired",
    ];
    const allowedCondition = ["new", "good", "fair", "poor", "broken"];
    if (
      !details.serialNumber ||
      !details.brand ||
      !details.model ||
      !details.description
    ) {
      return NextResponse.json(
        { error: "Details fields are required" },
        { status: 400 }
      );
    }
    if (!allowedStatus.includes(details.status)) {
      return NextResponse.json(
        { error: `Invalid status: ${details.status}` },
        { status: 400 }
      );
    }
    if (!allowedCondition.includes(details.condition)) {
      return NextResponse.json(
        { error: `Invalid condition: ${details.condition}` },
        { status: 400 }
      );
    }

    // Purchase validation
    if (
      typeof purchase.cost !== "number" &&
      typeof purchase.cost !== "string"
    ) {
      return NextResponse.json(
        { error: "Purchase cost must be a number or string" },
        { status: 400 }
      );
    }

    // Convert types for MongoDB
    const payloadToInsert = {
      identification: {
        tag: String(identification.tag),
        name: String(identification.name),
        categoryId: String(identification.categoryId),
      },
      details: {
        serialNumber: String(details.serialNumber),
        brand: String(details.brand),
        model: String(details.model),
        status: details.status,
        condition: details.condition,
        description: String(details.description),
        notes: details.notes ? String(details.notes) : "",
      },
      purchase: {
        purchasedAt: purchase.purchasedAt
          ? new Date(purchase.purchasedAt)
          : null,
        cost: Decimal128.fromString(String(purchase.cost || 0)),
        warrantyExpiry: purchase.warrantyExpiry
          ? new Date(purchase.warrantyExpiry)
          : null,
        supplier: purchase.supplier ? String(purchase.supplier) : "",
        location: purchase.location ? String(purchase.location) : "",
      },
      assigned: {
        assignedTo: assigned.assignedTo ? String(assigned.assignedTo) : null,
        assignedAt: assigned.assignedAt ? new Date(assigned.assignedAt) : null,
        assignedBy: assigned.assignedBy ? String(assigned.assignedBy) : null,
      },
      metadata: {
        createdBy: String(metadata.createdBy || "system"),
        createdAt: metadata.createdAt
          ? new Date(metadata.createdAt)
          : new Date(),
        deletedAt: metadata.deletedAt ? new Date(metadata.deletedAt) : null,
      },
    };

    // Insert into MongoDB
    const result = await assetsCollection.insertOne(payloadToInsert);

    return NextResponse.json(
      { message: "Asset created successfully", insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/assets:", error);
    return NextResponse.json(
      { error: "Server error creating asset" },
      { status: 500 }
    );
  }
}

// GET : Fetch Assets
export async function GET(req) {
  try {
    const db = await connectDB();
    const assetsCol = db.collection("assets");

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const assignedTo = searchParams.get("assignedTo");
    const includeDeleted = searchParams.get("includeDeleted") === "true"; // new param

    const filters = {};

    // Soft-delete filter
    if (!includeDeleted) {
      filters["metadata.deletedAt"] = { $in: [null, undefined, ""] };
    }

    // Search
    if (search) {
      filters.$or = [
        { "identification.tag": { $regex: search, $options: "i" } },
        { "identification.name": { $regex: search, $options: "i" } },
        { "details.serialNumber": { $regex: search, $options: "i" } },
        { "details.brand": { $regex: search, $options: "i" } },
        { "details.model": { $regex: search, $options: "i" } },
      ];
    }

    if (status) filters["details.status"] = status;
    if (categoryId) filters["identification.categoryId"] = categoryId;
    if (assignedTo) filters["assigned.assignedTo"] = assignedTo;

    // Count
    const totalItems = await assetsCol.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch
    const assets = await assetsCol
      .find(filters)
      .sort({ "metadata.createdAt": -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: assets,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/assets] Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
