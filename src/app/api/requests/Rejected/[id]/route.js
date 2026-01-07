import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/connectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function PUT(req, context) {
  let session;

  try {
    /* -----------------------------
       PARAM + SESSION
    ----------------------------- */
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid request ID is required" },
        { status: 400 }
      );
    }

    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const performedBy = authSession.user.userId;

    const client = await getMongoClient();
    const db = client.db("assets_tracker");

    const requestsCollection = db.collection("requests");
    const logsCollection = db.collection("requestLogs");

    const requestId = new ObjectId(id);

    /* -----------------------------
       TRANSACTION
    ----------------------------- */
    session = client.startSession();

    await session.withTransaction(async () => {
      const request = await requestsCollection.findOne(
        { _id: requestId },
        { session }
      );

      if (!request) throw new Error("Request not found");

      /* -----------------------------
         UPDATE REQUEST STATUS
      ----------------------------- */
      await requestsCollection.updateOne(
        { _id: requestId },
        {
          $set: {
            "metadata.status": "rejected",
            "metadata.updatedAt": new Date(),
          },
        },
        { session }
      );

      /* -----------------------------
         REQUEST LOG (STRICT)
      ----------------------------- */
      await logsCollection.insertOne(
        {
          requestId: request._id,
          action: "rejected",
          performedBy,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          state: "rejected",
          timestamp: new Date(),
          details: {
            priority: request.priority,
            expectedCompletion: request.expectedCompletion,
            departmentId: request.participants.departmentId,
            notes: "Request rejected",
            additionalData: {
              assetId: request.assetId,
              requestType: request.type,
            },
          },
        },
        { session }
      );
    });

    return NextResponse.json(
      { success: true, message: "Request rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PUT /api/requests/Rejected/[id]]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reject request" },
      { status: 500 }
    );
  } finally {
    if (session) await session.endSession();
  }
}
