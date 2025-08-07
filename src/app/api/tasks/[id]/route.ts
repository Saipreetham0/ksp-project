import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { UpdateTaskRequest } from '@/types/database';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('tasks')
      .select(`
        *,
        orders (
          id,
          order_number,
          title,
          user_id,
          user_profiles!orders_user_id_fkey (
            id,
            full_name,
            email,
            display_name
          )
        ),
        assigned_user:user_profiles!tasks_assigned_to_fkey (
          id,
          full_name,
          email,
          display_name,
          avatar_url
        ),
        created_user:user_profiles!tasks_created_by_fkey (
          id,
          full_name,
          email,
          display_name
        )
      `)
      .eq('id', taskId);

    // Apply role-based access control
    if (profile?.role === 'user') {
      query = query.or(`assigned_to.eq.${user.id},orders.user_id.eq.${user.id}`);
    } else if (profile?.role === 'client') {
      query = query.eq('orders.user_id', user.id);
    }

    const { data: task, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }

    return NextResponse.json({ data: task, success: true });

  } catch (error) {
    console.error('Task GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    // Get existing task to check permissions
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select(`
        *,
        orders (
          id,
          user_id
        )
      `)
      .eq('id', taskId)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body: UpdateTaskRequest = await request.json();

    // Check permissions
    const canEdit = 
      profile?.role === 'admin' ||
      profile?.role === 'team_lead' ||
      (profile?.role === 'moderator') ||
      existingTask.assigned_to === user.id ||
      existingTask.created_by === user.id;

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Allow different updates based on role
    if (['admin', 'team_lead', 'moderator'].includes(profile?.role || '')) {
      // Admins and team leads can update everything
      if (body.title) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.priority) updateData.priority = body.priority;
      if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
      if (body.due_date !== undefined) updateData.due_date = body.due_date;
      if (body.estimated_hours !== undefined) updateData.estimated_hours = body.estimated_hours;
      if (body.tags) updateData.tags = body.tags;
    }

    // Anyone who can edit can update these fields
    if (body.status) updateData.status = body.status;
    if (body.progress_percentage !== undefined) updateData.progress_percentage = body.progress_percentage;
    if (body.actual_hours !== undefined) updateData.actual_hours = body.actual_hours;
    if (body.completion_notes !== undefined) updateData.completion_notes = body.completion_notes;

    // Set completion timestamp if status changes to done
    if (body.status === 'done' && existingTask.status !== 'done') {
      updateData.completed_at = new Date().toISOString();
      updateData.progress_percentage = 100;
    }

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        orders (
          id,
          order_number,
          title,
          user_id,
          user_profiles!orders_user_id_fkey (
            id,
            full_name,
            email,
            display_name
          )
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
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'updated',
      entity_type: 'task',
      entity_id: taskId,
      description: `Updated task: ${updatedTask.title}`,
      old_values: existingTask,
      new_values: updatedTask
    }]);

    // Send notifications for status changes
    const notifications = [];

    if (body.status && body.status !== existingTask.status) {
      // Notify assigned user if status changed and they didn't make the change
      if (existingTask.assigned_to && existingTask.assigned_to !== user.id) {
        notifications.push({
          user_id: existingTask.assigned_to,
          title: 'Task Status Updated',
          message: `Task "${updatedTask.title}" status changed to ${body.status}`,
          type: 'task',
          related_task_id: taskId,
          related_order_id: updatedTask.order_id
        });
      }

      // Notify order owner
      const order = (updatedTask as any).orders;
      if (order.user_id !== user.id && order.user_id !== existingTask.assigned_to) {
        notifications.push({
          user_id: order.user_id,
          title: 'Task Status Updated',
          message: `Task "${updatedTask.title}" status changed to ${body.status}`,
          type: 'task',
          related_task_id: taskId,
          related_order_id: order.id
        });
      }

      // Notify team leads and admins when task is completed
      if (body.status === 'done') {
        const { data: teamLeads } = await supabase
          .from('user_profiles')
          .select('id')
          .in('role', ['admin', 'team_lead']);

        if (teamLeads) {
          const teamNotifications = teamLeads
            .filter(lead => lead.id !== user.id)
            .map(lead => ({
              user_id: lead.id,
              title: 'Task Completed',
              message: `Task "${updatedTask.title}" has been completed`,
              type: 'task',
              related_task_id: taskId,
              related_order_id: updatedTask.order_id
            }));
          
          notifications.push(...teamNotifications);
        }
      }
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({ 
      data: updatedTask,
      success: true,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Task PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    // Only admins and team leads can delete tasks
    if (!['admin', 'team_lead'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get task details before deletion
    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete the task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'deleted',
      entity_type: 'task',
      entity_id: taskId,
      description: `Deleted task: ${task.title}`,
      old_values: task
    }]);

    return NextResponse.json({ 
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}