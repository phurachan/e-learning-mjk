import mongoose from 'mongoose'
import Room from '../models/Room'
import Student from '../models/Student'
import User from '../models/User'
import Course from '../models/Course'
import Lesson from '../models/Lesson'
import Quiz from '../models/Quiz'
import QuizAttempt from '../models/QuizAttempt'

/**
 * Seed Student Portal Mock Data
 * สร้างข้อมูลตัวอย่างสำหรับทดสอบ Student Portal
 */
export async function seedStudentData() {
  try {
    console.log('🌱 Starting student data seeding...')

    // 1. สร้าง Admin User สำหรับ createdBy
    let admin = await User.findOne({ email: 'admin@moonoi.com' })
    if (!admin) {
      admin = await User.create({
        email: 'admin@moonoi.com',
        password: 'admin123', // จะถูก hash ใน model
        name: 'Admin',
        role: 'admin',
        isActive: true,
      })
      console.log('✅ Created admin user')
    }

    // 2. สร้างครูผู้สอน
    const teachers = []
    const teacherData = [
      { email: 'somchai@school.com', name: 'ครูสมชาย ใจดี' },
      { email: 'somying@school.com', name: 'ครูสมหญิง ดีงาม' },
      { email: 'john@school.com', name: 'ครูจอห์น สมิธ' },
      { email: 'somsri@school.com', name: 'ครูสมศรี รักงาม' },
    ]

    for (const data of teacherData) {
      let teacher = await User.findOne({ email: data.email })
      if (!teacher) {
        teacher = await User.create({
          email: data.email,
          password: 'teacher123',
          name: data.name,
          role: 'teacher',
          isActive: true,
        })
      }
      teachers.push(teacher)
    }
    console.log('✅ Created teachers:', teachers.length)

    // 3. สร้างห้องเรียน
    let room = await Room.findOne({ code: 'RM601' })
    if (!room) {
      room = await Room.create({
        name: 'ห้อง 6/1',
        code: 'RM601',
        grade: 6,
        section: '1',
        academicYear: '2567',
        capacity: 40,
        isActive: true,
        createdBy: admin._id,
      })
      console.log('✅ Created room:', room.name)
    }

    // 4. สร้างนักเรียนตัวอย่าง
    let student = await Student.findOne({ studentId: 'STD001' })
    if (!student) {
      student = await Student.create({
        studentId: 'STD001',
        password: 'student123', // จะถูก hash ใน model
        firstname: 'สมชาย',
        lastname: 'ใจดี',
        phone: '0812345678',
        room: room._id,
        dateOfBirth: new Date('2010-05-15'),
        parentName: 'นายสมศักดิ์ ใจดี',
        parentPhone: '0898765432',
        isActive: true,
        isChangePassword: false,
        createdBy: admin._id,
      })
      console.log('✅ Created student:', student.fullname)
    }

    // 5. สร้างวิชาเรียน
    const courses = []
    const courseData = [
      {
        name: 'คณิตศาสตร์พื้นฐาน',
        code: 'MATH101',
        description: 'เรียนรู้คณิตศาสตร์พื้นฐาน สมการ และการแก้โจทย์ปัญหา',
        teacher: teachers[0]._id,
      },
      {
        name: 'วิทยาศาสตร์ทั่วไป',
        code: 'SCI101',
        description: 'ศึกษาวิทยาศาสตร์ทั่วไป ชีววิทยา ฟิสิกส์ เคมี',
        teacher: teachers[1]._id,
      },
      {
        name: 'ภาษาอังกฤษพื้นฐาน',
        code: 'ENG101',
        description: 'พัฒนาทักษะภาษาอังกฤษ ฟัง พูด อ่าน เขียน',
        teacher: teachers[2]._id,
      },
      {
        name: 'สังคมศึกษา',
        code: 'SOC101',
        description: 'ศึกษาประวัติศาสตร์ ภูมิศาสตร์ และสังคมไทย',
        teacher: teachers[3]._id,
      },
    ]

    for (const data of courseData) {
      let course = await Course.findOne({ code: data.code })
      if (!course) {
        course = await Course.create({
          ...data,
          rooms: [room._id],
          academicYear: '2567',
          semester: 1,
          isActive: true,
          createdBy: admin._id,
        })
      }
      courses.push(course)
    }
    console.log('✅ Created courses:', courses.length)

    // 6. สร้างบทเรียน
    const lessons = []
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]
      const lessonData = [
        {
          title: `บทที่ 1: บทนำ${course.name}`,
          description: 'แนะนำเนื้อหาและวัตถุประสงค์การเรียนรู้',
          content: '<h1>บทนำ</h1><p>ยินดีต้อนรับสู่รายวิชานี้...</p>',
          order: 1,
        },
        {
          title: `บทที่ 2: หลักการพื้นฐาน`,
          description: 'เรียนรู้หลักการและทฤษฎีพื้นฐาน',
          content: '<h1>หลักการพื้นฐาน</h1><p>เนื้อหาบทที่ 2...</p>',
          order: 2,
        },
        {
          title: `บทที่ 3: การประยุกต์ใช้`,
          description: 'ฝึกปฏิบัติและประยุกต์ใช้ความรู้',
          content: '<h1>การประยุกต์ใช้</h1><p>เนื้อหาบทที่ 3...</p>',
          order: 3,
        },
      ]

      for (const data of lessonData) {
        let lesson = await Lesson.findOne({
          course: course._id,
          order: data.order,
        })
        if (!lesson) {
          lesson = await Lesson.create({
            ...data,
            course: course._id,
            publishDate: new Date(),
            isPublished: true,
            isActive: true,
            createdBy: admin._id,
          })
        }
        lessons.push(lesson)
      }
    }
    console.log('✅ Created lessons:', lessons.length)

    // 7. สร้างแบบทดสอบ
    const quizzes = []
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]
      const courseLessons = lessons.filter((l: any) => l.course.toString() === course._id.toString())

      // Quiz สำหรับบทที่ 3
      const lesson3 = courseLessons.find((l: any) => l.order === 3)

      const quizData = [
        {
          title: `แบบทดสอบบทที่ 3: ${course.name}`,
          description: 'ทดสอบความเข้าใจจากบทที่ 3',
          lesson: lesson3?._id,
          questions: [
            {
              question: 'คำถามข้อที่ 1',
              type: 'multiple_choice',
              options: ['ตัวเลือก A', 'ตัวเลือก B', 'ตัวเลือก C', 'ตัวเลือก D'],
              correctAnswers: ['ตัวเลือก A'],
              points: 10,
              order: 1,
            },
            {
              question: 'คำถามข้อที่ 2',
              type: 'true_false',
              options: ['จริง', 'เท็จ'],
              correctAnswers: ['จริง'],
              points: 10,
              order: 2,
            },
          ],
          totalPoints: 20,
          passingScore: 12,
          duration: 60,
          maxAttempts: 2,
          showResultsImmediately: true,
          availableFrom: new Date(),
          availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วันจากนี้
        },
        {
          title: `แบบทดสอบกลางภาค: ${course.name}`,
          description: 'แบบทดสอบกลางภาคเรียน',
          lesson: null,
          questions: [
            {
              question: 'คำถามข้อที่ 1',
              type: 'multiple_choice',
              options: ['ตัวเลือก A', 'ตัวเลือก B', 'ตัวเลือก C'],
              correctAnswers: ['ตัวเลือก B'],
              points: 25,
              order: 1,
            },
            {
              question: 'คำถามข้อที่ 2',
              type: 'essay',
              options: [],
              correctAnswers: [],
              points: 25,
              order: 2,
            },
          ],
          totalPoints: 50,
          passingScore: 30,
          duration: 90,
          maxAttempts: 1,
          showResultsImmediately: false,
          availableFrom: new Date(),
          availableUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 วันจากนี้
        },
      ]

      for (const data of quizData) {
        let quiz = await Quiz.findOne({
          course: course._id,
          title: data.title,
        })
        if (!quiz) {
          quiz = await Quiz.create({
            ...data,
            course: course._id,
            isActive: true,
            createdBy: admin._id,
          })
        }
        quizzes.push(quiz)
      }
    }
    console.log('✅ Created quizzes:', quizzes.length)

    // 8. สร้างผลการทำแบบทดสอบตัวอย่าง (เฉพาะบางข้อ)
    const attempts = []
    const testQuizzes = quizzes.slice(0, 3) // เอา 3 แบบทดสอบแรก

    for (let i = 0; i < testQuizzes.length; i++) {
      const quiz = testQuizzes[i]

      let attempt = await QuizAttempt.findOne({
        quiz: quiz._id,
        student: student._id,
        attemptNumber: 1,
      })

      if (!attempt) {
        const isGraded = i < 2 // 2 ข้อแรกตรวจแล้ว, ข้อที่ 3 รอตรวจ
        const maxScore = quiz.totalPoints
        const score = isGraded ? Math.min([17, 18, 0][i], maxScore) : 0 // ไม่เกิน maxScore
        const percentage = isGraded ? Math.min(Math.round((score / maxScore) * 100), 100) : 0 // ไม่เกิน 100

        attempt = await QuizAttempt.create({
          quiz: quiz._id,
          student: student._id,
          answers: quiz.questions.map((q: any, idx: number) => ({
            questionIndex: idx,
            answer: q.type === 'multiple_choice' ? q.correctAnswers[0] : 'คำตอบนักเรียน',
            isCorrect: q.type !== 'essay' ? true : undefined,
            pointsEarned: q.type !== 'essay' ? q.points : undefined,
          })),
          score,
          maxScore,
          percentage,
          isPassed: isGraded ? percentage >= 60 : undefined,
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 วันที่แล้ว
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          timeSpent: quiz.duration ? quiz.duration * 60 : 3600,
          attemptNumber: 1,
          isGraded,
          gradedBy: isGraded ? teachers[i]._id : undefined,
          gradedAt: isGraded ? new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) : undefined,
          feedback: isGraded ? ['ทำได้ดีมาก! เข้าใจเนื้อหาเป็นอย่างดี', 'ยอดเยี่ยม!', ''][i] : undefined,
        })
      }
      attempts.push(attempt)
    }
    console.log('✅ Created quiz attempts:', attempts.length)

    console.log('✅ Student data seeding completed successfully!')

    return {
      admin,
      teachers,
      room,
      student,
      courses,
      lessons,
      quizzes,
      attempts,
    }
  } catch (error) {
    console.error('❌ Error seeding student data:', error)
    throw error
  }
}
