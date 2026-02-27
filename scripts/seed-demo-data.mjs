/**
 * Seed demo data: 2 teachers, 1 class, 5 students, subjects, grades, result sheets
 * Run with: bun run scripts/seed-demo-data.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vitvykboryrudxofgyso.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4APVFTv93BW5S-zhwr-Ssw_0zup-7mq';
const ADMIN_EMAIL = 'admin@quiverfullschool.ng';
const ADMIN_PASSWORD = 'Admin123!';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TERM = 'First Term';
const ACADEMIC_YEAR = '2025/2026';
const TEACHER_PASSWORD = 'Teacher123!';
const STUDENT_PASSWORD = 'Student123!';

// ── Helpers ──────────────────────────────────────────────────────────────────
function log(msg) { console.log(`  ✓ ${msg}`); }
function err(msg) { console.error(`  ✗ ${msg}`); }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function createUser(email, firstName, lastName) {
  const { data: userId, error } = await supabase.rpc('admin_create_user', {
    user_email: email,
    user_password: email.startsWith('teacher') ? TEACHER_PASSWORD : STUDENT_PASSWORD,
    user_first_name: firstName,
    user_last_name: lastName,
  });
  if (error) throw new Error(`admin_create_user(${email}): ${error.message}`);
  return userId;
}

// ── Step 1: Sign in as admin ──────────────────────────────────────────────────
console.log('\n🔑 Signing in as admin...');
const { error: signInErr } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
if (signInErr) { err(signInErr.message); process.exit(1); }
log('Signed in as admin');

// ── Step 2: Create teachers ───────────────────────────────────────────────────
console.log('\n👩‍🏫 Creating teachers...');

const teachers = [
  { email: 'teacher.adaeze@quiverfullschool.ng', firstName: 'Adaeze', lastName: 'Okonkwo', phone: '08031234567', qualification: 'B.Ed Mathematics', specialization: 'Mathematics & Basic Science' },
  { email: 'teacher.emeka@quiverfullschool.ng',  firstName: 'Emeka',  lastName: 'Eze',     phone: '08057654321', qualification: 'B.Ed English',      specialization: 'English Language & Social Studies' },
];

const createdTeachers = [];
for (const t of teachers) {
  try {
    const userId = await createUser(t.email, t.firstName, t.lastName);

    // Insert profile with role=teacher
    const { data: prof, error: pErr } = await supabase.from('profiles').insert({
      user_id: userId, email: t.email,
      first_name: t.firstName, last_name: t.lastName,
      phone: t.phone, role: 'teacher',
    }).select().single();
    if (pErr) throw pErr;

    // Insert teacher record
    const empId = `TCH-${new Date().getFullYear()}-${randInt(100, 999)}`;
    const { data: tRow, error: tErr } = await supabase.from('teachers').insert({
      profile_id: prof.id,
      employee_id: empId,
      qualification: t.qualification,
      specialization: t.specialization,
      hire_date: '2024-09-01',
    }).select().single();
    if (tErr) throw tErr;

    createdTeachers.push({ ...tRow, profileId: prof.id, profileUuid: prof.id, email: t.email, fullName: `${t.firstName} ${t.lastName}` });
    log(`Teacher: ${t.firstName} ${t.lastName} (${empId}) — ${t.email} / ${TEACHER_PASSWORD}`);
  } catch (e) {
    err(`Teacher ${t.firstName}: ${e.message}`);
  }
}

// ── Step 3: Create class ──────────────────────────────────────────────────────
console.log('\n🏫 Creating class...');

// Assign first teacher as class teacher
const classTeacherProfileId = createdTeachers[0]?.profileId ?? null;

const { data: cls, error: clsErr } = await supabase.from('classes').insert({
  name: 'Basic 3A',
  level: 'basic3',
  academic_year: ACADEMIC_YEAR,
  teacher_id: classTeacherProfileId,
  capacity: 25,
}).select().single();

if (clsErr) {
  // Might already exist — try to fetch it
  const { data: existing } = await supabase.from('classes').select().eq('name', 'Basic 3A').single();
  if (!existing) { err('Could not create or find class: ' + clsErr.message); process.exit(1); }
  log(`Class already exists: Basic 3A (${existing.id})`);
  var classRow = existing;
} else {
  log(`Class created: Basic 3A (${cls.id})`);
  var classRow = cls;
}

// ── Step 4: Create students ───────────────────────────────────────────────────
console.log('\n👦 Creating students...');

const studentDefs = [
  { email: 'chidera.nwosu@quiverfullschool.ng',   firstName: 'Chidera',   lastName: 'Nwosu',    gender: 'male',   dob: '2015-03-12' },
  { email: 'amaka.okafor@quiverfullschool.ng',    firstName: 'Amaka',     lastName: 'Okafor',   gender: 'female', dob: '2015-07-20' },
  { email: 'tobi.adeyemi@quiverfullschool.ng',    firstName: 'Tobi',      lastName: 'Adeyemi',  gender: 'male',   dob: '2015-01-05' },
  { email: 'fatima.bello@quiverfullschool.ng',    firstName: 'Fatima',    lastName: 'Bello',    gender: 'female', dob: '2014-11-30' },
  { email: 'emmanuel.obi@quiverfullschool.ng',    firstName: 'Emmanuel',  lastName: 'Obi',      gender: 'male',   dob: '2015-09-18' },
];

const createdStudents = [];
let studentSeq = 1;

for (const s of studentDefs) {
  try {
    const userId = await createUser(s.email, s.firstName, s.lastName);

    const { data: prof, error: pErr } = await supabase.from('profiles').insert({
      user_id: userId, email: s.email,
      first_name: s.firstName, last_name: s.lastName,
      role: 'student',
    }).select().single();
    if (pErr) throw pErr;

    const studentId = `QFS-2026-${String(studentSeq++).padStart(3, '0')}`;
    const { data: stRow, error: stErr } = await supabase.from('students').insert({
      profile_id: prof.id,
      student_id: studentId,
      class_id: classRow.id,
      gender: s.gender,
      date_of_birth: s.dob,
    }).select().single();
    if (stErr) throw stErr;

    createdStudents.push({ ...stRow, profileId: prof.id, fullName: `${s.firstName} ${s.lastName}`, email: s.email });
    log(`Student: ${s.firstName} ${s.lastName} (${studentId}) — ${s.email} / ${STUDENT_PASSWORD}`);
  } catch (e) {
    err(`Student ${s.firstName}: ${e.message}`);
  }
}

// ── Step 5: Create subjects ───────────────────────────────────────────────────
console.log('\n📚 Creating subjects...');

// Get admin profile id for graded_by
const { data: { user } } = await supabase.auth.getUser();
const { data: adminProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
const adminId = adminProfile.id;

const subjectDefs = [
  { name: 'Mathematics',       code: 'MATH', teacherIdx: 0 },
  { name: 'English Language',  code: 'ENG',  teacherIdx: 1 },
  { name: 'Basic Science',     code: 'BSC',  teacherIdx: 0 },
  { name: 'Social Studies',    code: 'SST',  teacherIdx: 1 },
  { name: 'Christian R. K.',   code: 'CRK',  teacherIdx: 1 },
  { name: 'Quantitative Reasoning', code: 'QNT', teacherIdx: 0 },
];

const createdSubjects = [];
for (const sub of subjectDefs) {
  const teacherProfileId = createdTeachers[sub.teacherIdx]?.profileId ?? null;
  const { data: subRow, error: subErr } = await supabase.from('subjects').insert({
    name: sub.name,
    code: sub.code,
    class_id: classRow.id,
    teacher_id: teacherProfileId,
    term: TERM,
    academic_year: ACADEMIC_YEAR,
  }).select().single();

  if (subErr) {
    err(`Subject ${sub.name}: ${subErr.message}`);
  } else {
    createdSubjects.push(subRow);
    log(`Subject: ${sub.name} (${sub.code})`);
  }
}

// ── Step 6: Create grades ─────────────────────────────────────────────────────
console.log('\n📊 Creating grades...');

// Score ranges per student (to make distinct performance profiles)
const studentProfiles = [
  { ca1: [16, 20], ca2: [15, 19], exam: [50, 58] }, // Chidera — top
  { ca1: [14, 18], ca2: [13, 17], exam: [44, 54] }, // Amaka — good
  { ca1: [12, 16], ca2: [11, 15], exam: [38, 48] }, // Tobi — average
  { ca1: [15, 19], ca2: [14, 18], exam: [46, 56] }, // Fatima — good
  { ca1: [10, 14], ca2: [9, 13],  exam: [32, 44] }, // Emmanuel — below avg
];

const gradeInserts = [];
for (let si = 0; si < createdStudents.length; si++) {
  const student = createdStudents[si];
  const profile = studentProfiles[si] || studentProfiles[4];
  for (const subject of createdSubjects) {
    gradeInserts.push(
      { student_id: student.id, subject: subject.name, assessment_type: '1st CA', score: randInt(...profile.ca1), max_score: 20, term: TERM, academic_year: ACADEMIC_YEAR, graded_by: adminId },
      { student_id: student.id, subject: subject.name, assessment_type: '2nd CA', score: randInt(...profile.ca2), max_score: 20, term: TERM, academic_year: ACADEMIC_YEAR, graded_by: adminId },
      { student_id: student.id, subject: subject.name, assessment_type: 'Exam',   score: randInt(...profile.exam), max_score: 60, term: TERM, academic_year: ACADEMIC_YEAR, graded_by: adminId },
    );
  }
}

const { error: gradeErr } = await supabase.from('grades').insert(gradeInserts);
if (gradeErr) {
  err('Grades insert error: ' + gradeErr.message);
} else {
  log(`${gradeInserts.length} grade records created (${createdStudents.length} students × ${createdSubjects.length} subjects × 3 assessments)`);
}

// ── Step 7: Create result sheets ──────────────────────────────────────────────
console.log('\n📋 Creating result sheets...');

const teacherComments = [
  'Chidera is an exceptional student who consistently demonstrates outstanding academic performance. Keep up the excellent work!',
  'Amaka has shown remarkable improvement this term. Her dedication and hard work are commendable.',
  'Tobi is a diligent student who puts in considerable effort. With more focus, he can achieve even greater results.',
  'Fatima is a bright and enthusiastic learner. Her positive attitude greatly contributes to the class.',
  'Emmanuel shows potential and is making steady progress. We encourage him to dedicate more time to his studies.',
];
const principalComments = [
  "An outstanding performance! We are proud of Chidera's achievements this term.",
  "Amaka has performed admirably. We look forward to continued excellence next term.",
  "A satisfactory performance. We encourage Tobi to aim higher next term.",
  "Fatima has done very well this term. Keep up the commendable effort!",
  "Emmanuel has made progress. With consistent effort, we are confident he will improve further.",
];

// Behavior ratings: 5=Excellent, 4=Very Good, 3=Good, 2=Fair, 1=Poor
const behaviorByRank = [
  { punctuality: 5, neatness: 5, honesty: 5, cooperation: 5, attentiveness: 5, politeness: 5 }, // Chidera
  { punctuality: 4, neatness: 5, honesty: 4, cooperation: 4, attentiveness: 4, politeness: 5 }, // Amaka
  { punctuality: 4, neatness: 3, honesty: 4, cooperation: 4, attentiveness: 3, politeness: 4 }, // Tobi
  { punctuality: 5, neatness: 4, honesty: 5, cooperation: 5, attentiveness: 4, politeness: 5 }, // Fatima
  { punctuality: 3, neatness: 3, honesty: 4, cooperation: 3, attentiveness: 3, politeness: 3 }, // Emmanuel
];

for (let si = 0; si < createdStudents.length; si++) {
  const student = createdStudents[si];
  const absent = randInt(0, si * 2);
  const { error: rsErr } = await supabase.from('result_sheets').insert({
    student_id: student.id,
    term: TERM,
    academic_year: ACADEMIC_YEAR,
    // Behavior ratings (1-5 scale)
    ...behaviorByRank[si],
    // Attendance
    total_school_days: 60,
    days_present: 60 - absent,
    days_absent: absent,
    // Comments
    teacher_comment: teacherComments[si],
    principal_comment: principalComments[si],
    // Next term
    next_term_begins: '2026-04-28',
    next_term_fees: '120,000',
    // Published so parent/teacher can see it
    is_published: true,
    created_by: adminId,
  });

  if (rsErr) {
    err(`Result sheet for ${student.fullName}: ${rsErr.message}`);
  } else {
    log(`Result sheet created for ${student.fullName} (published)`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n✅ Seed complete!\n');
console.log('─────────────────────────────────────────────────────');
console.log('TEACHER ACCOUNTS:');
for (const t of teachers) {
  console.log(`  ${t.firstName} ${t.lastName} — ${t.email} / ${TEACHER_PASSWORD}`);
}
console.log('\nSTUDENT ACCOUNTS:');
for (const s of studentDefs) {
  console.log(`  ${s.firstName} ${s.lastName} — ${s.email} / ${STUDENT_PASSWORD}`);
}
console.log('\nCLASS: Basic 3A (Basic 3, 2025/2026)');
console.log(`SUBJECTS: ${subjectDefs.map(s => s.name).join(', ')}`);
console.log('─────────────────────────────────────────────────────\n');

process.exit(0);
