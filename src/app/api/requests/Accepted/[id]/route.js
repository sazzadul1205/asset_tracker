// src/app/api/requests/Accepted/[id]/route.js
import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/connectDB";
import { ObjectId } from "mongodb";

export async function PUT(req, context) {
  let session;

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Request ID required" },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db("assets_tracker"); // Use the correct DB
    const requestsCollection = db.collection("requests");
    const assetsCollection = db.collection("assets");

    // Parse body
    const payload = await req.json();
    const currentUserId = payload?.UserId;
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: "UserId required in payload" },
        { status: 400 }
      );
    }

    const requestId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    // Start transaction
    session = client.startSession();

    let result;
    await session.withTransaction(async () => {
      // Fetch request
      const request = await requestsCollection.findOne(
        { _id: requestId },
        { session }
      );
      if (!request) throw new Error(`Request not found: ${id}`);

      console.log("[DEBUG] Request fetched:", request);

      // Update request status
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

      // Determine assignment IDs
      const assignedBy =
        request.participants.requestedToId === "-"
          ? currentUserId
          : request.participants.requestedToId;
      const requestedBy =
        request.participants.requestedById === "-"
          ? currentUserId
          : request.participants.requestedById;
      const assignedAt = new Date();

      // Update asset based on request type
      const assetId = request.assetId;
      let updatedAsset;

      switch (request.type) {
        // Request Type "Assign"
        case "assign":
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
        // Request Type "Request"
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
        // Request Type "Request"
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
        // Request Type "Repair"
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
        // Request Type "Retire"
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
        // Request Type "Transfer"
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
        // Request Type "Update"
        case "update":
          updatedAsset = await assetsCollection.findOneAndUpdate(
            { "identification.tag": assetId },
            {
              $set: {
                "details.status": "update_pending",
              },
            },
            { session, returnDocument: "after" }
          );
          break;

        // Request Type "Update"
        case "update":
          updatedAsset = await assetsCollection.findOneAndUpdate(
            { "identification.tag": assetId },
            {
              $set: {
                "assigned.assignedTo": null,
                "assigned.assignedBy": null,
                "assigned.assignedAt": null,
                "details.status": "pending_disposal",
              },
            },
            { session, returnDocument: "after" }
          );
          break;

        // If No Matching Case
        default:
          NextResponse.json(
            {
              success: false,
              message: `Invalid request type: ${request.type}`,
            },
            { status: 400 }
          );
          updatedAsset = null;
      }

      result = { request, updatedAsset };
    });

    return NextResponse.json({
      success: true,
      message: "Request accepted successfully",
      data: result,
    });
  } catch (err) {
    console.error("[ERROR] PUT /api/requests/Accepted/[id]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (session) await session.endSession();
  }
}
