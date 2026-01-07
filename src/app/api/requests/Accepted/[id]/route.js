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
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Request ID required" },
        { status: 400 }
      );
    }

    // Server Authority
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Performer
    const performedBy = authSession.user.userId;

    // Connect to MongoDB
    const client = await getMongoClient();
    const db = client.db("assets_tracker");

    // Collections
    const assetsCollection = db.collection("assets");
    const logsCollection = db.collection("requestLogs");
    const requestsCollection = db.collection("requests");

    const requestId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    /* -----------------------------
       TRANSACTION
    ----------------------------- */
    session = client.startSession();
    let result;

    await session.withTransaction(async () => {
      // Must await context.params
      const request = await requestsCollection.findOne(
        { _id: requestId },
        { session }
      );

      // Validate request
      if (!request) throw new Error(`Request not found: ${id}`);

      /* -----------------------------
         UPDATE REQUEST STATUS
      ----------------------------- */
      await requestsCollection.updateOne(
        { _id: requestId },
        {
          $set: {
            "metadata.status": "accepted",
            "metadata.updatedAt": new Date(),
          },
        },
        { session }
      );

      /* -----------------------------
         ASSIGNMENT LOGIC (UNCHANGED)
      ----------------------------- */
      const assignedBy =
        request.participants.requestedToId === "-"
          ? performedBy
          : request.participants.requestedToId;

      const requestedBy =
        request.participants.requestedById === "-"
          ? performedBy
          : request.participants.requestedById;

      const assignedAt = new Date();
      const assetId = request.assetId;
      let updatedAsset;

      switch (request.type) {
        case "assign":
        case "transfer":
          updatedAsset = await assetsCollection.findOneAndUpdate(
            { "identification.tag": assetId },
            {
              $set: {
                "assigned.assignedTo": assignedBy,
                "assigned.assignedBy": requestedBy,
                "assigned.assignedAt": assignedAt,
              },
            },
            { session, returnDocument: "after" }
          );
          break;

        case "request":
          updatedAsset = await assetsCollection.findOneAndUpdate(
            { "identification.tag": assetId },
            {
              $set: {
                "assigned.assignedTo": requestedBy,
                "assigned.assignedBy": assignedBy,
                "assigned.assignedAt": assignedAt,
              },
            },
            { session, returnDocument: "after" }
          );
          break;

        case "return":
          updatedAsset = await assetsCollection.findOneAndUpdate(
            { "identification.tag": assetId },
            {
              $set: {
                "assigned.assignedTo": null,
                "assigned.assignedBy": null,
                "assigned.assignedAt": assignedAt,
              },
            },
            { session, returnDocument: "after" }
          );
          break;

        case "repair":
          updatedAsset = await assetsCollection.findOneAndUpdate(
            { "identification.tag": assetId },
            {
              $set: {
                "assigned.assignedTo": null,
                "assigned.assignedBy": null,
                "assigned.assignedAt": assignedAt,
                "details.status": "under_maintenance",
              },
            },
            { session, returnDocument: "after" }
          );
          break;

        case "retire":
          updatedAsset = await assetsCollection.findOneAndUpdate(
            { "identification.tag": assetId },
            {
              $set: {
                "assigned.assignedTo": null,
                "assigned.assignedBy": null,
                "assigned.assignedAt": assignedAt,
                "details.status": "retired",
              },
            },
            { session, returnDocument: "after" }
          );
          break;

        default:
          throw new Error(`Invalid request type: ${request.type}`);
      }

      /* -----------------------------
         REQUEST LOG (STRICT SCHEMA)
      ----------------------------- */
      await logsCollection.insertOne(
        {
          requestId: request?._id,
          action: "accepted",
          performedBy,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          state: "accepted",
          timestamp: new Date(),
          details: {
            type: request.type,
            priority: request.priority,
            expectedCompletion: request.expectedCompletion,
            departmentId: request.participants.departmentId,
            notes: "Request accepted",
            additionalData: {
              assetId: request.assetId,
              requestType: request.type,
            },
          },
        },
        { session }
      );

      result = { request, updatedAsset };
    });

    return NextResponse.json({
      success: true,
      message: "Request accepted successfully",
      data: result,
    });
  } catch (err) {
    console.error("[PUT /api/requests/Accepted/[id]]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (session) await session.endSession();
  }
}
