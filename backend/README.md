# 🏫 SIMS - Student Information Management System

A Node.js API server for managing student, teacher, and admin data.

---

## 📁 Project Structure
```
SIMS\backend\
├── src/                             # Code chính (MVC hybrid)
│   ├── config/                      # Cấu hình toàn cục
│   │   ├── database.js              # Prisma client setup
│   │   └── jwt.js                   # JWT config (secret, expiresIn)
│   ├── middlewares/                 # Middlewares chung
│   │   ├── auth.js                  # Token verify (protectRoute)
│   │   └── requestLogger.js         # Log requests (duration, status)
│   ├── controllers/                 # Controllers nhóm theo feature
│   │   └── auth/                    # Auth feature
│   │       └── authController.js    # Login/register handlers
│   ├── routers/                     # Routers nhóm theo feature
│   │   ├── auth.js                  # POST /login, /register
│   │   └── index.js                 # Mount /auth
│   ├── models/                      # Models chung (DB queries)
│   │   ├── userModel.js             # User CRUD (findByUsernameOrEmail, createUser)
│   │   ├── studentModel.js          # Student getAll/findByCode/create
│   │   ├── teacherModel.js          # Teacher getAll/findByUserId/create
│   │   ├── subjectModel.js          # Subject getAll/create/update
│   │   ├── semesterModel.js         # Semester getAll/setActive
│   │   ├── classModel.js            # Class getAll/create
│   │   ├── majorModel.js            # Major getAll/create/delete
│   │   ├── gradeModel.js            # Grade getByStudent/save/finalize
│   │   ├── enrollmentModel.js       # Enrollment getByStudent/enroll/drop
│   │   ├── scheduleModel.js         # Schedule getBySemester/getByTeacher
│   │   └── index.js                 # Export all models
│   ├── utils/                       # Utils chung (helpers)
│   │   ├── validators/              # Validation schemas (placeholder)
│   │   │   └── authValidator.js     # Manual validate login/register
│   │   ├── logger.js                # Custom chalk logger (info/warn/error)
│   │   ├── response.js              # Standardized res.json (success/badRequest)
│   │   ├── hash.js                  # Bcrypt hash/compare
│   │   ├── uuid.js                  # UUID v7 generate
│   │   └── jwtUtils.js              # generateAccessToken/verifyAccessToken
│   └── services/                    # Services nhóm theo feature
│       └── auth/                    # Auth feature
│           ├── authService.js       # Login logic (compare pass, tokens)
│           └── registerService.js   # Register logic (duplicate check, nested create)
├── prisma/                          # DB-specific
│   ├── schema.prisma                # Schema models/enums
│   └── seed.js                      # Seed data mẫu
├── app.js                           # Entry point (setup Express, mount /api)
├── .env                             # Environment vars (JWT_SECRET, DATABASE_URL)
├── package.json                     # Dependencies (express, prisma, bcrypt, etc.)
└── README.md                        # Docs dự án (tùy chọn)
```
---

## 🛠️ Installation & Running

### 1. Install dependencies
```bash
npm install
npm install cors helmet
npm install --save-dev nodemon
npm install joi
```

### 2. Run server
```bash
npm run dev
```

---
