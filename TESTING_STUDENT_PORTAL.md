# 🧪 Testing Student Portal with Real API

## การทดสอบ Student Portal กับ Database จริง

---

## 🚀 ขั้นตอนการทดสอบ

### 1. รัน Development Server
```bash
yarn dev
```

### 2. Seed Mock Data ลง Database

เปิด browser แล้วเรียก API:
```bash
POST http://localhost:3000/api/dev/seed-student-data
```

หรือใช้ curl:
```bash
curl -X POST http://localhost:3000/api/dev/seed-student-data
```

หรือใช้ Postman/Thunder Client

**ผลลัพธ์ที่ได้:**
```json
{
  "success": true,
  "message": "Student data seeded successfully",
  "data": {
    "teachers": 4,
    "courses": 4,
    "lessons": 12,
    "quizzes": 8,
    "attempts": 3,
    "student": {
      "studentId": "STD001",
      "name": "สมชาย ใจดี",
      "room": "ห้อง 6/1"
    }
  }
}
```

### 3. Login ด้วย Student Account

ไปที่: `http://localhost:3000/student/login`

**Demo Credentials:**
- รหัสนักเรียน: `STD001`
- รหัสผ่าน: `student123`

### 4. ตรวจสอบ Dashboard

หลังจาก login สำเร็จ จะ redirect ไปที่ `/student/dashboard`

**ควรเห็น:**
- ✅ Quick Actions (3 การ์ด)
- ✅ My Courses (4 วิชา)
  - คณิตศาสตร์พื้นฐาน (MATH101)
  - วิทยาศาสตร์ทั่วไป (SCI101)
  - ภาษาอังกฤษพื้นฐาน (ENG101)
  - สังคมศึกษา (SOC101)
- ✅ Upcoming Quizzes (แบบทดสอบที่ยังไม่หมดเวลา)
- ✅ Recent Results (3 รายการ)
  - 2 รายการตรวจแล้ว (มี feedback)
  - 1 รายการรอตรวจ

---

## 📊 ข้อมูลที่ถูก Seed

### Users
- **Admin:** admin@moonoi.com / admin123
- **Teachers:**
  - somchai@school.com / teacher123 (ครูสมชาย ใจดี)
  - somying@school.com / teacher123 (ครูสมหญิง ดีงาม)
  - john@school.com / teacher123 (ครูจอห์น สมิธ)
  - somsri@school.com / teacher123 (ครูสมศรี รักงาม)

### Room
- **ห้อง 6/1** (RM601) - Grade 6, Section 1, ปีการศึกษา 2567

### Student
- **สมชาย ใจดี** (STD001)
  - Password: student123
  - ห้อง: 6/1
  - เบอร์: 0812345678
  - ผู้ปกครอง: นายสมศักดิ์ ใจดี (0898765432)

### Courses (4 วิชา)
1. **คณิตศาสตร์พื้นฐาน** (MATH101) - ครูสมชาย
2. **วิทยาศาสตร์ทั่วไป** (SCI101) - ครูสมหญิง
3. **ภาษาอังกฤษพื้นฐาน** (ENG101) - ครูจอห์น
4. **สังคมศึกษา** (SOC101) - ครูสมศรี

**แต่ละวิชามี:**
- 3 บทเรียน (บทที่ 1-3)
- 2 แบบทดสอบ
  - แบบทดสอบบทที่ 3 (2 ข้อ, 20 คะแนน, ทำได้ 2 ครั้ง)
  - แบบทดสอบกลางภาค (2 ข้อ, 50 คะแนน, ทำได้ 1 ครั้ง)

### Quiz Attempts (ผลการทำแบบทดสอบ)
นักเรียน STD001 ทำแบบทดสอบไปแล้ว 3 ข้อ:
1. ✅ **แบบทดสอบ 1** - 85% (ผ่าน, ตรวจแล้ว)
   - Feedback: "ทำได้ดีมาก! เข้าใจเนื้อหาเป็นอย่างดี"
2. ✅ **แบบทดสอบ 2** - 92% (ผ่าน, ตรวจแล้ว)
   - Feedback: "ยอดเยี่ยม!"
3. ⏱ **แบบทดสอบ 3** - รอตรวจ (มีคำถาม Essay)

---

## 🔍 การตรวจสอบข้อมูลใน Database

### ใช้ MongoDB Compass หรือ mongosh

