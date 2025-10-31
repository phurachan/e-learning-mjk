# E-Learning MJK API Documentation

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://e-learning-mjk.vercel.app/api`

## Authentication
ส่ง JWT token ใน Authorization header:
```
Authorization: Bearer <token>
```

---

## 📚 Phase 1: Core Management

### 1. Room Management (`/rooms`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rooms` | ดึงรายการห้องเรียน | admin, teacher |
| POST | `/rooms` | สร้างห้องเรียน | admin |
| GET | `/rooms/:id` | ดึงข้อมูลห้องเรียน | admin, teacher |
| PUT | `/rooms/:id` | แก้ไขห้องเรียน | admin |
| DELETE | `/rooms/:id` | ลบห้องเรียน | admin |

**Query Parameters (GET /rooms):**
- `page` - หน้า (default: 1)
- `limit` - จำนวนต่อหน้า (default: 10)
- `search` - ค้นหาจากชื่อ/รหัส
- `filter[grade]` - กรองตามระดับชั้น
- `filter[academicYear]` - กรองตามปีการศึกษา
- `filter[isActive]` - กรองตามสถานะ

**Request Body (POST/PUT):**
```json
{
  "name": "ม.1/1",
  "code": "M1-1",
  "grade": 1,
  "section": "1",
  "academicYear": "2568",
  "capacity": 40,
  "isActive": true
}
```

---

### 2. Student Management (`/students`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/students` | ดึงรายการนักเรียน | admin, teacher |
| POST | `/students` | สร้างนักเรียน | admin, teacher |
| GET | `/students/:id` | ดึงข้อมูลนักเรียน | admin, teacher |
| PUT | `/students/:id` | แก้ไขนักเรียน | admin, teacher |
| DELETE | `/students/:id` | ลบนักเรียน | admin, teacher |
| POST | `/students/import` | Import นักเรียนจาก CSV | admin, teacher |
| POST | `/students/auth/login` | Login นักเรียน | - |
| POST | `/students/auth/change-password` | เปลี่ยน password | student |

**Request Body (POST/PUT):**
```json
{
  "studentId": "S2568001",
  "password": "password123",  // Optional - จะ auto-generate จาก dateOfBirth (ddmmyyyy) ถ้าไม่ระบุ
  "firstname": "สมชาย",
  "lastname": "ใจดี",
  "phone": "081-234-5678",
  "room": "64f123456789abcd12345681",
  "dateOfBirth": "2010-05-15",
  "address": "123 ถนนสุขุมวิท",
  "parentName": "นายสมศักดิ์ ใจดี",
  "parentPhone": "089-876-5432",
  "isActive": true
}
```

**Student Login:**
```json
{
  "studentId": "S2568001",
  "password": "password123"
}
```

**CSV Import Format:**
```csv
studentId,firstname,lastname,room,dateOfBirth,phone,address,parentName,parentPhone
S2568001,สมชาย,ใจดี,64f123456789abcd12345681,2010-05-15,081-234-5678,123 ถนน,นายสมศักดิ์,089-876-5432
```

**หมายเหตุ:**
- Password จะถูกสร้างอัตโนมัติจาก `dateOfBirth` ในรูปแบบ `ddmmyyyy` (เช่น 2010-05-15 → password: 15052010)
- `isChangePassword` จะถูก set เป็น `true` เพื่อบังคับให้เปลี่ยน password ในครั้งแรก
- นักเรียนต้องเปลี่ยน password ผ่าน `/students/auth/change-password` หลัง login ครั้งแรก

---

### 3. Course Management (`/courses`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/courses` | ดึงรายการวิชา | admin, teacher |
| POST | `/courses` | สร้างวิชา | admin |
| GET | `/courses/:id` | ดึงข้อมูลวิชา | admin, teacher |
| PUT | `/courses/:id` | แก้ไขวิชา | admin |
| DELETE | `/courses/:id` | ลบวิชา | admin |

**Request Body (POST/PUT):**
```json
{
  "name": "คณิตศาสตร์",
  "code": "MATH101",
  "description": "คณิตศาสตร์พื้นฐาน ม.1",
  "teacher": "64f123456789abcd12345678",
  "rooms": ["64f123456789abcd12345681"],
  "academicYear": "2568",
  "semester": 1,
  "isActive": true
}
```

---

## 📖 Phase 2: Content Management

### 4. Lesson Management (`/lessons`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/lessons` | ดึงรายการบทเรียน | admin, teacher, student |
| POST | `/lessons` | สร้างบทเรียน | admin, teacher |
| GET | `/lessons/:id` | ดึงข้อมูลบทเรียน | admin, teacher, student |
| PUT | `/lessons/:id` | แก้ไขบทเรียน | admin, teacher |
| DELETE | `/lessons/:id` | ลบบทเรียน | admin, teacher |
| PUT | `/lessons/:id/publish` | เผยแพร่/ยกเลิกเผยแพร่ | admin, teacher |

