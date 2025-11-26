// api/Requests/[request_id]/route.js
import { connectDB } from "@/lib/connectDB";
import { NextResponse } from "next/server";

// GET: Fetch request by request_id
export const GET = async (req, context) => {
  try {
    const params = await context.params;
    const { request_id } = params;

    if (!request_id) {
      return NextResponse.json(
        { error: "Missing request_id parameter" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Requests");

    const result = await collection.findOne({ request_id });

    if (!result) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("GET /Requests/[request_id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
};

// DELETE: Remove request by request_id
export const DELETE = async (req, context) => {
  try {
    const params = await context.params;
    const { request_id } = params;

    if (!request_id) {
      return NextResponse.json(
        { error: "Missing request_id parameter" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("Requests");

    const result = await collection.deleteOne({ request_id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Request deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /Requests/[request_id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
};
