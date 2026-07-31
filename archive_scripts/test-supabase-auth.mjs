import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ limit: 2 });
  if (users && users.length > 0) {
    console.log(users[0].user_metadata);
  }
}
check();
