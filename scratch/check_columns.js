
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv' 

dotenv.config({ path: './.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase.from('orders').select('*').limit(1)
  if (error) {
    console.error('Error fetching order:', error)
    return
  }
  if (data && data.length > 0) {
    console.log('Columns in orders table:', Object.keys(data[0]))
  } else {
    console.log('No orders found to check columns.')
  }
}

checkColumns()
