import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS revision_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        item_index INTEGER NOT NULL,
        note TEXT,
        reference_url TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
    `
  });
  
  if (error) console.error('Error creating table via RPC:', error);
  else console.log('Successfully created revision_requests table');
}
run();
