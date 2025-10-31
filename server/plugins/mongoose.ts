import mongoose from 'mongoose'

export default defineNitroPlugin(async (nitro) => {
  const config = useRuntimeConfig()
  const mongoUri = config.MONGO_URI || process.env.MONGO_URI

  if (!mongoUri) {
    console.warn('⚠️  MONGO_URI not found in environment variables')
    return
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connected successfully')

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
    })

    // Graceful shutdown
    nitro.hooks.hook('close', async () => {
      await mongoose.connection.close()
      console.log('MongoDB connection closed')
    })
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error.message)
    throw error
  }
})
