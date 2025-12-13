// src/app/api/company/route.js
"use server";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { ObjectId } from "mongodb";

// JSON Schema validation helper
const companySchema = {
  bsonType: "object",
  required: ["name", "contact", "settings", "metadata"],
  properties: {
    name: { bsonType: "string" },
    contact: {
      bsonType: "object",
      required: ["email", "phone", "address", "logo"],
      properties: {
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        address: { bsonType: "string" },
        logo: { bsonType: "string" },
      },
    },
    settings: {
      bsonType: "object",
      required: ["currency", "dateFormat"],
      properties: {
        currency: {
          bsonType: "object",
          required: ["code", "location", "fractionalDigits"],
          properties: {
            code: { bsonType: "string" },
            location: { bsonType: "string" },
            fractionalDigits: { bsonType: "int" },
          },
        },
        dateFormat: { bsonType: "string" },
      },
    },
    metadata: {
      bsonType: "object",
      required: ["createdAt", "updatedAt"],
      properties: {
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
  additionalProperties: false,
};

// Simple schema validator
const validateCompany = (data) => {
  // Very basic validation for example
  const errors = [];
  for (const key of companySchema.required) {
    if (!(key in data)) errors.push(`${key} is required`);
  }

  // Add nested checks if needed
  return errors.length > 0 ? errors : null;
};

// GET: fetch the single company
export async function GET() {
  try {
    const db = await connectDB();
    const company = await db.collection("company").findOne({});
    if (!company)
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    return NextResponse.json(company);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// POST: create company (if not exists)
export async function POST(req) {
  try {
    const db = await connectDB();
    const existing = await db.collection("company").findOne({});
    if (existing) {
      return NextResponse.json(
        { message: "Company already exists" },
        { status: 400 }
      );
    }

    const data = await req.json();

    // validate
    const errors = validateCompany(data);
    if (errors) return NextResponse.json({ errors }, { status: 400 });

    // Add timestamps
    data.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await db.collection("company").insertOne(data);
    return NextResponse.json({
      message: "Company created",
      id: res.insertedId,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// PUT: update the single company
export async function PUT(req) {
  try {
    const db = await connectDB();
    const data = await req.json();

    // Get existing company (if any)
    const existing = await db.collection("company").findOne({});

    // Enforce metadata on server (required by MongoDB schema)
    data.metadata = {
      createdAt: existing?.metadata?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Validate AFTER metadata is guaranteed
    const errors = validateCompany(data);
    if (errors) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const res = await db
      .collection("company")
      .updateOne({}, { $set: data }, { upsert: true });

    return NextResponse.json({
      message: "Company updated",
      modifiedCount: res.modifiedCount,
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
