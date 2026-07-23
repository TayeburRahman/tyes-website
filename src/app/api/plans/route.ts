import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    // Use service role key to bypass RLS since this is a server-side route
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch active plans ordered by id (to maintain order like Free Image, Single, etc)
    const { data: plans, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