**Request Body (POST/PUT):**
```json
{
  "title": "บทที่ 1: จำนวนเต็ม",
  "description": "เรียนรู้เกี่ยวกับจำนวนเต็มบวกและลบ",
  "content": "<p>เนื้อหาบทเรียน...</p>",
  "course": "64f123456789abcd12345683",
  "order": 1,
  "attachments": [
    {
      "name": "worksheet.pdf",
      "url": "/uploads/worksheet.pdf",
      "type": "application/pdf",
      "size": 1024000
    }
  ],
  "publishDate": "2025-01-15T00:00:00Z",
  "isPublished": true
}
```

**Publish/Unpublish:**
```json
{
  "isPublished": true,
  "publishDate": "2025-01-15T00:00:00Z"
}
```

---

### 5. File Management (`/files`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/files/upload` | อัปโหลดไฟล์ | admin, teacher |
| DELETE | `/files/:filename` | ลบไฟล์ | admin, teacher |

**Upload File (multipart/form-data):**
- Field: `file`
- Max size: 5MB
- Allowed types: jpg, png, gif, webp, pdf, doc, docx, xls, xlsx, ppt, pptx, zip, rar, mp4, avi, mov, mp3, wav, txt, csv

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "1234567890-document.pdf",
    "originalName": "document.pdf",
    "url": "/uploads/1234567890-document.pdf",
    "size": 1024000,
    "type": "application/pdf"
  }
}
```

---

## 📝 Phase 3: Assessment

### 6. Quiz Management (`/quizzes`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/quizzes` | ดึงรายการแบบทดสอบ | admin, teacher |
| POST | `/quizzes` | สร้างแบบทดสอบ | admin, teacher |
| GET | `/quizzes/:id` | ดึงข้อมูลแบบทดสอบ | admin, teacher |
| PUT | `/quizzes/:id` | แก้ไขแบบทดสอบ | admin, teacher |
| DELETE | `/quizzes/:id` | ลบแบบทดสอบ | admin, teacher |
| GET | `/quizzes/:id/questions` | ดึงคำถาม (สำหรับทำข้อสอบ) | student |

**Request Body (POST/PUT):**
```json
{
  "title": "แบบทดสอบบทที่ 1",
  "description": "ทดสอบความเข้าใจเรื่องจำนวนเต็ม",
  "course": "64f123456789abcd12345683",
  "lesson": "64f123456789abcd12345685",
  "questions": [
    {
      "question": "1 + 1 = ?",
      "type": "multiple_choice",
      "options": ["1", "2", "3", "4"],
      "correctAnswers": ["2"],
      "points": 10,
      "order": 1
    },
    {
      "question": "จำนวนเต็มลบคืออะไร?",
      "type": "essay",
      "points": 20,
      "order": 2
    }
  ],
  "passingScore": 60,
  "duration": 30,
  "maxAttempts": 1,
  "showResultsImmediately": false,
  "availableFrom": "2025-01-15T00:00:00Z",
  "availableUntil": "2025-01-31T23:59:59Z"
}
```

**Question Types:**
- `multiple_choice` - ปรนัย (เลือกตอบ 1 ข้อ)
- `true_false` - ถูก/ผิด
- `checkboxes` - เลือกได้หลายข้อ
- `short_answer` - อัตนัย (คำตอบสั้น)
- `essay` - อัตนัย (เรียงความ)

---

### 7. Quiz Attempts (`/quiz-attempts`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/quiz-attempts` | ดึงรายการการทำข้อสอบ | admin, teacher |
| POST | `/quiz-attempts/start` | เริ่มทำข้อสอบ | student |
| POST | `/quiz-attempts/:id/submit` | ส่งคำตอบ | student |
| GET | `/quiz-attempts/:id` | ดึงข้อมูลการทำข้อสอบ | admin, teacher, student (own) |
| PUT | `/quiz-attempts/:id/grade` | ให้คะแนนแบบอัตนัย | admin, teacher |
| GET | `/quiz-attempts/my-attempts` | ดึงประวัติทำข้อสอบของตัวเอง | student |

**Start Quiz:**
```json
{
  "quizId": "64f123456789abcd12345686"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f123456789abcd12345687",
    "quiz": {...},
    "attemptNumber": 1,
    "startedAt": "2025-01-15T10:00:00Z",
    "timeLimit": 1800
  }
}
```

**Submit Quiz:**
```json
{
  "answers": [
    {
      "questionIndex": 0,
      "answer": "2"
    },
    {
      "questionIndex": 1,
      "answer": "จำนวนเต็มลบคือจำนวนที่น้อยกว่า 0"
    }
  ]
}
```

**Grade Attempt (Teacher):**
```json
{
  "answers": [
    {
      "questionIndex": 1,
      "teacherScore": 15,
      "teacherFeedback": "ตอบถูกต้อง แต่ควรอธิบายเพิ่มเติม"
    }
  ],
  "feedback": "ทำได้ดีมาก"
}
```

