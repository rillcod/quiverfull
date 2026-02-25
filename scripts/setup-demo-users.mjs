/**
 * Quiverfull School - Demo User Setup Script
 *
 * Run this AFTER applying the migration SQL in the Supabase SQL Editor.
 *
 * Usage:  node scripts/setup-demo-users.mjs
 */

const SUPABASE_URL = 'https://vitvykboryrudxofgyso.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdHZ5a2JvcnlydWR4b2ZneXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg1ODE5NCwiZXhwIjoyMDg3NDM0MTk0fQ.1CaJXZ4zrJlVhOjxTbeIp2Ahatv0wRXdI-hQ5pjnBUI';

const DEMO_USERS = [
  {
    email: 'admin@quiverfullschool.ng',
    password: 'Admin123!',
    profile: {
      first_name: 'School',
      last_name: 'Administrator',
      phone: '+234 800 000 0001',
      role: 'admin',
    },
  },
  {
    email: 'teacher@quiverfullschool.ng',
    password: 'Teacher123!',
    profile: {
      first_name: 'Grace',
      last_name: 'Adeyemi',
      phone: '+234 800 000 0002',
      role: 'teacher',
    },
  },
  {
    email: 'parent@quiverfullschool.ng',
    password: 'Parent123!',
    profile: {
      first_name: 'Emmanuel',
      last_name: 'Okafor',
      phone: '+234 800 000 0003',
      role: 'parent',
    },
  },
  {
    email: 'student@quiverfullschool.ng',
    password: 'Student123!',
    profile: {
      first_name: 'Chidi',
      last_name: 'Okafor',
      phone: null,
      role: 'student',
    },
  },
];

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
};

async function createAuthUser(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,  // skip email verification
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // If user already exists, fetch them instead
    if (data.msg && data.msg.includes('already been registered')) {
      console.log(`  ℹ User ${email} already exists, fetching...`);
      return await getAuthUserByEmail(email);
    }
    throw new Error(`Auth API error for ${email}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function getAuthUserByEmail(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Could not fetch user ${email}: ${JSON.stringify(data)}`);
  const users = data.users || [];
  const found = users.find(u => u.email === email);
  if (!found) throw new Error(`User ${email} not found after creation`);
  return found;
}

async function upsertProfile(userId, email, profileData) {
  const payload = {
    user_id: userId,
    email,
    ...profileData,
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Profile upsert failed for ${email}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function checkTablesExist() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
    headers,
  });
  return res.ok;
}

async function main() {
  console.log('\n🏫 Quiverfull School - Demo User Setup\n');
  console.log('Checking database tables...');

  const tablesReady = await checkTablesExist();
  if (!tablesReady) {
    console.error('\n❌ ERROR: The "profiles" table does not exist yet!');
    console.error('\nPlease run the migration SQL first:');
    console.error('  1. Go to: https://supabase.com/dashboard/project/vitvykboryrudxofgyso/sql/new');
    console.error('  2. Open the file: supabase/migrations/20250805133821_silver_swamp.sql');
    console.error('  3. Paste the entire SQL and click "Run"');
    console.error('  4. Then re-run this script.\n');
    process.exit(1);
  }

  console.log('✅ Database tables found\n');
  console.log('Creating demo users...\n');

  for (const user of DEMO_USERS) {
    process.stdout.write(`Creating ${user.profile.role}: ${user.email} ... `);
    try {
      const authUser = await createAuthUser(user.email, user.password);
      await upsertProfile(authUser.id, user.email, user.profile);
      console.log('✅');
    } catch (err) {
      console.log('❌');
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log('\n✅ Setup complete! You can now log in with these accounts:\n');
  console.log('  Admin:   admin@quiverfullschool.ng   / Admin123!');
  console.log('  Teacher: teacher@quiverfullschool.ng / Teacher123!');
  console.log('  Parent:  parent@quiverfullschool.ng  / Parent123!');
  console.log('  Student: student@quiverfullschool.ng / Student123!');
  console.log('\n');
}

main().catch(err => {
  console.error('\nUnexpected error:', err);
  process.exit(1);
});
