import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/utils/email';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, order_item_id, feedback_notes, attachment_urls } = await req.json();

    if (!order_id || !order_item_id || !feedback_notes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert revision request
    const { data: revision, error: insertError } = await supabase
      .from('revision_requests')
      .insert([
        {
          order_id,
          order_item_id,
          customer_email: user.email,
          feedback_notes,
          attachment_urls: attachment_urls || [],
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Increment revisions_used in order_items
    // Since we might not know current count exactly, we can call an rpc or fetch and update
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('revisions_used')
      .eq('id', order_item_id)
      .single();

    if (orderItem) {
      await supabase
        .from('order_items')
        .update({ revisions_used: (orderItem.revisions_used || 0) + 1 })
        .eq('id', order_item_id);
    }

    // Update order status to revision if it's currently completed/delivered
    await supabase
      .from('orders')
      .update({ status: 'revision' })
      .eq('id', order_id);

    // Send email to admin
    await sendEmail({
      to: 'tayebur.tyes@gmail.com', // or env admin email
      subject: `New Revision Request for Order ${order_id}`,
      text: `Client ${user.email} has requested a revision on order ${order_id}.\n\nFeedback:\n${feedback_notes}`
    });

    return NextResponse.json({ data: revision });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
