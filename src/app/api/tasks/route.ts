import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CreateTaskRequest, TaskFilters } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const assigned_to = searchParams.get('assigned_to');
    const order_id = searchParams.get('order_id');
    const priority = searchParams.get('priority');

    let query = supabase
      .from('tasks')
      .select(`
        *,
        orders (
          id,
          order_number,
          title,
          user_id
        ),
        assigned_user:user_profiles!tasks_assigned_to_fkey (
          id,
          full_name,
          email,
          display_name
        ),
        created_user:user_profiles!tasks_created_by_fkey (
          id,
          full_name,
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (profile?.role === 'user') {
      // Users can only see tasks for their orders or assigned to them
      query = query.or(`assigned_to.eq.${user.id},orders.user_id.eq.${user.id}`);
    } else if (profile?.role === 'client') {
      // Clients can only see tasks for their orders
      query = query.eq('orders.user_id', user.id);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (assigned_to && ['admin', 'team_lead', 'moderator'].includes(profile?.role || '')) {
      query = query.eq('assigned_to', assigned_to);
    }
    if (order_id) {
      query = query.eq('order_id', parseInt(order_id));
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: tasks, error, count } = await query.range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: tasks,
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
    console.error('Tasks GET error:', error);
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

    // Check permissions - team leads and admins can create tasks
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    if (!['admin', 'team_lead', 'moderator'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: CreateTaskRequest = await request.json();

    // Validate required fields
    if (!body.order_id || !body.title) {
      return NextResponse.json({ error: 'Order ID and title are required' }, { status: 400 });
    }

    // Verify order exists and user has access
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, title, user_id')
      .eq('id', body.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create task data
    const taskData = {
      order_id: body.order_id,
      title: body.title,
      description: body.description,
      priority: body.priority || 'medium',
      status: 'todo',
      assigned_to: body.assigned_to,
      created_by: user.id,
      due_date: body.due_date,
      estimated_hours: body.estimated_hours,
      tags: body.tags || [],
      attachments: [],
      dependencies: [],
      progress_percentage: 0
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select(`
        *,
        orders (
          id,
          order_number,
          title,
          user_id
        ),
        assigned_user:user_profiles!tasks_assigned_to_fkey (
          id,
          full_name,
          email,
          display_name
        ),
        created_user:user_profiles!tasks_created_by_fkey (
          id,
          full_name,
          email,
          display_name
        )
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'created',
      entity_type: 'task',
      entity_id: task.id,
      description: `Created task: ${task.title} for order ${order.title}`,
      new_values: task
    }]);

    // Create notifications
    const notifications = [];

    // Notify the assigned user
    if (task.assigned_to && task.assigned_to !== user.id) {
      notifications.push({
        user_id: task.assigned_to,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${task.title}"`,
        type: 'task',
        related_order_id: order.id,
        related_task_id: task.id,
        action_url: `/tasks/${task.id}`,
        action_label: 'View Task'
      });
    }

    // Notify the order owner
    if (order.user_id !== user.id && order.user_id !== task.assigned_to) {
      notifications.push({
        user_id: order.user_id,
        title: 'New Task Created',
        message: `A new task "${task.title}" has been created for your order "${order.title}"`,
        type: 'task',
        related_order_id: order.id,
        related_task_id: task.id
      });
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({ 
      data: task,
      success: true,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}