# 📊 E-Learning Platform - Flow Diagrams

## ภาพรวม
เอกสารนี้อธิบาย Flow การทำงานของระบบ E-Learning สำหรับนักเรียนและครู รวมถึงความสัมพันธ์ของข้อมูลในระบบ

---

## 1. ภาพรวมระบบทั้งหมด (Overall System Flow)

```mermaid
graph TB
    subgraph "👨‍🏫 Teacher/Admin CMS"
        A1[เข้าสู่ระบบ Admin/Teacher] --> A2[จัดการห้องเรียน]
        A2 --> A3[จัดการนักเรียน]
        A3 --> A4[สร้างวิชาและลงทะเบียนให้ห้องเรียน]
        A4 --> A5[สร้างบทเรียน]
        A5 --> A6[เผยแพร่บทเรียน]
        A6 --> A7[สร้างแบบทดสอบ]
        A7 --> A8[เปิดแบบทดสอบให้นักเรียนทำ]
    end

    subgraph "👨‍🎓 Student Portal"
        B1[เข้าสู่ระบบ นักเรียน] --> B2{เปลี่ยนรหัสผ่าน<br/>ครั้งแรก?}
        B2 -->|ใช่| B3[เปลี่ยนรหัสผ่าน]
        B2 -->|ไม่| B4[Dashboard นักเรียน]
        B3 --> B4

        B4 --> B5[ดูรายวิชาที่ลงทะเบียน]
        B5 --> B6[เลือกวิชา]
        B6 --> B7[ดูรายการบทเรียน]
        B7 --> B8[อ่านบทเรียน]
        B8 --> B9[บันทึกความคืบหน้า]

        B9 --> B10{มีแบบทดสอบ<br/>ของบทนี้?}
        B10 -->|ใช่| B11[ทำแบบทดสอบ]
        B10 -->|ไม่| B7

        B11 --> B12[ส่งคำตอบ]
        B12 --> B13{ประเภท<br/>คำถาม?}
        B13 -->|ตรวจอัตโนมัติ| B14[แสดงผลทันที]
        B13 -->|Essay| B15[รอครูตรวจ]
    end

    subgraph "👨‍🏫 Teacher Grading"
        C1[ครูเข้าหน้าตรวจข้อสอบ] --> C2[ดูรายการรอตรวจ]
        C2 --> C3[ให้คะแนนและ Feedback]
        C3 --> C4[บันทึกคะแนน]
    end

    subgraph "📊 Results & Reports"
        D1[นักเรียนดูคะแนน] --> D2[Dashboard แสดงผลคะแนน]
        D2 --> D3[ดูรายละเอียดแต่ละครั้ง]
        D3 --> D4[ดูเฉลยและ Feedback]
    end

    A8 -.->|เปิดให้ทำ| B10
    B15 -.->|รอตรวจ| C1
    C4 -.->|คะแนนออกแล้ว| D1
    B14 -.->|บันทึก| D1

    style A1 fill:#e3f2fd
    style B1 fill:#f3e5f5
    style C1 fill:#fff3e0
    style D1 fill:#e8f5e9
```

---

## 2. Flow นักเรียน - รายละเอียด (Student Detailed Flow)

