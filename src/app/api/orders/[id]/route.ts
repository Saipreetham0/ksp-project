import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { UpdateOrderRequest } from '@/types/database';

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

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('orders')
      .select(`
        *,
        user_profiles!orders_user_id_fkey (
          id,
          full_name,
          email,
          display_name,
          phone_number
        ),
        tasks (
          id,
          title,
          status,
          priority,
          assigned_to,
          due_date,
          progress_percentage
        ),
        invoices (
          id,
          invoice_number,
          amount,
          status,
          due_date,
          invoice_date
        )
      `)
      .eq('id', orderId);

    // Apply role-based access control
    if (profile?.role === 'user' || profile?.role === 'client') {
      query = query.eq('user_id', user.id);
    }

    const { data: order, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }

    return NextResponse.json({ data: order, success: true });

  } catch (error) {
    console.error('Order GET error:', error);
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

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    // Check if order exists and user has access
    let orderQuery = supabase
      .from('orders')
      .select('*')
      .eq('id', orderId);

    if (profile?.role === 'user' || profile?.role === 'client') {
      orderQuery = orderQuery.eq('user_id', user.id);
    }

    const { data: existingOrder, error: fetchError } = await orderQuery.single();

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body: UpdateOrderRequest = await request.json();

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Allow different fields based on role
    if (profile?.role === 'admin' || profile?.role === 'team_lead' || profile?.role === 'moderator') {
      // Admins can update everything
      if (body.title) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.type) updateData.type = body.type;
      if (body.technology !== undefined) updateData.technology = body.technology;
      if (body.timeline !== undefined) updateData.timeline = body.timeline;
      if (body.team_size !== undefined) updateData.team_size = body.team_size;
      if (body.amount !== undefined) updateData.amount = body.amount;
      if (body.status) updateData.status = body.status;
      if (body.payment_status) updateData.payment_status = body.payment_status;
      if (body.delivery_status) updateData.delivery_status = body.delivery_status;
      if (body.team_members) updateData.team_members = body.team_members;
      if (body.delivery_address) updateData.delivery_address = body.delivery_address;
      if (body.estimated_delivery !== undefined) updateData.estimated_delivery = body.estimated_delivery;
      if (body.actual_delivery !== undefined) updateData.actual_delivery = body.actual_delivery;
    } else if (profile?.role === 'user' && existingOrder.user_id === user.id) {
      // Users can only update limited fields of their own orders
      if (body.title) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.delivery_address) updateData.delivery_address = body.delivery_address;
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select(`
        *,
        user_profiles!orders_user_id_fkey (
          id,
          full_name,
          email,
          display_name
        )
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'updated',
      entity_type: 'order',
      entity_id: orderId,
      description: `Updated order: ${updatedOrder.title}`,
      old_values: existingOrder,
      new_values: updatedOrder
    }]);

    // Send notification if status changed
    if (body.status && body.status !== existingOrder.status) {
      await supabase.from('notifications').insert([{
        user_id: existingOrder.user_id,
        title: 'Order Status Updated',
        message: `Your order "${updatedOrder.title}" status has been updated to ${body.status}`,
        type: 'order',
        related_order_id: orderId
      }]);
    }

    return NextResponse.json({ 
      data: updatedOrder,
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Order PUT error:', error);
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

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    // Only admins can delete orders
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get order details before deletion
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete the order (cascade will handle related records)
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'deleted',
      entity_type: 'order',
      entity_id: orderId,
      description: `Deleted order: ${order.title}`,
      old_values: order
    }]);

    return NextResponse.json({ 
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Order DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}