const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInvoices() {
  console.log('Checking invoices...');
  const { data, error } = await supabase.from('invoices').select('*, orders(title)');
  if (error) {
    console.error('Error fetching invoices:', error);
  } else {
    console.log(`Found ${data.length} invoices.`);
    console.log(JSON.stringify(data, null, 2));
  }
}
checkInvoices();