```mermaid
flowchart TD
    Start([นักเรียนเข้าระบบ]) --> Login[Login ด้วย studentId + password]
    Login --> CheckFirstLogin{isChangePassword<br/>= true?}

    CheckFirstLogin -->|ใช่| ChangePass[หน้าเปลี่ยนรหัสผ่าน]
    ChangePass --> UpdatePass[อัพเดทรหัสผ่าน<br/>isChangePassword = false]
    UpdatePass --> Dashboard

    CheckFirstLogin -->|ไม่| Dashboard[📊 Dashboard]

    Dashboard --> ShowInfo[แสดง:<br/>• วิชาที่ลงทะเบียน<br/>• แบบทดสอบที่ต้องทำ<br/>• ความคืบหน้า<br/>• คะแนนล่าสุด]

    ShowInfo --> Menu{เลือกเมนู}

    Menu -->|วิชาของฉัน| Courses[📚 My Courses]
    Menu -->|แบบทดสอบ| Quizzes[📝 My Quizzes]
    Menu -->|ผลคะแนน| Results[📊 My Results]
    Menu -->|โปรไฟล์| Profile[👤 Profile]

    %% Courses Flow
    Courses --> CourseList[แสดงรายวิชา<br/>filter by: room ของนักเรียน<br/>และ isActive = true]
    CourseList --> SelectCourse[เลือกวิชา]
    SelectCourse --> LessonList[แสดงรายการบทเรียน<br/>isPublished = true<br/>เรียงตาม order]

    LessonList --> SelectLesson[เลือกบทเรียน]
    SelectLesson --> ViewLesson[📖 อ่านบทเรียน]
    ViewLesson --> ReadContent[แสดง:<br/>• เนื้อหา HTML<br/>• ไฟล์แนบ<br/>• วิดีโอ]

    ReadContent --> TrackProgress[บันทึก LessonProgress:<br/>• startedAt<br/>• timeSpent<br/>• isCompleted]

    TrackProgress --> CheckQuiz{มีแบบทดสอบ<br/>ของบทนี้?}
    CheckQuiz -->|ใช่| ShowQuizButton[แสดงปุ่ม<br/>'ทำแบบทดสอบ']
    CheckQuiz -->|ไม่| BackToLessonList[กลับรายการบทเรียน]

    ShowQuizButton -->|คลิก| Quizzes
    BackToLessonList --> LessonList

    %% Quizzes Flow
    Quizzes --> QuizList[แสดงรายการแบบทดสอบ<br/>filter by:<br/>• วิชาที่ลงทะเบียน<br/>• availableFrom <= now<br/>• availableUntil >= now<br/>• isActive = true]

    QuizList --> SelectQuiz[เลือกแบบทดสอบ]
    SelectQuiz --> QuizDetail[แสดงรายละเอียด:<br/>• จำนวนคำถาม<br/>• เวลาที่ใช้<br/>• ทำไปแล้วกี่ครั้ง<br/>• คะแนนที่ดีที่สุด]

    QuizDetail --> CheckAttempts{ครั้งที่ทำ <<br/>maxAttempts?}
    CheckAttempts -->|ไม่| CanTake[แสดงปุ่ม 'เริ่มทำ']
    CheckAttempts -->|ใช่| CannotTake[แสดง 'ทำครบแล้ว']

    CanTake -->|คลิก| StartQuiz[สร้าง QuizAttempt:<br/>• startedAt = now<br/>• attemptNumber++]

    StartQuiz --> TakeQuiz[📝 หน้าทำแบบทดสอบ]
    TakeQuiz --> ShowQuestions[แสดงคำถาม:<br/>• Multiple Choice<br/>• True/False<br/>• Checkboxes<br/>• Short Answer<br/>• Essay]

    ShowQuestions --> Timer{มี duration?}
    Timer -->|ใช่| ShowTimer[แสดง Timer นับถอยหลัง]
    Timer -->|ไม่| NoTimer[ไม่มี Timer]

    ShowTimer --> AnswerQ[นักเรียนตอบคำถาม]
    NoTimer --> AnswerQ

    AnswerQ --> Submit[กดส่งคำตอบ]
    Submit --> ConfirmSubmit{ยืนยันส่ง?}

    ConfirmSubmit -->|ใช่| SaveAnswers[บันทึก QuizAttempt:<br/>• answers array<br/>• submittedAt = now<br/>• timeSpent]
    ConfirmSubmit -->|ไม่| AnswerQ

    SaveAnswers --> AutoGrade[ตรวจอัตโนมัติ:<br/>Multiple Choice,<br/>True/False, Checkboxes]

    AutoGrade --> CheckEssay{มีคำถาม<br/>Essay?}
    CheckEssay -->|ใช่| WaitGrade[รอครูตรวจ<br/>isGraded = false]
    CheckEssay -->|ไม่| FullGrade[คำนวณคะแนนเต็ม<br/>isGraded = true]

    FullGrade --> CheckShowResult{showResultsImmediately<br/>= true?}
    CheckShowResult -->|ใช่| ShowResult[แสดงผลทันที]
    CheckShowResult -->|ไม่| HideResult[ซ่อนผล]

    ShowResult --> Results
    HideResult --> Dashboard
    WaitGrade --> Dashboard

    %% Results Flow
    Results --> ResultList[แสดงรายการผลคะแนน:<br/>• แยกตามวิชา<br/>• แยกตามแบบทดสอบ<br/>• ประวัติทุกครั้งที่ทำ]

    ResultList --> SelectResult[เลือกดูรายละเอียด]
    SelectResult --> ResultDetail[แสดง:<br/>• คะแนนที่ได้<br/>• เปอร์เซ็นต์<br/>• ผ่าน/ไม่ผ่าน<br/>• เฉลยคำตอบ<br/>• Feedback ครู]

    ResultDetail --> BackToDashboard[กลับ Dashboard]
    BackToDashboard --> Dashboard

    %% Profile Flow
    Profile --> ShowProfile[แสดงข้อมูล:<br/>• ชื่อ-นามสกุล<br/>• รหัสนักเรียน<br/>• ห้องเรียน<br/>• รูปโปรไฟล์]
    ShowProfile --> ProfileMenu{เลือกแก้ไข}
    ProfileMenu -->|เปลี่ยนรหัสผ่าน| ChangePassword[เปลี่ยนรหัสผ่าน]
    ProfileMenu -->|อัพโหลดรูป| UploadAvatar[อัพโหลดรูปโปรไฟล์]
    ProfileMenu -->|กลับ| Dashboard

    ChangePassword --> Dashboard
    UploadAvatar --> Dashboard
    CannotTake --> QuizList

    style Start fill:#4caf50,color:#fff
    style Dashboard fill:#2196f3,color:#fff
    style ViewLesson fill:#ff9800,color:#fff
    style TakeQuiz fill:#f44336,color:#fff
    style ShowResult fill:#9c27b0,color:#fff
```