```bash
# เชื่อมต่อ
mongosh mongodb://localhost:27017/nuxt-admin

# ดูข้อมูล
db.students.find().pretty()
db.courses.find().pretty()
db.lessons.find().pretty()
db.quizzes.find().pretty()
db.quizattempts.find().pretty()
```

---

## 🧹 การลบข้อมูล Mock (Reset)

ถ้าต้องการเริ่มใหม่:

```bash
# ลบข้อมูลทั้งหมด
mongosh mongodb://localhost:27017/nuxt-admin

db.students.deleteMany({})
db.courses.deleteMany({})
db.lessons.deleteMany({})
db.quizzes.deleteMany({})
db.quizattempts.deleteMany({})
db.rooms.deleteMany({})
db.users.deleteMany({ role: { $in: ['teacher'] } })
```

จากนั้นรัน seed data ใหม่:
```bash
POST http://localhost:3000/api/dev/seed-student-data
```

---

## 📝 API Endpoints ที่ใช้

### Development APIs
```
POST /api/dev/seed-student-data    - Seed mock data
```

### Student APIs
```
GET  /api/students/dashboard?studentId=STD001  - Get dashboard data
POST /api/students/auth/login                   - Student login (TODO)
POST /api/students/auth/change-password         - Change password (TODO)
```

---

## 🐛 Troubleshooting

### 1. ไม่เห็นข้อมูลใน Dashboard
**สาเหตุ:**
- ยังไม่ได้รัน seed data
- Database connection ผิดพลาด

**แก้ไข:**
```bash
# ตรวจสอบ MongoDB
mongosh mongodb://localhost:27017/nuxt-admin

# รัน seed data ใหม่
POST http://localhost:3000/api/dev/seed-student-data
```

### 2. Login ไม่ผ่าน
**สาเหตุ:**
- ยังไม่มี Student ใน database
- Password ผิด

**แก้ไข:**
- รัน seed data ใหม่
- ใช้ credentials ที่ถูกต้อง: `STD001` / `student123`

### 3. API Error 500
**สาเหตุ:**
- MongoDB ไม่ทำงาน
- Model หรือ Schema ผิดพลาด

**แก้ไข:**
```bash
# เช็ค MongoDB
mongosh

# เช็ค console logs
yarn dev
```

### 4. Progress แสดง 0% ทุกวิชา
**ปกติ!** ตอนนี้ใช้ random progress เพราะยังไม่ได้ทำ LessonProgress tracking

**TODO:** สร้าง LessonProgress Model และคำนวณ progress จริง

---

## ✅ Checklist การทดสอบ

- [ ] รัน `yarn dev` สำเร็จ
- [ ] เรียก POST `/api/dev/seed-student-data` สำเร็จ
- [ ] Login ด้วย STD001 / student123 สำเร็จ
- [ ] Dashboard แสดงข้อมูลจาก API
- [ ] My Courses แสดง 4 วิชา
- [ ] Upcoming Quizzes แสดงแบบทดสอบที่ยังทำได้
- [ ] Recent Results แสดง 3 รายการ
- [ ] Dark Mode ทำงาน
- [ ] Responsive (ลอง resize browser)
- [ ] Hover effects ทำงาน

---

## 🎯 Next Steps

### หลังจากทดสอบเสร็จ:
1. ✅ ลบ seed data API ออกใน production
2. ✅ เพิ่ม Authentication จริง (JWT/Session)
3. ✅ สร้าง Student Auth Store (Pinia)
4. ✅ เพิ่ม Middleware ป้องกัน routes
5. ✅ สร้างหน้าอื่นๆ (Courses, Quizzes, Results)
6. ✅ เพิ่ม LessonProgress tracking
7. ✅ เพิ่ม Notification system

---

## 📚 สรุป

ตอนนี้ Student Dashboard ทำงานกับ API จริงแล้ว! 🎉

**ข้อมูลมาจาก:**
- ✅ MongoDB Database
- ✅ Nuxt Server API
- ✅ Real Data Models (Room, Student, Course, Lesson, Quiz, QuizAttempt)

**ยังเป็น Mock:**
- ⚠️ Authentication (ยังใช้ studentId ใน query string)
- ⚠️ Progress tracking (ยังใช้ random)
- ⚠️ Session management

พร้อมพัฒนาต่อได้เลยครับ! 🚀
