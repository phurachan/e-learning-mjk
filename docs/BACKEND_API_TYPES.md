# Backend API Types Reference

**Purpose**: This document serves as a single source of truth for all Backend API request/response formats. Always refer to this document before creating Frontend models.

**Version**: 1.0
**Last Updated**: October 2025

---

## 📋 How to Use This Document

### When Creating New Frontend Features:
1. ✅ Read this document FIRST
2. ✅ Check Backend Model (`server/models/*.ts`)
3. ✅ Check Backend API endpoints (`server/api/*`)
4. ✅ Create Frontend data models matching Backend response
5. ✅ Create Frontend store models matching Backend request
6. ✅ Build UI components
7. ✅ Test with actual Backend

### ⚠️ Field Naming Rules:
- Backend uses **lowercase** field names: `firstname`, `lastname`, `phone`
- Frontend MUST match Backend exactly
- **DO NOT** use camelCase (`firstName`) unless Backend uses it
- **DO NOT** add fields that don't exist in Backend

---

## Students API

### Model Fields (server/models/Student.ts)
```typescript
{
  _id: ObjectId
  studentId: string           // required, unique, uppercase
  password: string            // required, hashed, min 6 chars
  firstname: string           // required, max 50 chars
  lastname: string            // required, max 50 chars
  fullname: string            // auto-generated from firstname + lastname
  phone?: string              // optional, max 20 chars
  avatar?: string             // optional
  room?: ObjectId             // optional, ref: 'Room'
  dateOfBirth?: Date          // optional
  address?: string            // optional, max 200 chars
  parentName?: string         // optional, max 100 chars
  parentPhone?: string        // optional, max 20 chars
  isActive: boolean           // default: true
  isChangePassword: boolean   // default: true
  createdBy: ObjectId         // required, ref: 'User'
  createdAt: Date
  updatedAt: Date
}
```

### GET /api/students
**Query Parameters:**
```typescript
{
  search?: string                    // searches in firstname, lastname, studentId
  filter?: {
    room?: string                    // ObjectId as string
    isActive?: boolean
  }
  pagination?: {
    page?: number                    // default: 1
    limit?: number                   // default: 20
  }
}
```