---

## 3. Flow ครู - การตรวจข้อสอบ (Teacher Grading Flow)

```mermaid
flowchart TD
    Start([ครูเข้าระบบ]) --> TeacherDash[👨‍🏫 Teacher Dashboard]

    TeacherDash --> ShowStats[แสดง:<br/>• วิชาที่สอน<br/>• แบบทดสอบรอตรวจ<br/>• จำนวนนักเรียน<br/>• ภาพรวมคะแนน]

    ShowStats --> Menu{เลือกเมนู}

    Menu -->|จัดการเนื้อหา| CMS[CMS ที่มีอยู่แล้ว]
    Menu -->|ตรวจข้อสอบ| Grading[📝 Grading]
    Menu -->|ติดตามผล| Progress[📊 Student Progress]
    Menu -->|รายงาน| Reports[📈 Reports]

    %% CMS Flow
    CMS --> CMSMenu[จัดการห้องเรียน<br/>จัดการนักเรียน<br/>จัดการวิชา<br/>จัดการบทเรียน<br/>จัดการแบบทดสอบ]
    CMSMenu --> TeacherDash

    %% Grading Flow
    Grading --> FilterGrading[กรอง:<br/>• วิชาที่สอน<br/>• แบบทดสอบ<br/>• สถานะ: รอตรวจ/ตรวจแล้ว]

    FilterGrading --> GradingList[แสดงรายการ QuizAttempts<br/>ที่มีคำถาม Essay<br/>และ isGraded = false]

    GradingList --> SelectAttempt[เลือกนักเรียน]
    SelectAttempt --> GradingInterface[📝 หน้าให้คะแนน]

    GradingInterface --> ShowStudentAnswers[แสดง:<br/>• ข้อมูลนักเรียน<br/>• แบบทดสอบ<br/>• คำตอบทุกข้อ<br/>• คะแนนอัตโนมัติ]

    ShowStudentAnswers --> GradeEssay[ให้คะแนนคำถาม Essay:<br/>• teacherScore<br/>• teacherFeedback]

    GradeEssay --> MoreEssay{มี Essay<br/>ข้ออื่น?}
    MoreEssay -->|ใช่| GradeEssay
    MoreEssay -->|ไม่| CalcTotal[คำนวณคะแนนรวม]

    CalcTotal --> AddFeedback[เพิ่ม Feedback ทั่วไป]
    AddFeedback --> SaveGrade[บันทึก:<br/>• อัพเดท QuizAttempt<br/>• isGraded = true<br/>• gradedBy = teacher<br/>• gradedAt = now]

    SaveGrade --> NotifyStudent[ส่งการแจ้งเตือน<br/>ให้นักเรียน]
    NotifyStudent --> NextAttempt{ตรวจคนต่อไป?}

    NextAttempt -->|ใช่| GradingList
    NextAttempt -->|ไม่| TeacherDash

    %% Progress Flow
    Progress --> SelectCourse[เลือกวิชา]
    SelectCourse --> ProgressTable[แสดงตาราง:<br/>• นักเรียน<br/>• บทเรียนที่อ่าน<br/>• แบบทดสอบที่ทำ<br/>• คะแนนเฉลี่ย]

    ProgressTable --> FilterProgress[กรอง/เรียง:<br/>• ห้องเรียน<br/>• ช่วงคะแนน<br/>• สถานะการทำ]

    FilterProgress --> SelectStudent[คลิกดูนักเรียน]
    SelectStudent --> StudentDetail[📊 รายละเอียดนักเรียน]

    StudentDetail --> ShowStudentProgress[แสดง:<br/>• บทเรียนที่อ่านแล้ว<br/>• เวลาที่ใช้<br/>• แบบทดสอบที่ทำ<br/>• คะแนนแต่ละครั้ง<br/>• กราฟความคืบหน้า]

    ShowStudentProgress --> BackToProgress[กลับตาราง]
    BackToProgress --> ProgressTable

    %% Reports Flow
    Reports --> ReportMenu{เลือกประเภท}

    ReportMenu -->|รายงานห้องเรียน| ClassReport[📊 Classroom Report]
    ReportMenu -->|รายงานวิชา| CourseReport[📊 Course Report]
    ReportMenu -->|รายงานแบบทดสอบ| QuizReport[📊 Quiz Report]

    ClassReport --> ShowClassStats[แสดง:<br/>• จำนวนนักเรียน<br/>• คะแนนเฉลี่ยแต่ละวิชา<br/>• % ผ่าน/ไม่ผ่าน<br/>• กราฟการกระจายคะแนน]
    ShowClassStats --> ExportClass[Export PDF/Excel]
    ExportClass --> TeacherDash

    CourseReport --> ShowCourseStats[แสดง:<br/>• คะแนนเฉลี่ยแต่ละบทเรียน<br/>• % การทำแบบทดสอบ<br/>• บทที่ยาก/ง่ายที่สุด<br/>• เวลาเฉลี่ยต่อบท]
    ShowCourseStats --> ExportCourse[Export PDF/Excel]
    ExportCourse --> TeacherDash

    QuizReport --> ShowQuizStats[แสดง:<br/>• จำนวนคนทำ<br/>• คะแนนเฉลี่ย<br/>• คะแนนสูง/ต่ำสุด<br/>• คำถามที่ตอบผิดมากที่สุด<br/>• % ผ่าน]
    ShowQuizStats --> ExportQuiz[Export PDF/Excel]
    ExportQuiz --> TeacherDash

    style Start fill:#4caf50,color:#fff
    style TeacherDash fill:#2196f3,color:#fff
    style GradingInterface fill:#f44336,color:#fff
    style StudentDetail fill:#ff9800,color:#fff
    style ShowClassStats fill:#9c27b0,color:#fff
```

