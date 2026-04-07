import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = global.mongooseCache ?? { conn: null, promise: null };

global.mongooseCache = cache;

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    let dbName = process.env.MONGODB_DB;

    if (!dbName) {
      try {
        const parsed = new URL(mongoUri);
        const pathDb = parsed.pathname.replace(/^\//, "").trim();
        if (pathDb) {
          dbName = pathDb;
        }
      } catch {
        dbName = undefined;
      }
    }

    cache.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      dbName: dbName || "abha_hrms",
    });
  }

  cache.conn = await cache.promise;

  return cache.conn;
}