const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const email = 'test' + Date.now() + '@example.com';
  console.log('Signing up with', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        first_name: 'John',
        last_name: 'Doe',
        country: 'RO',
        is_business: false,
        company_name: null,
        vat_number: null,
        registered_address: null,
        billing_email: null,
        role: "client",
      },
    },
  });
  console.log('Error:', error);
  console.log('Session:', !!data.session);
}

run();
