// lib/connectDB.js
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI in .env.local");
}

// Global client caching
if (!global._mongoClient) {
  global._mongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: process.env.NODE_ENV === "development" ? 5 : 10,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
  });

  global._mongoClientPromise = global._mongoClient
    .connect()
    .then((conn) => {
      if (process.env.NODE_ENV === "development") {
        console.log("MongoDB client connected (cached)");
      }
      return conn;
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      throw err;
    });
}

// Connect and return the DB
export async function connectDB() {
  const client = await global._mongoClientPromise;
  const dbName = process.env.MONGODB_DB || "assets_tracker";
  const db = client.db(dbName);

  if (process.env.NODE_ENV === "development") {
    console.log(`-- Connected to MongoDB DB: ${dbName}`);
  }

  return db;
}

// Helper function to manually test connection
export async function testConnection() {
  try {
    const client = await global._mongoClientPromise;
    // Ping the admin database
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connection is alive!");
    return true;
  } catch (err) {
    console.error(" MongoDB connection test failed:", err);
    return false;
  }
}
