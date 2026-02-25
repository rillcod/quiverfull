// Query pg_policies via Supabase REST using service role
const URL = 'https://vitvykboryrudxofgyso.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdHZ5a2JvcnlydWR4b2ZneXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg1ODE5NCwiZXhwIjoyMDg3NDM0MTk0fQ.1CaJXZ4zrJlVhOjxTbeIp2Ahatv0wRXdI-hQ5pjnBUI';

const res = await fetch(`${URL}/rest/v1/rpc/get_policies`, {
  method: 'POST',
  headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});

if (!res.ok) {
  // Fallback: check via information_schema via rpc
  console.log('RPC not available, checking via direct query...');
  const r2 = await fetch(`${URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: "SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname" }),
  });
  console.log('Status:', r2.status, await r2.text());
} else {
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
