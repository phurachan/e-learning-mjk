# API Development Patterns

คู่มือสำหรับการพัฒนา API endpoints ในโปรเจค E-Learning MJK

## Table of Contents
- [โครงสร้างไฟล์](#โครงสร้างไฟล์)
- [Naming Conventions](#naming-conventions)
- [Authentication & Authorization](#authentication--authorization)
- [Request & Response Patterns](#request--response-patterns)
- [Error Handling](#error-handling)
- [Database Queries](#database-queries)
- [Best Practices](#best-practices)

---

## โครงสร้างไฟล์

```
server/
├── api/
│   ├── students/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   └── change-password.post.ts
│   │   ├── courses/
│   │   │   ├── index.get.ts
│   │   │   └── [id].get.ts
│   │   └── dashboard.get.ts
│   ├── quiz-attempts/
│   │   ├── my-attempts.get.ts
│   │   └── [id].get.ts
│   └── dev/
│       └── seed-student-data.post.ts
├── models/
│   ├── Student.ts
│   ├── Course.ts
│   └── index.ts
└── utils/
    ├── jwt.ts
    ├── responseHandler.ts
    └── filter_config/
```

### File Naming Pattern

- **GET all**: `index.get.ts`
- **GET by ID**: `[id].get.ts`
- **POST**: `index.post.ts` หรือ `action.post.ts`
- **PUT**: `[id].put.ts`
- **DELETE**: `[id].delete.ts`

---

## Naming Conventions

### Endpoints
- ใช้ plural nouns: `/api/students`, `/api/courses`
- ใช้ kebab-case: `/api/quiz-attempts`
- Nested resources: `/api/students/courses`
- Actions: `/api/students/auth/login`

### Variables & Functions
- camelCase สำหรับ variables: `studentId`, `courseData`
- Async functions ขึ้นต้นด้วย verb: `fetchStudent`, `createCourse`
- Boolean ขึ้นต้นด้วย is/has: `isActive`, `hasPermission`

---

## Authentication & Authorization

### 1. JWT Token Authentication

```typescript
import { extractTokenFromHeader, verifyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    // Extract token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'UNAUTHORIZED',
        message: 'Not authenticated',
      })
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    // Check role
    if (decoded.role !== 'student') {
      throw createError({
        statusCode: 403,
        statusMessage: 'FORBIDDEN',
        message: 'Invalid role',
      })
    }

    // Use decoded.userId for queries
    const userId = decoded.userId

  } catch (error) {
    // Handle error
  }
})
```

### 2. Optional Authentication

```typescript
// For endpoints that work with or without auth
const authHeader = getHeader(event, 'authorization')
const token = extractTokenFromHeader(authHeader)
const decoded = token ? verifyToken(token) : null
```

---

## Request & Response Patterns

### 1. GET Requests

```typescript
// GET /api/students/courses
export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search as string

    // Get URL parameters
    const { id } = event.context.params

    // Build query
    const filter: any = { isActive: true }
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    // Fetch data with pagination
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      Model.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('relation')
        .sort({ createdAt: -1 })
        .lean(),
      Model.countDocuments(filter)
    ])

    return {
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to fetch data',
    })
  }
})
```

### 2. POST Requests

```typescript
// POST /api/students/courses
export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'BAD_REQUEST',
        message: 'Missing required fields',
      })
    }

    // Check duplicates
    const existing = await Model.findOne({ code: body.code })
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'CONFLICT',
        message: 'Course code already exists',
      })
    }

    // Create new record
    const newItem = await Model.create({
      name: body.name,
      code: body.code,
      // ... other fields
    })

    return {
      success: true,
      data: newItem,
      message: 'Created successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to create',
    })
  }
})
```

### 3. PUT Requests

```typescript
// PUT /api/students/courses/[id]
export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params
    const body = await readBody(event)

    // Find and update
    const updated = await Model.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NOT_FOUND',
        message: 'Item not found',
      })
    }

    return {
      success: true,
      data: updated,
      message: 'Updated successfully'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to update',
    })
  }
})
```

### 4. DELETE Requests

```typescript
// DELETE /api/students/courses/[id]
export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params

    // Soft delete (recommended)
    const deleted = await Model.findByIdAndUpdate(
      id,
      { $set: { isActive: false, deletedAt: new Date() } },
      { new: true }
    )

    // Hard delete (use with caution)
    // const deleted = await Model.findByIdAndDelete(id)

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NOT_FOUND',
        message: 'Item not found',
      })
    }

    return {
      success: true,
      message: 'Deleted successfully'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to delete',
    })
  }
})
```

---

## Error Handling

### Standard Error Structure

```typescript
throw createError({
  statusCode: 400,        // HTTP status code
  statusMessage: 'BAD_REQUEST',  // Error code
  message: 'User-friendly error message',  // Error description
})
```

### Common Status Codes

| Code | Status | Use Case |
|------|--------|----------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

### Error Handling Pattern

```typescript
try {
  // Your code here
} catch (error: any) {
  // Re-throw if already formatted
  if (error.statusCode) {
    throw error
  }

  // Log error for debugging
  console.error('API Error:', error)

  // Throw formatted error
  throw createError({
    statusCode: 500,
    statusMessage: 'INTERNAL_SERVER_ERROR',
    message: error.message || 'Operation failed',
  })
}
```

---

## Database Queries

### Mongoose Best Practices

```typescript
// ✅ GOOD: Use lean() for read-only queries (faster)
const courses = await Course.find({ isActive: true }).lean()

// ✅ GOOD: Select only needed fields
const courses = await Course.find()
  .select('name code teacher')
  .lean()

// ✅ GOOD: Use populate for relations
const courses = await Course.find()
  .populate('teacher', 'name email')
  .populate('rooms', 'name code')
  .lean()

// ✅ GOOD: Use Promise.all for parallel queries
const [courses, total] = await Promise.all([
  Course.find().lean(),
  Course.countDocuments()
])

// ❌ BAD: N+1 queries
for (const course of courses) {
  const teacher = await Teacher.findById(course.teacher)  // Bad!
}

// ✅ GOOD: Aggregate complex data
const stats = await Course.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$semester', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Pagination Pattern

```typescript
const page = Number(query.page) || 1
const limit = Number(query.limit) || 10
const skip = (page - 1) * limit

const [items, total] = await Promise.all([
  Model.find(filter)
    .skip(skip)
    .limit(limit)
    .lean(),
  Model.countDocuments(filter)
])

return {
  success: true,
  data: items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  }
}
```

---

## Best Practices

### 1. JSDoc Comments
```typescript
/**
 * GET /api/students/courses
 * Get all courses for authenticated student
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string (optional)
 *
 * Returns:
 * - List of courses with pagination
 */
export default defineEventHandler(async (event) => {
  // ...
})
```

### 2. Type Safety
```typescript
// Define interfaces for request/response
interface CourseResponse {
  _id: string
  name: string
  code: string
  teacher: {
    name: string
    email: string
  }
}

// Use in code
const courses: CourseResponse[] = await Course.find().lean()
```

### 3. Input Validation
```typescript
// Validate required fields
const requiredFields = ['name', 'code', 'teacher']
for (const field of requiredFields) {
  if (!body[field]) {
    throw createError({
      statusCode: 400,
      statusMessage: 'BAD_REQUEST',
      message: `Missing required field: ${field}`,
    })
  }
}

// Validate data types
if (typeof body.name !== 'string') {
  throw createError({
    statusCode: 400,
    statusMessage: 'BAD_REQUEST',
    message: 'Name must be a string',
  })
}
```

### 4. Security
```typescript
// ✅ Always validate user permissions
const student = await Student.findById(decoded.userId)
if (!student || !student.isActive) {
  throw createError({
    statusCode: 403,
    statusMessage: 'FORBIDDEN',
    message: 'Account is inactive',
  })
}

// ✅ Sanitize user input
const sanitizedName = body.name.trim()

// ✅ Use parameterized queries (Mongoose handles this)
const course = await Course.findOne({ code: userInput })  // Safe

// ❌ Never expose sensitive data
delete student.password  // Remove before sending
```

### 5. Performance
```typescript
// ✅ Use indexes (in Model schema)
// courseSchema.index({ code: 1 })
// courseSchema.index({ isActive: 1, semester: 1 })

// ✅ Limit populated fields
.populate('teacher', 'name email')  // Only get needed fields

// ✅ Use lean() for read-only
.lean()  // Returns plain JS object, faster

// ✅ Batch operations
await Model.insertMany(items)  // Instead of multiple create()
```

### 6. Testing
```bash
# Test with curl
curl -X GET http://localhost:3000/api/students/courses \
  -H "Authorization: Bearer TOKEN"

# Test with jq for pretty output
curl -X GET http://localhost:3000/api/students/courses | jq '.'
```

---

## Quick Reference

### Essential Imports
```typescript
import Model from '../../models/Model'
import { extractTokenFromHeader, verifyToken } from '../../utils/jwt'
```

### Common Helpers
```typescript
const body = await readBody(event)           // POST/PUT body
const query = getQuery(event)                // Query params
const { id } = event.context.params          // URL params
const header = getHeader(event, 'name')      // Headers
```

### Response Format
```typescript
// Success
return { success: true, data: result }

// Error
throw createError({
  statusCode: 400,
  statusMessage: 'ERROR_CODE',
  message: 'Error message',
})
```

---

## Related Documentation
- [UI Patterns](./UI_PATTERNS.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Architecture](./ARCHITECTURE.md)
