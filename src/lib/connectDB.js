// lib/connectDB.js
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI in .env.local");
}

let client;
let clientPromise;

// Use a global variable to maintain client across hot‑reloads and serverless functions
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Adjusted for free cluster: lower pool size to avoid connection limits
    maxPoolSize: process.env.NODE_ENV === "development" ? 5 : 10,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
  });

  global._mongoClientPromise = client
    .connect()
    .then((conn) => {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ MongoDB client connected (cached)");
      }
      return conn;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
}

clientPromise = global._mongoClientPromise;

/**
 * Connects to MongoDB and returns the database instance.
 * Subsequent calls reuse the same client instance.
 *
 * @returns {Promise<import("mongodb").Db>} The MongoDB database object
 */
export async function connectDB() {
  const conn = await clientPromise;
  const dbName = process.env.MONGODB_DB || "AssetTracker";
  const db = conn.db(dbName);

  if (process.env.NODE_ENV === "development") {
    console.log(`📦 Connected to MongoDB DB: ${dbName}`);
  }

  return db;
}