---

## 4. ความสัมพันธ์ข้อมูล (Data Relationship)

```mermaid
erDiagram
    ROOM ||--o{ STUDENT : "มี"
    ROOM ||--o{ COURSE : "เรียน"
    USER ||--o{ COURSE : "สอน"
    COURSE ||--o{ LESSON : "ประกอบด้วย"
    COURSE ||--o{ QUIZ : "มี"
    LESSON ||--o| QUIZ : "มี (optional)"

    STUDENT ||--o{ LESSON_PROGRESS : "อ่าน"
    LESSON ||--o{ LESSON_PROGRESS : "ถูกอ่านโดย"

    STUDENT ||--o{ QUIZ_ATTEMPT : "ทำ"
    QUIZ ||--o{ QUIZ_ATTEMPT : "ถูกทำโดย"

    USER ||--o{ QUIZ_ATTEMPT : "ตรวจ"

    STUDENT ||--o{ NOTIFICATION : "ได้รับ"
    USER ||--o{ NOTIFICATION : "ส่ง"

    ROOM {
        string name
        string code
        int grade
        string section
        string academicYear
        int capacity
        bool isActive
    }

    STUDENT {
        string studentId
        string password
        string firstname
        string lastname
        string phone
        string avatar
        objectId room
        date dateOfBirth
        string address
        string parentName
        string parentPhone
        bool isActive
        bool isChangePassword
    }

    USER {
        string email
        string password
        string name
        string role
        bool isActive
    }

    COURSE {
        string name
        string code
        string description
        objectId teacher
        array rooms
        string academicYear
        int semester
        bool isActive
    }

    LESSON {
        string title
        string description
        string content
        objectId course
        int order
        array attachments
        date publishDate
        bool isPublished
        bool isActive
    }

    QUIZ {
        string title
        string description
        objectId course
        objectId lesson
        array questions
        int totalPoints
        int passingScore
        int duration
        int maxAttempts
        bool showResultsImmediately
        date availableFrom
        date availableUntil
        bool isActive
    }

    LESSON_PROGRESS {
        objectId student
        objectId lesson
        objectId course
        bool isCompleted
        date startedAt
        date completedAt
        int timeSpent
    }

    QUIZ_ATTEMPT {
        objectId quiz
        objectId student
        array answers
        float score
        float maxScore
        float percentage
        bool isPassed
        date startedAt
        date submittedAt
        int timeSpent
        int attemptNumber
        bool isGraded
        objectId gradedBy
        date gradedAt
        string feedback
    }

    NOTIFICATION {
        string type
        string title
        string message
        array recipients
        objectId course
        objectId lesson
        objectId quiz
        bool isRead
        objectId createdBy
    }
```

