import { pool } from "../src/config/db.config.js";

// Import tất cả createTable từ models (cập nhật path)
import { createTable as createUsersTable, createRegistrationLogsTable } from "../src/models/User.js";
import { createTable as createMajorsTable } from "../src/models/Major.js";
import { createTable as createClassesTable } from "../src/models/Class.js";
import { createTable as createStudentsTable } from "../src/models/Student.js";
import { createTable as createTeachersTable } from "../src/models/Teacher.js";
import { createTable as createSubjectsTable } from "../src/models/Subject.js";
import { createTable as createSemestersTable } from "../src/models/Semester.js";
import { createTable as createEnrollmentsTable } from "../src/models/Enrollment.js";
import { createTable as createSchedulesTable } from "../src/models/Schedule.js";
import { createTable as createGradesTable } from "../src/models/Grade.js";
import { createTable as createNotificationsTable } from "../src/models/Notification.js";

// Function kiểm tra bảng tồn tại (nhanh)
const tableExists = async (tableName) => {
  const query = `SHOW TABLES LIKE '${tableName}'`;
  const [rows] = await pool.execute(query);
  return rows.length > 0;
};

// Migrate từng bảng nếu chưa tồn tại
const migrateTable = async (tableName, createFn) => {
  if (await tableExists(tableName)) {
    console.log(`⏭️  Table ${tableName} already exists, skipped.`);
    return;
  }
  try {
    await createFn();
    console.log(`✅ Table ${tableName} created.`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error.message);
    throw error;
  }
};

// Function migrate all
export const migrateAll = async () => {
  if (process.env.MIGRATE_ON_START !== "true") {
    console.log("⏭️  Migration skipped (MIGRATE_ON_START=false).");
    return;
  }

  try {
    console.log("🔄 Starting migration...");
    await migrateTable("Users", createUsersTable);
    await migrateTable("Majors", createMajorsTable);
    await migrateTable("Classes", createClassesTable);
    await migrateTable("Students", createStudentsTable);
    await migrateTable("Teachers", createTeachersTable);
    await migrateTable("Subjects", createSubjectsTable);
    await migrateTable("Semesters", createSemestersTable);
    await migrateTable("Enrollments", createEnrollmentsTable);
    await migrateTable("Schedules", createSchedulesTable);
    await migrateTable("Grades", createGradesTable);
    await migrateTable("Notifications", createNotificationsTable);
    await migrateTable("RegistrationLogs", createRegistrationLogsTable);
    console.log("✅ Migration completed!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};
