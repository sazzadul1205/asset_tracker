import { MongoClient, ServerApiVersion } from "mongodb";

// MongoDB URI
const uri = process.env.MONGODB_URI;

// Check if MONGODB_URI is set
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

  // Connect to MongoDB
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

// Connect and return the DB (default behavior)
export async function connectDB() {
  const client = await global._mongoClientPromise;
  const dbName = process.env.MONGODB_DB || "assets_tracker";
  const db = client.db(dbName);

  if (process.env.NODE_ENV === "development") {
    console.log(`-- Connected to MongoDB DB: ${dbName}`);
  }

  return db;
}

// Return the raw MongoClient for transactions
export async function getMongoClient() {
  return await global._mongoClientPromise;
}

// Helper function to manually test connection
export async function testConnection() {
  try {
    const client = await global._mongoClientPromise;
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connection is alive!");
    return true;
  } catch (err) {
    console.error("MongoDB connection test failed:", err);
    return false;
  }
}
