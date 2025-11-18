// api/Assets/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { generateId } from "@/Utils/generateId";

const getTimestamp = () => new Date().toISOString();

// GET: Fetch Assets with optional search, pagination, created_by & assigned_to filters
export const GET = async (request) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Assets");

    // Parse query parameters
    const {
      search,
      page = 1,
      limit = 10,
      created_by,
      assigned_to,
    } = Object.fromEntries(new URL(request.url).searchParams.entries());

    // Build filters
    const filters = {};

    // Search by department name
    if (search) {
      filters.asset_name = { $regex: search, $options: "i" };
    }

    // Filter by created_by
    if (created_by) {
      filters.created_by = created_by;
    }

    // Filter by assigned_to
    if (assigned_to) {
      filters.assigned_to = assigned_to;
    }

    // Count
    const total = await collection.countDocuments(filters);

    // Fetch with pagination
    const assets = await collection
      .find(filters)
      .sort({ created_at: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    // Return response
    return NextResponse.json(
      {
        success: true,
        data: assets,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      { status: 200 }
    );
  } catch (err) {
    // Log error
    console.error("GET /Assets error:", err);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while fetching Assets",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
};

// POST Method - Add a new Asset
export const POST = async (request) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.asset_tag || !data.asset_tag.trim()) {
      return NextResponse.json(
        { success: false, message: "Asset Tag is required" },
        { status: 400 }
      );
    }

    if (!data.asset_name || !data.asset_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Asset Name is required" },
        { status: 400 }
      );
    }

    if (!data.asset_category) {
      return NextResponse.json(
        { success: false, message: "Asset Category is required" },
        { status: 400 }
      );
    }

    if (!data.created_by) {
      return NextResponse.json(
        { success: false, message: "Creator info (created_by) is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Assets");

    // Check for duplicate asset_tag
    const exists = await collection.findOne({
      asset_tag: { $regex: new RegExp(`^${data.asset_tag.trim()}$`, "i") },
    });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Asset with this tag already exists" },
        { status: 400 }
      );
    }

    // Generate unique Asset ID
    let uniqueAssetId;
    const allIds = await collection
      .find({}, { projection: { asset_id: 1 } })
      .toArray();
    const existingIds = allIds.map((item) => item.asset_id);

    do {
      uniqueAssetId = generateId(6, "ASS", { numbersOnly: true });
    } while (existingIds.includes(uniqueAssetId));

    // Create newAsset object
    const newAsset = {
      asset_id: uniqueAssetId,
      asset_tag: data.asset_tag.trim(),
      serial_number: data.serial_number?.trim() || "",
      asset_name: data.asset_name.trim(),
      asset_category: data.asset_category,
      asset_brand: data.asset_brand?.trim() || "",
      asset_model: data.asset_model?.trim() || "",
      assigned_to: data.assigned_to || null,
      purchase_date: data.purchase_date || null,
      purchase_cost: Number(data.purchase_cost) || 0,
      warranty_expiry: data.warranty_expiry || null,
      supplier: data.Supplier?.trim() || "",
      location: data.Location?.trim() || "",
      status: data.status || "unAssigned",
      condition_rating: data.condition_rating || "unAssigned",
      asset_description: data.asset_description?.trim() || "",
      asset_notes: data.asset_notes?.trim() || "",
      created_by: data.created_by,
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };

    const result = await collection.insertOne(newAsset);

    if (!result.acknowledged) {
      throw new Error("Failed to insert asset");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Asset added successfully",
        assetId: result.insertedId,
        asset_id: uniqueAssetId,
        asset: newAsset,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /Assets error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
};
