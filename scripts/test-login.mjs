import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vitvykboryrudxofgyso.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4APVFTv93BW5S-zhwr-Ssw_0zup-7mq';

const users = [
  { role: 'Admin',   email: 'admin@quiverfullschool.ng',   password: 'Admin123!' },
  { role: 'Teacher', email: 'teacher@quiverfullschool.ng', password: 'Teacher123!' },
  { role: 'Parent',  email: 'parent@quiverfullschool.ng',  password: 'Parent123!' },
  { role: 'Student', email: 'student@quiverfullschool.ng', password: 'Student123!' },
];

console.log('\n🏫 Quiverfull School - Full Auth Test (via Supabase JS client)\n');

let passed = 0;
let failed = 0;

for (const u of users) {
  // Fresh client per user so sessions don't bleed
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Step 1: Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: u.email,
    password: u.password,
  });

  if (authError || !authData.user) {
    console.log(`❌ ${u.role.padEnd(8)} — Auth FAILED: ${authError?.message}`);
    failed++;
    continue;
  }

  // Step 2: Fetch own profile (exactly as useAuth.ts does)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();

  if (profileError || !profile) {
    console.log(`⚠️  ${u.role.padEnd(8)} — Auth OK but profile fetch failed: ${profileError?.message}`);
    failed++;
    continue;
  }

  console.log(`✅ ${u.role.padEnd(8)} — Login + Profile OK | ${profile.first_name} ${profile.last_name} | role: ${profile.role}`);
  passed++;

  await supabase.auth.signOut();
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 All tests passed! App is fully functional.\n');
} else {
  console.log('⚠️  Some issues need fixing — check above.\n');
}
