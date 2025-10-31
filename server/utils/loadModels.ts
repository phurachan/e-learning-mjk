// Ensure all Mongoose models are loaded and registered
// This is critical for production builds where dynamic imports may not work as expected

let modelsLoaded = false

export async function loadAllModels() {
  if (modelsLoaded) return
  
  try {
    // Import models in dependency order to avoid circular reference issues
    const models = await Promise.all([
      import('../models/Permission'),
      import('../models/Role'), 
      import('../models/User')
    ])
    
    // Verify models are actually loaded
    const modelNames = models.map((m, i) => {
      const modelName = ['Permission', 'Role', 'User'][i]
      return `${modelName}: ${m.default ? '✓' : '✗'}`
    }).join(', ')
    
    console.log(`✅ Models loaded: ${modelNames}`)
    modelsLoaded = true
  } catch (error) {
    console.error('❌ Error loading models:', error)
    throw error
  }
}