// src/app/api/assets/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";

/* ---------------------------------------------------
   GET : Fetch Assets (Filtered)
--------------------------------------------------- */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const userId = searchParams.get("userId");

    const db = await connectDB();
    const assetsCollection = db.collection("assets");

    let filter = {};

    // MODE LOGIC
    if (mode === "assigned") {
      filter = {
        "assigned.assignedTo": { $exists: true, $nin: [null, ""] },
      };
    }

    if (mode === "assigned-to-me") {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "userId is required" },
          { status: 400 }
        );
      }

      filter = {
        "assigned.assignedTo": userId,
      };
    }

    if (mode === "unassigned") {
      filter = {
        $or: [
          { "assigned.assignedTo": null },
          { "assigned.assignedTo": "" },
          { "assigned.assignedTo": { $exists: false } },
        ],
      };
    }

    // QUERY (ONLY RETURN name + tag)
    const assets = await assetsCollection
      .find(filter, {
        projection: {
          _id: 0,
          "identification.tag": 1,
          "identification.name": 1,
        },
      })
      .toArray();

    const result = assets.map((a) => ({
      tag: a.identification?.tag || "",
      name: a.identification?.name || "",
    }));

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/assets]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
