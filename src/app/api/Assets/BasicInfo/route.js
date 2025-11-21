// api/Assets/BasicInfo/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const db = await connectDB();
    const collection = db.collection("Assets");

    // Fetch only the needed fields
    const assets = await collection
      .find(
        {},
        {
          projection: {
            _id: 0,
            asset_tag: 1,
            asset_name: 1,
            assigned_to: 1,
          },
        }
      )
      .toArray();

    return NextResponse.json({ data: assets }, { status: 200 });
  } catch (error) {
    console.error("Error fetching asset list:", error);
    return NextResponse.json(
      { message: "Failed to fetch assets", error: error.message },
      { status: 500 }
    );
  }
};
