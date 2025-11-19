// prisma/seed.js
import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcrypt";
import { generateUUID } from "../src/utils/uuid.js";

async function main() {
  console.log("Bắt đầu seeding dữ liệu mẫu ĐẦY ĐỦ cho SIMS 2025...");

  const hash = (pass) => bcrypt.hash(pass, 10);

  // =================================================================
  // 1. ADMIN
  // =================================================================
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: generateUUID(),
      username: "admin",
      email: "admin@qnu.edu.vn",
      password: await hash("admin123"),
      fullName: "Quản trị viên Hệ thống",
      role: "admin",
    },
  });

  // =================================================================
  // 2. NGÀNH HỌC (Major)
  // =================================================================
  await prisma.major.createMany({
    data: [
      {
        id: generateUUID(),
        majorCode: "CNTT",
        majorName: "Công nghệ Thông tin",
      },
      { id: generateUUID(), majorCode: "KTPM", majorName: "Kỹ thuật Phần mềm" },
      {
        id: generateUUID(),
        majorCode: "HTTT",
        majorName: "Hệ thống Thông tin",
      },
      { id: generateUUID(), majorCode: "ATTT", majorName: "An toàn Thông tin" },
      {
        id: generateUUID(),
        majorCode: "QTKD",
        majorName: "Quản trị Kinh doanh",
      },
      { id: generateUUID(), majorCode: "KETOAN", majorName: "Kế toán" },
      { id: generateUUID(), majorCode: "NN", majorName: "Ngôn ngữ Anh" },
    ],
    skipDuplicates: true,
  });

  const majors = await prisma.major.findMany();

  // =================================================================
  // 3. LỚP HỌC (Class)
  // =================================================================
  const classData = [
    {
      id: generateUUID(),
      classCode: "D21CQCN01-N",
      className: "CNTT 21.1",
      course: "21",
    },
    {
      id: generateUUID(),
      classCode: "D21CQCN02-N",
      className: "CNTT 21.2",
      course: "21",
    },
    {
      id: generateUUID(),
      classCode: "D21CQKT01-N",
      className: "Kinh tế 21.1",
      course: "21",
    },
    {
      id: generateUUID(),
      classCode: "D21CQKT02-N",
      className: "Kinh tế 21.2",
      course: "21",
    },
  ];

  // Loop create để tránh bug findMany sau createMany
  for (const cls of classData) {
    const existing = await prisma.class.findFirst({
      where: { classCode: cls.classCode },
    });
    if (!existing) {
      await prisma.class.create({ data: cls });
    }
  }

  const classes = await prisma.class.findMany();
  console.log("Classes loaded:", classes.length); // Debug: Nên = 4
  if (classes.length < 3) {
    throw new Error("Classes not loaded properly!");
  }

  // =================================================================
  // 4. GIẢNG VIÊN (User + Teacher)
  // =================================================================
  const teacherData = [
    {
      username: "gv001",
      email: "nguyenvana@qnu.edu.vn",
      fullName: "TS. Nguyễn Văn An",
      teacherCode: "GV001",
      majorId: majors[0].id,
    },
    {
      username: "gv002",
      email: "tranb@qnu.edu.vn",
      fullName: "ThS. Trần Thị Bình",
      teacherCode: "GV002",
      majorId: majors[1].id,
    },
    {
      username: "gv003",
      email: "phamdat@qnu.edu.vn",
      fullName: "TS. Phạm Văn Đạt",
      teacherCode: "GV003",
      majorId: majors[0].id,
    },
    {
      username: "gv004",
      email: "levanc@qnu.edu.vn",
      fullName: "TS. Lê Văn Cường",
      teacherCode: "GV004",
      majorId: majors[2].id,
    },
    {
      username: "gv005",
      email: "hoangthuy@qnu.edu.vn",
      fullName: "ThS. Hoàng Thị Thủy",
      teacherCode: "GV005",
      majorId: majors[4].id,
    },
  ];

  const allTeachers = [];
  for (const t of teacherData) {
    const user = await prisma.user.upsert({
      where: { username: t.username },
      update: {},
      create: {
        id: generateUUID(),
        username: t.username,
        email: t.email,
        password: await hash("123456"),
        fullName: t.fullName,
        role: "teacher",
      },
    });

    const teacher = await prisma.teacher.upsert({
      where: { teacherCode: t.teacherCode },
      update: {},
      create: {
        id: generateUUID(),
        userId: user.id,
        teacherCode: t.teacherCode,
        majorId: t.majorId,
      },
    });
    allTeachers.push(teacher); // Push Teacher object, not User
  }

  // =================================================================
  // 5. MÔN HỌC (Subject)
  // =================================================================
  const subjectData = [
    {
      id: generateUUID(),
      subjectCode: "INT3306",
      subjectName: "Lập trình Web",
      credits: 3,
      teacherId: allTeachers[0].id, // Now Teacher.id
    },
    {
      id: generateUUID(),
      subjectCode: "INT3307",
      subjectName: "Cơ sở dữ liệu",
      credits: 4,
      teacherId: allTeachers[1].id,
    },
    {
      id: generateUUID(),
      subjectCode: "INT3401",
      subjectName: "Mạng máy tính",
      credits: 3,
      teacherId: allTeachers[2].id,
    },
    {
      id: generateUUID(),
      subjectCode: "INT3204",
      subjectName: "Lập trình Java",
      credits: 4,
      teacherId: allTeachers[0].id,
    },
    {
      id: generateUUID(),
      subjectCode: "ECO1101",
      subjectName: "Kinh tế vi mô",
      credits: 3,
      teacherId: allTeachers[4].id,
    },
  ];

  // Loop create để tránh bug
  for (const sub of subjectData) {
    const existing = await prisma.subject.findFirst({
      where: { subjectCode: sub.subjectCode },
    });
    if (!existing) {
      await prisma.subject.create({ data: sub });
    }
  }

  const subjects = await prisma.subject.findMany();
  console.log("Subjects loaded:", subjects.length); // Debug: Nên = 5
  if (subjects.length < 5) {
    throw new Error("Subjects not loaded properly!");
  }

  // =================================================================
  // 6. HỌC KỲ (Semester)
  // =================================================================
  const semesterData = [
    {
      id: generateUUID(),
      semesterName: "HK1 2024-2025",
      year: 2024,
      startDate: new Date("2024-09-02"),
      endDate: new Date("2025-01-20"),
      isActive: false, // Quá hạn
    },
    {
      id: generateUUID(),
      semesterName: "HK2 2024-2025",
      year: 2025,
      startDate: new Date("2025-02-10"),
      endDate: new Date("2025-06-30"),
      isActive: false, // Quá hạn
    },
    {
      id: generateUUID(),
      semesterName: "HK1 2025-2026", // Kỳ hiện tại (11/2025)
      year: 2025,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-01-15"),
      isActive: true, // Active
    },
  ];

  // Loop create (DB sạch, tránh upsert validation vì semesterName không unique)
  for (const sem of semesterData) {
    const existing = await prisma.semester.findFirst({
      where: { semesterName: sem.semesterName },
    });
    if (!existing) {
      await prisma.semester.create({ data: sem });
    }
  }

  // Workaround bug findFirst boolean: Dùng findMany + lấy đầu tiên
  const activeSemesters = await prisma.semester.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  let currentSemester = activeSemesters[0];

  if (!currentSemester) {
    // Fallback tạo active nếu bug vẫn hit
    console.log("No active semester, creating fallback...");
    currentSemester = await prisma.semester.create({
      data: {
        id: generateUUID(),
        semesterName: `HK1 ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        year: new Date().getFullYear(),
        startDate: new Date(`${new Date().getFullYear()}-09-01`),
        endDate: new Date(`${new Date().getFullYear() + 1}-01-15`),
        isActive: true,
      },
    });
  }

  console.log("Using active semester:", currentSemester.semesterName);

  // =================================================================
  // 7. SINH VIÊN (User + Student)
  // =================================================================
  const studentList = [
    {
      username: "sv25001",
      email: "nguyenvanx@qnu.edu.vn",
      fullName: "Nguyễn Văn X",
      studentCode: "21133051",
      classId: classes[0].id,
    },
    {
      username: "sv25002",
      email: "tranthingoc@qnu.edu.vn",
      fullName: "Trần Thị Ngọc",
      studentCode: "21133052",
      classId: classes[0].id,
    },
    {
      username: "sv25003",
      email: "levana@qnu.edu.vn",
      fullName: "Lê Văn Anh",
      studentCode: "21133053",
      classId: classes[0].id,
    },
    {
      username: "sv25004",
      email: "phamthuy@qnu.edu.vn",
      fullName: "Phạm Thị Thùy",
      studentCode: "21133054",
      classId: classes[1].id,
    },
    {
      username: "sv25005",
      email: "hoangminh@qnu.edu.vn",
      fullName: "Hoàng Minh Quân",
      studentCode: "21133055",
      classId: classes[1].id,
    },
    {
      username: "sv25006",
      email: "dangthilan@qnu.edu.vn",
      fullName: "Đặng Thị Lan",
      studentCode: "21133056",
      classId: classes[2].id,
    },
    {
      username: "sv25007",
      email: "buiquanghuy@qnu.edu.vn",
      fullName: "Bùi Quang Huy",
      studentCode: "21133057",
      classId: classes[2].id,
    },
  ];

  for (const s of studentList) {
    const user = await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        id: generateUUID(),
        username: s.username,
        email: s.email,
        password: await hash("123456"),
        fullName: s.fullName,
        role: "student",
      },
    });

    await prisma.student.upsert({
      where: { studentCode: s.studentCode },
      update: {},
      create: {
        id: generateUUID(),
        userId: user.id,
        studentCode: s.studentCode,
        classId: s.classId,
      },
    });
  }

  // =================================================================
  // 8. THỜI KHÓA BIỂU (Schedule)
  // =================================================================
  console.log(
    "Schedule data prep - Classes:",
    classes.length,
    "Subjects:",
    subjects.length,
    "Teachers:",
    allTeachers.length,
    "Semester:",
    currentSemester.id ? "OK" : "MISSING"
  ); // Debug

  await prisma.schedule.createMany({
    data: [
      {
        id: generateUUID(),
        classId: classes[0].id,
        subjectId: subjects[0].id,
        teacherId: allTeachers[0].id,
        semesterId: currentSemester.id,
        dayOfWeek: "Monday",
        period: "1-3",
        room: "A101",
      },
      {
        id: generateUUID(),
        classId: classes[0].id,
        subjectId: subjects[1].id,
        teacherId: allTeachers[1].id,
        semesterId: currentSemester.id,
        dayOfWeek: "Tuesday",
        period: "4-6",
        room: "B205",
      },
      {
        id: generateUUID(),
        classId: classes[0].id,
        subjectId: subjects[2].id,
        teacherId: allTeachers[2].id,
        semesterId: currentSemester.id,
        dayOfWeek: "Wednesday",
        period: "1-4",
        room: "LAB01",
      },
      {
        id: generateUUID(),
        classId: classes[1].id,
        subjectId: subjects[0].id,
        teacherId: allTeachers[0].id,
        semesterId: currentSemester.id,
        dayOfWeek: "Thursday",
        period: "7-9",
        room: "A102",
      },
      {
        id: generateUUID(),
        classId: classes[2].id,
        subjectId: subjects[4].id,
        teacherId: allTeachers[4].id,
        semesterId: currentSemester.id,
        dayOfWeek: "Monday",
        period: "7-9",
        room: "C301",
      },
    ],
    skipDuplicates: true,
  });

  console.log("SEED HOÀN TẤT 100% – ĐẦY ĐỦ NHƯ BAN ĐẦU!");
  console.log("Đăng nhập thử:");
  console.log("   Admin      → admin     / admin123");
  console.log("   GV         → gv001     / 123456");
  console.log("   Sinh viên  5 người đầu → sv25001 → sv25005 / 123456");
  console.log("   Tổng cộng: 1 admin + 5 GV + 7 SV + lớp + môn + TKB + học kỳ");
}

main()
  .catch((e) => {
    console.error("Seeding thất bại:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
