import mongoose from 'mongoose'
import { loadAllModels } from './loadModels'

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env')
}

interface Global {
  mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

declare const global: Global

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGO_URI!, opts).then(async (mongoose) => {
      // Load all models after connection
      await loadAllModels()
      return mongoose
    })
  }
  
  cached.conn = await cached.promise
  return cached.conn
}

export default connectMongoDB