---

## 5. สรุป Use Cases

### 👨‍🎓 Use Cases สำหรับนักเรียน (Student Portal)

1. **Login & Authentication**
   - ล็อกอินด้วย `studentId` + `password`
   - เปลี่ยนรหัสผ่านครั้งแรก (ถ้า `isChangePassword = true`)
   - ดูโปรไฟล์ส่วนตัว

2. **Dashboard หลัก**
   - เห็นภาพรวมวิชาที่กำลังเรียน
   - เห็นแบบทดสอบที่กำลังเปิดให้ทำ/ยังไม่ได้ทำ
   - เห็นความคืบหน้าการเรียน (Progress)
   - การแจ้งเตือน (บทเรียนใหม่, แบบทดสอบใหม่, ผลคะแนนออกแล้ว)

3. **เรียกดูวิชา (My Courses)**
   - เห็นรายการวิชาที่ห้องตนลงเรียน
   - กรองตามภาคเรียน/ปีการศึกษา
   - เห็นครูผู้สอน, รายละเอียดวิชา

4. **เรียกดูบทเรียน (Lessons)**
   - คลิกเข้าวิชา → เห็นรายการบทเรียนที่เผยแพร่แล้ว
   - เรียงลำดับตาม `order`
   - อ่านเนื้อหา (HTML rich text)
   - ดาวน์โหลดไฟล์แนบ (attachments)
   - บันทึกความคืบหน้าการอ่าน (Mark as completed)

5. **ทำแบบทดสอบ (Quizzes)**
   - เห็นแบบทดสอบที่เปิดให้ทำ
   - ดูจำนวนครั้งที่ทำแล้ว vs maxAttempts
   - เริ่มทำแบบทดสอบ (Start Quiz)
   - ตอบคำถามหลายรูปแบบ
   - นับเวลาถอยหลัง (ถ้ามี duration)
   - ส่งแบบทดสอบ (Submit)
   - ดูผลคะแนน (ถ้า showResultsImmediately = true)

