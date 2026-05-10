import mongoose from 'mongoose'

const mongoUri = process.env.MONGO_URI

export async function connectDatabase(): Promise<boolean> {
  if (!mongoUri) {
    console.warn('⚠️  MONGO_URI not set - using in-memory storage (data will be lost on restart)')
    return false
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connected successfully')
    return true
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error instanceof Error ? error.message : error)
    console.warn('⚠️  Falling back to in-memory storage (data will be lost on restart)')
    return false
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState > 0) {
    await mongoose.disconnect()
  }
}
