import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Define initial permissions for the E-Learning system
    const initialPermissions = [
      // ========================================
      // MENU PERMISSIONS
      // ========================================
      {
        code: 'dashboard.access',
        name: 'หน้าหลัก',
        description: 'Access to dashboard page',
        module: 'dashboard',
        moduleName: 'หน้าหลัก',
        action: 'access',
        resource: 'dashboard',
        icon: 'home',
        path: '/admin',
        type: 'menu',
        isActive: true
      },
      {
        code: 'rooms.access',
        name: 'จัดการห้องเรียน',
        description: 'Access to rooms management',
        module: 'e_learning',
        moduleName: 'E-Learning',
        action: 'access',
        resource: 'rooms',
        icon: 'academic-cap',
        path: '/admin/rooms',
        type: 'menu',
        isActive: true
      },
      {
        code: 'students.access',
        name: 'จัดการนักเรียน',
        description: 'Access to students management',
        module: 'e_learning',
        moduleName: 'E-Learning',
        action: 'access',
        resource: 'students',
        icon: 'users',
        path: '/admin/students',
        type: 'menu',
        isActive: true
      },
      {
        code: 'courses.access',
        name: 'จัดการรายวิชา',
        description: 'Access to courses management',
        module: 'e_learning',
        moduleName: 'E-Learning',
        action: 'access',
        resource: 'courses',
        icon: 'book-open',
        path: '/admin/courses',
        type: 'menu',
        isActive: true
      },
      {
        code: 'lessons.access',
        name: 'จัดการบทเรียน',
        description: 'Access to lessons management',
        module: 'e_learning',
        moduleName: 'E-Learning',
        action: 'access',
        resource: 'lessons',
        icon: 'document-text',
        path: '/admin/lessons',
        type: 'menu',
        isActive: true
      },
      {
        code: 'user_management.access',
        name: 'จัดการผู้ใช้',
        description: 'Access to user management module',
        module: 'user_management',
        moduleName: 'การจัดการผู้ใช้',
        action: 'access',
        resource: 'user_management',
        icon: 'user',
        path: '/admin/user_management',
        type: 'menu',
        isActive: true
      },
      {
        code: 'demo.access',
        name: 'Demo',
        description: 'Developer demo page',
        module: 'developer',
        moduleName: 'นักพัฒนา',
        action: 'access',
        resource: 'demo',
        icon: 'server',
        path: '/admin/demo',
        type: 'menu',
        isActive: true
      },
      {
        code: 'components.access',
        name: 'Components',
        description: 'Developer components showcase',
        module: 'developer',
        moduleName: 'นักพัฒนา',
        action: 'access',
        resource: 'components',
        icon: 'puzzle-piece',
        path: '/admin/components',
        type: 'menu',
        isActive: true
      },
      {
        code: 'i18n_test.access',
        name: 'i18n Test',
        description: 'i18n testing page',
        module: 'developer',
        moduleName: 'นักพัฒนา',
        action: 'access',
        resource: 'i18n_test',
        icon: 'language',
        path: '/admin/i18n-test',
        type: 'menu',
        isActive: true
      },

      // ========================================
      // ACTION PERMISSIONS
      // ========================================
      {
        code: 'user_management.users',
        name: 'ผู้ใช้ระบบ',
        description: 'Assign roles to users',
        module: 'user_management',
        moduleName: 'การจัดการผู้ใช้',
        action: 'update',
        resource: 'users',
        type: 'action',
        isActive: true
      },
      {
        code: 'user_management.roles',
        name: 'บทบาท',
        description: 'Manage roles and permissions',
        module: 'user_management',
        moduleName: 'การจัดการผู้ใช้',
        action: 'update',
        resource: 'roles',
        type: 'action',
        isActive: true
      },
      {
        code: 'user_management.permissions',
        name: 'สิทธิ์การใช้งาน',
        description: 'Manage permissions',
        module: 'user_management',
        moduleName: 'การจัดการผู้ใช้',
        action: 'update',
        resource: 'permissions',
        type: 'action',
        isActive: true
      }
    ]

    // Insert permissions if they don't exist
    let createdCount = 0
    let skippedCount = 0

    for (const permissionData of initialPermissions) {
      const existing = await Permission.findOne({ code: permissionData.code })

      if (!existing) {
        await Permission.create(permissionData)
        createdCount++
      } else {
        skippedCount++
      }
    }

    return createSuccessResponse({
      created: createdCount,
      skipped: skippedCount,
      total: initialPermissions.length
    }, {
      additionalData: {
        message: `Permissions seeded successfully. Created: ${createdCount}, Skipped: ${skippedCount}`,
      }
    })
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: fieldErrors
      })
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})