---

## 📊 Phase 4: Analytics

### 8. Reports (`/reports`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports/student/:studentId` | รายงานผลนักเรียน | admin, teacher |
| GET | `/reports/course/:courseId` | รายงานผลรายวิชา | admin, teacher |
| GET | `/reports/quiz/:quizId` | รายงานผลแบบทดสอบ | admin, teacher |
| GET | `/reports/class/:roomId` | รายงานผลห้องเรียน | admin, teacher |

**Student Report Response:**
```json
{
  "success": true,
  "data": {
    "student": {...},
    "courses": [
      {
        "course": {...},
        "quizzesTaken": 5,
        "averageScore": 85.5,
        "highestScore": 95,
        "lowestScore": 75
      }
    ],
    "overallAverage": 85.5
  }
}
```

**Course Report Response:**
```json
{
  "success": true,
  "data": {
    "course": {...},
    "totalStudents": 30,
    "totalQuizzes": 5,
    "students": [
      {
        "student": {...},
        "quizzesTaken": 5,
        "averageScore": 85.5
      }
    ],
    "averageScore": 82.3
  }
}
```

**Quiz Report Response:**
```json
{
  "success": true,
  "data": {
    "quiz": {...},
    "totalAttempts": 30,
    "averageScore": 75.5,
    "passRate": 86.7,
    "questionAnalysis": [
      {
        "questionIndex": 0,
        "correctRate": 90,
        "averagePoints": 9
      }
    ]
  }
}
```

---

## 🔐 Authentication Endpoints

### User/Teacher/Admin Login
**POST** `/auth/login`
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

### Student Login
**POST** `/students/auth/login`
```json
{
  "studentId": "S2568001",
  "password": "15052010"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isChangePassword": true,  // true = ต้องเปลี่ยน password ก่อนใช้งาน
    "student": {
      "id": "...",
      "studentId": "S2568001",
      "firstname": "สมชาย",
      "lastname": "ใจดี",
      "isChangePassword": true
    }
  }
}
```

### Student Change Password
**POST** `/students/auth/change-password`

**Headers:** `Authorization: Bearer <student-token>`

**Request:**
```json
{
  "currentPassword": "15052010",
  "newPassword": "myNewPassword123"
}
```

### Get Current User
**GET** `/auth/me`

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "error": true,
  "statusCode": 400,
  "statusMessage": "VALIDATION_ERROR",
  "message": "VALIDATION_ERROR",
  "data": {
    "messages": {
      "th": "ข้อมูลไม่ถูกต้อง",
      "en": "Validation error"
    },
    "details": ["field1", "field2"]
  }
}
```

---

## Testing with Swagger UI

เปิด browser: **http://localhost:3001/api/docs**

1. คลิก **Authorize** ด้านบนขวา
2. ใส่ token ที่ได้จาก login: `Bearer <your-token>`
3. ทดสอบ API ผ่าน interface

---

## ขั้นตอนการใช้งาน

### 1. สร้างข้อมูลเบื้องต้น (Admin)
1. Login admin
2. สร้างห้องเรียน (POST /rooms)
3. สร้างครู (POST /users with role=teacher)
4. สร้างนักเรียน (POST /students or POST /students/import)
5. สร้างรายวิชา (POST /courses)

### 2. สร้างเนื้อหา (Teacher)
1. Login teacher
2. สร้างบทเรียน (POST /lessons)
3. อัปโหลดไฟล์แนบ (POST /files/upload)
4. เผยแพร่บทเรียน (PUT /lessons/:id/publish)
5. สร้างแบบทดสอบ (POST /quizzes)

### 3. เรียนและทำข้อสอบ (Student)
1. Login student (POST /students/auth/login)
2. **ถ้า isChangePassword = true**: เปลี่ยน password (POST /students/auth/change-password)
3. ดูบทเรียน (GET /lessons)
4. เริ่มทำข้อสอบ (POST /quiz-attempts/start)
5. ส่งคำตอบ (POST /quiz-attempts/:id/submit)
6. ดูผลคะแนน (GET /quiz-attempts/my-attempts)

### 4. ตรวจข้อสอบและดูรายงาน (Teacher)
1. ดูการทำข้อสอบ (GET /quiz-attempts)
2. ให้คะแนนคำถามอัตนัย (PUT /quiz-attempts/:id/grade)
3. ดูรายงานผล (GET /reports/...)

---

## Summary: Total APIs

- **Phase 1 (Core):** 18 endpoints
  - Rooms: 5
  - Students: 8 (+ change password)
  - Courses: 5

- **Phase 2 (Content):** 8 endpoints
  - Lessons: 6
  - Files: 2

- **Phase 3 (Assessment):** 12 endpoints
  - Quizzes: 6
  - Quiz Attempts: 6

- **Phase 4 (Analytics):** 4 endpoints
  - Reports: 4

**Total: 42 API endpoints**

Plus existing User/Role/Permission management endpoints.
