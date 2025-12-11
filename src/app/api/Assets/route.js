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

    // Basic validation
    if (!data.tag || !data.tag.trim()) {
      return NextResponse.json(
        { success: false, message: "Asset Tag is required" },
        { status: 400 }
      );
    }

    if (!data.details?.name || !data.details.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Asset Name is required" },
        { status: 400 }
      );
    }

    if (!data.details?.category) {
      return NextResponse.json(
        { success: false, message: "Asset Category is required" },
        { status: 400 }
      );
    }

    if (!data.audit?.created_by) {
      return NextResponse.json(
        { success: false, message: "Creator info is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Assets");

    // Check duplicate tag (case-insensitive)
    const exists = await collection.findOne({
      tag: { $regex: new RegExp(`^${data.tag.trim()}$`, "i") },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Asset with this tag already exists" },
        { status: 400 }
      );
    }

    // Generate unique Asset ID
    let uniqueId;
    const allIds = await collection
      .find({}, { projection: { id: 1 } })
      .toArray();
    const existingIds = allIds.map((item) => item.id);

    do {
      uniqueId = generateId(6, "ASS", { numbersOnly: true });
    } while (existingIds.includes(uniqueId));

    // Build new grouped object
    const newAsset = {
      id: uniqueId,
      tag: data.tag.trim(),
      serial: data.serial?.trim() || "",

      details: {
        name: data.details?.name?.trim() || "",
        category: data.details?.category || "",
        brand: data.details?.brand?.trim() || "",
        model: data.details?.model?.trim() || "",
        description: data.details?.description?.trim() || "",
        notes: data.details?.notes?.trim() || "",
      },

      ownership: {
        assigned_to: data.ownership?.assigned_to || null,
        location: data.ownership?.location?.trim() || "Unassigned",
        status: data.ownership?.status || "Unassigned",
        condition: data.ownership?.condition || "Unassigned",
      },

      purchase: {
        date: data.purchase?.date || null,
        cost: Number(data.purchase?.cost) || 0,
        supplier: data.purchase?.supplier?.trim() || "",
        warranty_expiry: data.purchase?.warranty_expiry || null,
      },

      audit: {
        created_by: data.audit.created_by,
        created_at: getTimestamp(),
        updated_by: data.audit.created_by,
        updated_at: getTimestamp(),
      },
    };

    // Insert into DB
    const result = await collection.insertOne(newAsset);

    if (!result.acknowledged) {
      throw new Error("Failed to insert asset");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Asset added successfully",
        assetId: result.insertedId,
        id: uniqueId,
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
