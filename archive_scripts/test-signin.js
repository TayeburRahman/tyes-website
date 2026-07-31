const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const email = 'test1783252264131@example.com';
  console.log('Signing in with', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: 'password123',
  });
  console.log('Error:', error);
  console.log('Session:', !!data.session);
}

run();
