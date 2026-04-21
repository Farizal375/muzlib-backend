const { createClient } = require('@supabase/supabase-js');

const url = 'https://zvdcmgsdepfqnovksmjt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZGNtZ3NkZXBmcW5vdmtzbWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDkyMzUsImV4cCI6MjA5MjA4NTIzNX0.xle5ymkF3MRziVwxoyVEaVmnX3-CoeEjyOJuFCikcm4';

const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function test() {
  const { data, error } = await client.auth.getUser('dummy-token');
  console.log("Error:", error?.message);
}
test();