**Response:**
```typescript
{
  success: true
  data: [{
    id: string                       // _id converted to string
    studentId: string
    firstname: string
    lastname: string
    fullname: string
    phone?: string
    avatar?: string
    room?: {
      id: string
      name: string
      code: string
      grade: number
      section: string
      academicYear: string
    }
    dateOfBirth?: string
    address?: string
    parentName?: string
    parentPhone?: string
    isActive: boolean
    createdBy?: {
      id: string
      name: string
      email: string
    }
    createdAt: string
    updatedAt: string
  }]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### POST /api/students
**Request Body:**
```typescript
{
  studentId: string            // required
  firstname: string            // required
  lastname: string             // required
  password?: string            // optional, auto-generated from dateOfBirth if not provided
  phone?: string               // optional
  room?: string                // optional, ObjectId as string
  dateOfBirth?: string         // optional, ISO date string
  address?: string             // optional
  parentName?: string          // optional
  parentPhone?: string         // optional
  isActive?: boolean           // optional, default: true
}
```

**Response:**
```typescript
{
  success: true
  data: {
    id: string
    studentId: string
    firstname: string
    lastname: string
    fullname: string
    phone?: string
    room: {
      id: string
      name: string
      code: string
      grade: number
      section: string
      academicYear: string
    }
    dateOfBirth?: string
    address?: string
    parentName?: string
    parentPhone?: string
    isActive: boolean
    createdBy: {
      id: string
      name: string
      email: string
    }
    createdAt: string
    updatedAt: string
  }
}
```

### PUT /api/students/[id]
**Request Body:**
```typescript
{
  studentId?: string           // optional
  firstname?: string           // optional
  lastname?: string            // optional
  password?: string            // optional
  phone?: string               // optional
  room?: string                // optional, ObjectId as string
  dateOfBirth?: string         // optional
  address?: string             // optional
  parentName?: string          // optional
  parentPhone?: string         // optional
  isActive?: boolean           // optional
}
```

**Response:** Same as POST response

### DELETE /api/students/[id]
**Response:**
```typescript
{
  success: true
  message: string
}
```

---

## Rooms API

### Model Fields (server/models/Room.ts)
```typescript
{
  _id: ObjectId
  code: string                // required, unique
  name: string                // required
  grade: number               // required, 1-12
  section: string             // required
  academicYear: string        // required
  capacity: number            // required
  isActive: boolean           // default: true
  createdBy: ObjectId         // required, ref: 'User'
  createdAt: Date
  updatedAt: Date
}
```

### GET /api/rooms
**Query Parameters:**
```typescript
{
  search?: string              // searches in name, code
  filter?: {
    grade?: number
    academicYear?: string
    isActive?: boolean
  }
  pagination?: {
    page?: number
    limit?: number
  }
}
```

**Response:**
```typescript
{
  success: true
  data: [{
    id: string
    code: string
    name: string
    grade: number
    section: string
    academicYear: string
    capacity: number
    isActive: boolean
    createdAt: string
    updatedAt: string
  }]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### POST /api/rooms
**Request Body:**
```typescript
{
  code: string                // required
  name: string                // required
  grade: number               // required, 1-12
  section: string             // required
  academicYear: string        // required
  capacity: number            // required
  isActive?: boolean          // optional, default: true
}
```

### PUT /api/rooms/[id]
**Request Body:** All fields optional (same as POST but all optional)

### DELETE /api/rooms/[id]
**Response:**
```typescript
{
  success: true
  message: string
}
```

---

## Courses API

### Model Fields (server/models/Course.ts)
```typescript
{
  _id: ObjectId
  name: string                // required, max 100 chars
  code: string                // required, unique, uppercase, max 20 chars
  description?: string        // optional, max 500 chars
  teacher: ObjectId           // required, ref: 'User' (must have role: 'teacher')
  rooms: ObjectId[]           // array of room references, ref: 'Room'
  academicYear: string        // required, format: YYYY (4 digits)
  semester: number            // required, enum: [1, 2]
  isActive: boolean           // default: true
  createdBy: ObjectId         // required, ref: 'User'
  createdAt: Date
  updatedAt: Date
}
```

### GET /api/courses
**Query Parameters:**
```typescript
{
  search?: string                    // searches in name, code
  filter?: {
    teacher?: string                 // ObjectId as string
    academicYear?: string
    semester?: number                // 1 or 2
    isActive?: boolean
  }
  pagination?: {
    page?: number                    // default: 1
    limit?: number                   // default: 20
  }
}
```

**Response:**
```typescript
{
  success: true
  data: [{
    id: string                       // _id converted to string
    name: string
    code: string
    description?: string
    teacher: {
      id: string
      name: string
      email: string
    }
    rooms: [{
      id: string
      name: string
      code: string
      grade: number
      section: string
      academicYear: string
    }]
    academicYear: string
    semester: number
    isActive: boolean
    createdBy?: {
      id: string
      name: string
      email: string
    }
    createdAt: string
    updatedAt: string
  }]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### POST /api/courses
**Request Body:**
```typescript
{
  name: string                // required
  code: string                // required
  description?: string        // optional
  teacher: string             // required, ObjectId as string (must be user with role: 'teacher')
  rooms?: string[]            // optional, array of ObjectId as strings
  academicYear: string        // required, YYYY format
  semester: number            // required, 1 or 2
  isActive?: boolean          // optional, default: true
}
```

**Response:**
```typescript
{
  success: true
  data: {
    id: string
    name: string
    code: string
    description?: string
    teacher: {
      id: string
      name: string
      email: string
    }
    rooms: [{
      id: string
      name: string
      code: string
      grade: number
      section: string
      academicYear: string
    }]
    academicYear: string
    semester: number
    isActive: boolean
    createdBy: {
      id: string
      name: string
      email: string
    }
    createdAt: string
    updatedAt: string
  }
}
```

### PUT /api/courses/[id]
**Request Body:**
```typescript
{
  name?: string
  code?: string
  description?: string
  teacher?: string            // ObjectId as string
  rooms?: string[]            // array of ObjectId as strings
  academicYear?: string
  semester?: number
  isActive?: boolean
}
```

**Response:** Same as POST response

### DELETE /api/courses/[id]
**Response:**
```typescript
{
  success: true
  message: string
}
```

---

## Lessons API

### Model Fields (server/models/Lesson.ts)
```typescript
{
  _id: ObjectId
  title: string               // required, max 200 chars
  description?: string        // optional, max 500 chars
  content: string             // required, HTML content
  course: ObjectId            // required, ref: 'Course'
  order: number               // required, min 1
  attachments?: Array<{       // optional
    name: string
    url: string
    type: string
    size: number
  }>
  publishDate?: Date          // optional
  isPublished: boolean        // default: false
  isActive: boolean           // default: true
  createdBy: ObjectId         // required, ref: 'User'
  createdAt: Date
  updatedAt: Date
}
```

### GET /api/lessons
**Query Parameters:**
```typescript
{
  search?: string                    // searches in title, description
  filter?: {
    course?: string                  // ObjectId as string
    isPublished?: boolean
    isActive?: boolean
  }
  pagination?: {
    page?: number                    // default: 1
    limit?: number                   // default: 20
  }
}
```

**Response:**
```typescript
{
  success: true
  data: [{
    id: string                       // _id converted to string
    title: string
    description?: string
    content: string
    course: {
      id: string
      name: string
      code: string
    }
    order: number
    attachments?: [{
      name: string
      url: string
      type: string
      size: number
    }]
    publishDate?: string
    isPublished: boolean
    isActive: boolean
    createdBy?: {
      id: string
      name: string
      email: string
    }
    createdAt: string
    updatedAt: string
  }]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### POST /api/lessons
**Request Body:**
```typescript
{
  title: string                // required
  description?: string         // optional
  content: string              // required, HTML
  course: string               // required, ObjectId as string
  order: number                // required, min 1
  attachments?: Array<{        // optional
    name: string
    url: string
    type: string
    size: number
  }>
  publishDate?: string         // optional, ISO date
  isPublished?: boolean        // optional, default: false
  isActive?: boolean           // optional, default: true
}
```

**Response:**
```typescript
{
  success: true
  data: {
    id: string
    title: string
    description?: string
    content: string
    course: {
      id: string
      name: string
      code: string
    }
    order: number
    attachments?: [{
      name: string
      url: string
      type: string
      size: number
    }]
    publishDate?: string
    isPublished: boolean
    isActive: boolean
    createdBy: {
      id: string
      name: string
      email: string
    }
    createdAt: string
    updatedAt: string
  }
}
```

### PUT /api/lessons/[id]
**Request Body:**
```typescript
{
  title?: string
  description?: string
  content?: string
  course?: string              // ObjectId as string
  order?: number
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
  publishDate?: string
  isPublished?: boolean
  isActive?: boolean
}
```

**Response:** Same as POST response

### PUT /api/lessons/[id]/publish
**Request Body:**
```typescript
{
  isPublished: boolean
  publishDate?: string         // optional, ISO date
}
```

**Response:** Same as POST response

### DELETE /api/lessons/[id]
**Response:**
```typescript
{
  success: true
  message: string
}
```

---

## 🎯 Key Learnings

### Common Mistakes to Avoid:
1. ❌ Using `firstName` instead of `firstname`
2. ❌ Using `phoneNumber` instead of `phone`
3. ❌ Adding fields not in Backend (like `email` for Students)
4. ❌ Using `rooms[]` array when Backend uses `room` single object
5. ❌ Using camelCase when Backend uses lowercase

### Best Practices:
1. ✅ Always check Backend Model first
2. ✅ Match field names exactly
3. ✅ Respect required vs optional fields
4. ✅ Use correct data types (string, number, boolean, Date)
5. ✅ Handle optional fields with `?` in TypeScript
6. ✅ Convert ObjectId to string for Frontend
7. ✅ Use proper date formats (ISO strings)

---

## 📝 Update Log

| Date | Feature | Changes |
|------|---------|---------|
| Oct 2025 | Students | Initial documentation - corrected Frontend to match Backend |
| Oct 2025 | Rooms | Initial documentation |
| Oct 2025 | Courses | Added Courses API documentation with teacher and rooms references |
| Oct 17, 2025 | Lessons | Added Lessons API documentation with Rich Text Editor and file attachments support |

---

## 🔗 Related Documents

- Backend Models: `server/models/*.ts`
- Backend APIs: `server/api/*`
- API Documentation: `API_DOCUMENTATION.md`
- Frontend Data Models: `composables/data_models/*.ts`
- Frontend Store Models: `composables/store_models/*.ts`
