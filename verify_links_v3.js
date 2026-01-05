
const BASE_URL = 'http://localhost:4000/api';

async function test() {
  console.log('--- Testing System Links ---');
  const timestamp = Date.now();

  // 1. Login as Admin
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@qnu.edu.vn', password: '123456' })
  });
  const adminData = await adminRes.json();
  const adminToken = adminData.data?.token;
  console.log('Admin login:', adminData.success ? 'Success' : 'Failed');

  if (!adminToken) {
    console.error('Admin login failed, stopping.');
    return;
  }

  // 2. Create Subject
  const subjectCode = `SUB${timestamp}`;
  const subjectName = `Test Subject ${timestamp}`;
  const subRes = await fetch(`${BASE_URL}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ subject_code: subjectCode, subject_name: subjectName, credits: 3 })
  });
  const subData = await subRes.json();
  const subjectId = subData.data?.id;
  console.log('Create Subject:', subData.success ? 'Success' : subData.message);

  // 3. Create Teacher
  const teacherUser = `teacher${timestamp}`;
  const teacherRes = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ username: teacherUser, email: `${teacherUser}@test.com`, password: '123456', role: 'teacher', full_name: 'Test Teacher' })
  });
  const teacherData = await teacherRes.json();
  console.log('Create Teacher:', teacherData.success ? 'Success' : teacherData.message);

  // 4. Create Student
  const studentUser = `student${timestamp}`;
  const studentRes = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ username: studentUser, email: `${studentUser}@test.com`, password: '123456', role: 'student', full_name: 'Test Student' })
  });
  const studentData = await studentRes.json();
  console.log('Create Student:', studentData.success ? 'Success' : studentData.message);

  // 5. Login Teacher
  const tLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${teacherUser}@test.com`, password: '123456' })
  });
  const tLoginData = await tLoginRes.json();
  const teacherToken = tLoginData.data?.token;
  console.log('Teacher Login:', tLoginData.success ? 'Success' : tLoginData.message);

  // 6. Teacher Creates Class
  const classCode = `CL_${timestamp}`; // Shortened
  const classRes = await fetch(`${BASE_URL}/teacher/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` },
    body: JSON.stringify({ class_code: classCode, class_name: `Test Class ${timestamp}`, course: 'K1' })
  });
  const classData = await classRes.json();
  const classId = classData.data?.id;
  console.log('Teacher Create Class:', classData.success ? 'Success' : classData.message);

  // 7. Teacher Register Schedule (Link Class-Subject-Teacher)
  const semRes = await fetch(`${BASE_URL}/semesters`);
  const semData = await semRes.json();
  const semesterId = semData.data[0]?.id || 1;

  let scheduleId;
  if (classId && subjectId && teacherToken) {
    const schedRes = await fetch(`${BASE_URL}/teacher/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` },
      body: JSON.stringify({
        class_id: classId,
        subject_id: subjectId,
        semester_id: semesterId,
        day_of_week: 'Monday',
        period: '1-3',
        room: 'Online'
      })
    });
    const schedData = await schedRes.json();
    scheduleId = schedData.data?.id;
    console.log('Teacher Register Schedule:', schedData.success ? 'Success' : schedData.message);
  }

  // 8. Login Student
  const sLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${studentUser}@test.com`, password: '123456' })
  });
  const sLoginData = await sLoginRes.json();
  const studentToken = sLoginData.data?.token;
  const studentId = sLoginData.data?.user?.additionalInfo?.id;
  console.log('Student Login:', sLoginData.success ? 'Success' : sLoginData.message);

  // 9. Student Enrolls in Class
  if (studentToken && classId && subjectId) {
    const enrollRes = await fetch(`${BASE_URL}/student/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
      body: JSON.stringify({
        class_id: classId,
        subject_id: subjectId,
        semester_id: semesterId
      })
    });
    const enrollData = await enrollRes.json();
    console.log('Student Enroll:', enrollData.success ? 'Success' : enrollData.message);
  }

  // 10. Teacher Enters Grades
  if (teacherToken && studentId && subjectId) {
    const gradeRes = await fetch(`${BASE_URL}/teacher/grades/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` },
      body: JSON.stringify({
        records: [{
          student_id: studentId,
          subject_id: subjectId,
          semester_id: semesterId,
          process_score: 8.5,
          midterm_score: 9.0,
          final_score: 9.5,
          is_finalized: true
        }]
      })
    });
    const gradeData = await gradeRes.json();
    console.log('Teacher Enter Grades:', gradeData.success ? 'Success' : gradeData.message);
  }

  // 11. Student Views Grades
  if (studentToken) {
    const viewGradeRes = await fetch(`${BASE_URL}/student/grades`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const viewGradeData = await viewGradeRes.json();
    const myGrade = viewGradeData.data?.grades?.find(g => g.subject_id === subjectId);
    console.log('Student View Grades:', myGrade ? `Success (Final: ${myGrade.final_score})` : 'Failed to find grade');
  }
}

test();
