# API Permissions Migration Guide

## ปัญหา
API endpoints ทั้งหมดตรวจสอบ `user.role` (string) แทนที่จะตรวจสอบ permissions จาก `user.roles` (array)

เช่น:
```typescript
// ❌ แบบเก่า - ตรวจสอบ role string
if (currentUser.role !== 'admin' && currentUser.role !== 'teacher') {
  throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
}
```

## การแก้ไข

### วิธีที่ 1: ใช้ `authenticateAndAuthorize` (แนะนำ)

```typescript
import { authenticateAndAuthorize } from '~/server/utils/api-auth'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    // Authenticate and check permission in one line
    const userId = await authenticateAndAuthorize(event, 'rooms.access')

    // ... rest of your API logic
  } catch (error: any) {
    // ... error handling
  }
})
```

### วิธีที่ 2: ใช้ `requirePermission` แบบแยก

```typescript
import { requirePermission } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    // Get token and verify
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)
    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    const decoded = verifyToken(token)

    // Check if user is active
    const currentUser = await User.findById(decoded.userId)
    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Check permission
    await requirePermission(decoded.userId, 'rooms.access')

    // ... rest of your API logic
  } catch (error: any) {
    // ... error handling
  }
})
```

## Permission Codes

### E-Learning Module
- `rooms.access` - จัดการห้องเรียน
- `students.access` - จัดการนักเรียน
- `courses.access` - จัดการรายวิชา
- `lessons.access` - จัดการบทเรียน

### Dashboard
- `dashboard.access` - หน้าหลัก

### User Management
- `user_management.access` - จัดการผู้ใช้
- `user_management.users` - จัดการ users
- `user_management.roles` - จัดการ roles
- `user_management.permissions` - จัดการ permissions

### Developer
- `demo.access` - Demo page
- `components.access` - Components showcase
- `i18n_test.access` - i18n testing

## ไฟล์ที่ต้องแก้ไข

### Rooms
- `/server/api/rooms/index.get.ts` ✅ แก้ไขแล้ว
- `/server/api/rooms/index.post.ts`
- `/server/api/rooms/[id].get.ts`
- `/server/api/rooms/[id].put.ts`
- `/server/api/rooms/[id].delete.ts`

### Students
- `/server/api/students/index.get.ts`
- `/server/api/students/index.post.ts`
- `/server/api/students/[id].get.ts`
- `/server/api/students/[id].put.ts`
- `/server/api/students/[id].delete.ts`
- `/server/api/students/import.post.ts`

### Courses
- `/server/api/courses/index.get.ts`
- `/server/api/courses/index.post.ts`
- `/server/api/courses/[id].get.ts`
- `/server/api/courses/[id].put.ts`
- `/server/api/courses/[id].delete.ts`

### Lessons
- `/server/api/lessons/index.get.ts`
- `/server/api/lessons/index.post.ts`
- `/server/api/lessons/[id].get.ts`
- `/server/api/lessons/[id].put.ts`
- `/server/api/lessons/[id].delete.ts`
- `/server/api/lessons/[id]/publish.put.ts`

### Quizzes
- `/server/api/quizzes/index.get.ts`
- `/server/api/quizzes/index.post.ts`
- `/server/api/quizzes/[id].get.ts`
- `/server/api/quizzes/[id].put.ts`
- `/server/api/quizzes/[id].delete.ts`
- `/server/api/quizzes/[id]/questions.get.ts`

### Quiz Attempts
- `/server/api/quiz-attempts/index.get.ts`
- `/server/api/quiz-attempts/[id].get.ts`
- `/server/api/quiz-attempts/[id]/grade.put.ts`

### Reports
- `/server/api/reports/class/[roomId].get.ts`
- `/server/api/reports/course/[courseId].get.ts`
- `/server/api/reports/quiz/[quizId].get.ts`
- `/server/api/reports/student/[studentId].get.ts`

## สคริปต์แก้ไขอัตโนมัติ

```bash
# แทนที่ pattern เก่าด้วยใหม่
find server/api -name "*.ts" -type f -exec sed -i '' \
  's/if (currentUser.role !== .admin. && currentUser.role !== .teacher.)/await requirePermission(decoded.userId, "PERMISSION_CODE")/g' {} \;
```

**หมายเหตุ:** ต้องแทนที่ `PERMISSION_CODE` ด้วย permission code ที่เหมาะสมกับแต่ละ endpoint
