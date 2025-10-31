#!/usr/bin/env node

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../.env') })

// Dynamic imports to handle ES modules
const mongoose = await import('mongoose')
const bcrypt = await import('bcryptjs')

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  position: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

// Reset admin password function
const resetAdminPassword = async () => {
  try {
    await connectMongoDB()
    
    // New password (you can change this)
    const newPassword = 'admin123'
    const saltRounds = 12
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
    
    // Find admin user (assuming email is admin@admin.com or role is admin)
    let adminUser = await User.findOne({ 
      $or: [
        { email: 'admin@admin.com' },
        { role: 'admin' },
        { role: 'ผู้ดูแลระบบ' }
      ] 
    })
    
    if (!adminUser) {
      // Create admin user if doesn't exist
      console.log('🔍 Admin user not found. Creating new admin user...')
      
      adminUser = new User({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        isActive: true
      })
      
      await adminUser.save()
      console.log('✅ New admin user created!')
    } else {
      // Update existing admin password
      console.log('🔍 Found admin user:', adminUser.email)
      
      adminUser.password = hashedPassword
      await adminUser.save()
      console.log('✅ Admin password updated!')
    }
    
    console.log('\n📝 Admin Credentials:')
    console.log('Email:', adminUser.email)
    console.log('Password:', newPassword)
    console.log('\n⚠️  Please change this password after logging in!')
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the script
resetAdminPassword()