6. **ดูผลการเรียน (My Results)**
   - เห็นผลคะแนนทุกแบบทดสอบที่ทำ
   - เห็นคะแนนแต่ละครั้ง (Attempt History)
   - เห็นเฉลยคำตอบ
   - ดูความคิดเห็นจากครู (feedback)

---

### 👨‍🏫 Use Cases สำหรับครู (Teacher Portal)

1. **Login & Dashboard**
   - ล็อกอินด้วย User (ครู)
   - เห็น Dashboard วิชาที่สอน

2. **จัดการเนื้อหา (CMS - ที่มีอยู่แล้ว)**
   - จัดการห้องเรียน (Rooms)
   - จัดการนักเรียน (Students)
   - จัดการวิชา (Courses)
   - จัดการบทเรียน (Lessons) - สร้าง, แก้ไข, เผยแพร่
   - จัดการแบบทดสอบ (Quizzes)

3. **ติดตามและประเมินผล (NEW)**
   - ดูความคืบหน้าการเรียนของนักเรียน
   - ตรวจแบบทดสอบ (Essay questions)
   - ให้ feedback แต่ละข้อ
   - ดูรายงานผล (ห้องเรียน, วิชา, นักเรียน)
   - ส่งการแจ้งเตือน

---

## 6. หน้าจอที่ต้องพัฒนา

### สำหรับนักเรียน (Student Portal)

```
1. /student/login                    - หน้า Login สำหรับนักเรียน
2. /student/change-password          - เปลี่ยนรหัสผ่านครั้งแรก
3. /student/dashboard                - Dashboard หลัก
4. /student/courses                  - รายการวิชาที่เรียน
5. /student/courses/[courseId]       - รายละเอียดวิชา + บทเรียนทั้งหมด
6. /student/lessons/[lessonId]       - อ่านบทเรียน + ไฟล์แนบ
7. /student/quizzes                  - รายการแบบทดสอบทั้งหมด
8. /student/quizzes/[quizId]         - รายละเอียดแบบทดสอบ + เริ่มทำ
9. /student/quizzes/[quizId]/take    - หน้าทำแบบทดสอบ
10. /student/results                  - ผลการเรียนของตนเอง
11. /student/results/[attemptId]      - ดูผลแบบทดสอบแต่ละครั้ง
12. /student/profile                  - โปรไฟล์ส่วนตัว
```

### สำหรับครู (Teacher Portal)

```
ใช้ CMS ที่มีอยู่ + เพิ่มหน้าใหม่:

1. /admin/teacher/dashboard          - Dashboard สำหรับครู
2. /admin/teacher/courses            - วิชาที่สอน
3. /admin/teacher/progress/[courseId] - ติดตามความคืบหน้านักเรียน
4. /admin/teacher/grading            - รายการแบบทดสอบรอตรวจ
5. /admin/teacher/grading/[attemptId] - ให้คะแนนและ feedback
6. /admin/teacher/reports/classroom   - รายงานผลห้องเรียน
7. /admin/teacher/reports/course      - รายงานผลวิชา
8. /admin/teacher/reports/student/[studentId] - รายงานผลนักเรียน
9. /admin/teacher/notifications       - ส่งการแจ้งเตือน
```

---

## 7. Data Models ใหม่ที่ต้องเพิ่ม

### LessonProgress (ติดตามความคืบหน้าการอ่านบทเรียน)
```typescript
{
  _id: ObjectId
  student: ref -> Student
  lesson: ref -> Lesson
  course: ref -> Course
  isCompleted: boolean
  startedAt: Date
  completedAt?: Date
  timeSpent: number              // วินาที
  createdAt: Date
  updatedAt: Date
}
```

### Notification (การแจ้งเตือน)
```typescript
{
  _id: ObjectId
  type: 'NEW_LESSON' | 'NEW_QUIZ' | 'QUIZ_RESULT' | 'ANNOUNCEMENT'
  title: string
  message: string
  recipients: [ref -> Student]
  course?: ref -> Course
  lesson?: ref -> Lesson
  quiz?: ref -> Quiz
  isRead: boolean
  createdBy: ref -> User
  createdAt: Date
}
```
