const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const email = 'test1783252264131@example.com';
  const { data: authData } = await supabase.auth.signInWithPassword({
    email,
    password: 'password123',
  });
  console.log('User ID:', authData.user.id);
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();
  console.log('Profile:', profile);
  console.log('Error:', error);
}

run();
