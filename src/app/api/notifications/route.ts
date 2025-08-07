import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unread_only = searchParams.get('unread_only') === 'true';
    const type = searchParams.get('type');

    let query = supabase
      .from('notifications')
      .select(`
        *,
        related_order:orders (
          id,
          order_number,
          title
        ),
        related_task:tasks (
          id,
          title
        ),
        related_invoice:invoices (
          id,
          invoice_number
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (unread_only) {
      query = query.eq('read', false);
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Filter out expired notifications
    query = query.or('expires_at.is.null,expires_at.gt.now()');

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: notifications, error, count } = await query.range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: notifications,
      pagination: {
        page,
        limit,
        count: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      }
    });

  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admins and team leads can create notifications for other users
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // Check if user can send to target user
    const targetUserId = body.user_id || user.id;
    
    if (targetUserId !== user.id && !['admin', 'team_lead'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const notificationData = {
      user_id: targetUserId,
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      related_order_id: body.related_order_id || null,
      related_task_id: body.related_task_id || null,
      related_invoice_id: body.related_invoice_id || null,
      action_url: body.action_url || null,
      action_label: body.action_label || null,
      expires_at: body.expires_at || null,
      metadata: body.metadata || {}
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'created',
      entity_type: 'notification',
      entity_id: notification.id,
      description: `Created notification: ${notification.title}`,
      new_values: notification
    }]);

    return NextResponse.json({
      data: notification,
      success: true,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}