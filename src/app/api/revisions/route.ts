import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendRevisionRequestEmail } from '@/utils/email';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, item_index, feedback_notes, attachment_urls } = await req.json();

    if (!order_id || item_index === undefined || !feedback_notes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (feedback_notes.length < 20) {
      return NextResponse.json({ error: 'Note must be at least 20 characters' }, { status: 400 });
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, max_revisions')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (['Approved', 'Cancelled'].includes(order.status)) {
      return NextResponse.json({ error: 'Cannot request revision for Approved or Cancelled orders' }, { status: 400 });
    }

    const items = order.items || [];
    const item = items[item_index];
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const max_revisions = order.max_revisions || 0;
    const revisions_used = item.revisionsUsed || 0;

    if (revisions_used >= max_revisions) {
      return NextResponse.json({ error: 'Revision limit reached for this image' }, { status: 400 });
    }

    if (item.deliveredAt) {
      const deliveredDate = new Date(item.deliveredAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (deliveredDate < sevenDaysAgo) {
        return NextResponse.json({ error: 'Revision request period (7 days) has expired' }, { status: 400 });
      }
    } else {
      // If no deliveredAt, it might not be delivered or it's old data. Spec says only on delivered items.
      // If we strict enforce:
      if (item.status !== 'delivered' && item.status !== 'Completed') {
        return NextResponse.json({ error: 'Item is not delivered yet' }, { status: 400 });
      }
    }

    // Update the items array
    const updatedItems = [...items];
    updatedItems[item_index] = {
      ...item,
      revisionsUsed: revisions_used + 1,
      status: 'revision',
      revisionReason: feedback_notes,
      revisionReference: attachment_urls?.[0] || null,
      revisionDate: new Date().toISOString()
    };

    // Insert revision request
    const { data: revision, error: insertError } = await supabase
      .from('revision_requests')
      .insert([
        {
          order_id,
          item_index,
          customer_email: user.email,
          note: feedback_notes,
          reference_url: attachment_urls?.[0] || null, // Assuming one reference url for now, or stringify if array
          status: 'open'
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Update order status and items
    await supabase
      .from('orders')
      .update({ 
        status: 'revision',
        items: updatedItems,
        revisions: (order.revisions || 0) + 1 // Keep total revisions count updated
      })
      .eq('id', order_id);

    // Send email to admin
    await sendRevisionRequestEmail({
      to: 'tayebur.tyes@gmail.com', // or env admin email
      orderId: order_id,
      clientEmail: user.email || 'Unknown',
      feedback: feedback_notes
    });

    return NextResponse.json({ data: revision });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
