// api/Users/BasicInfo/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/**
 * GET Method - Fetch basic user info
 *
 * Features:
 * 1. Works with nested `identity` fields
 * 2. Filter fixed users with `includeFixed` or `onlyFixed` query params
 * 3. Optionally return only specific fields via `fields` query param
 */
export const GET = async (req) => {
  try {
    const db = await connectDB();
    const collection = db.collection("Users");

    const { searchParams } = new URL(req.url);

    // Query params
    const includeFixed = searchParams.get("includeFixed") === "true";
    const onlyFixed = searchParams.get("onlyFixed") === "true";

    // Optional param: return only specified fields
    const fieldsParam = searchParams.get("fields"); // e.g. "full_name,email"
    const requestedFields = fieldsParam
      ? fieldsParam.split(",").map((f) => f.trim())
      : ["full_name", "email", "employee_id"]; // default fields

    // Build MongoDB filter for fixed users
    let filter = {};
    if (onlyFixed) {
      filter.fixed = true; // return only fixed
    } else if (!includeFixed) {
      filter.$or = [{ fixed: false }, { fixed: { $exists: false } }];
    }

    // Build projection dynamically based on requested fields inside `identity`
    let projection = {};
    requestedFields.forEach((f) => {
      projection[`identity.${f}`] = 1;
    });

    // Query the DB
    const users = await collection.find(filter, { projection }).toArray();

    // Transform nested identity fields to flat structure
    const transformedUsers = users.map((user) => {
      let obj = {};
      requestedFields.forEach((f) => {
        obj[f] = user.identity?.[f] || null;
      });
      return obj;
    });

    return NextResponse.json(
      { success: true, data: transformedUsers },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Basic Info Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user basic info",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};
