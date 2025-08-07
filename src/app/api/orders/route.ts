import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Order, CreateOrderRequest, OrderFilters } from '@/types/database';

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
    const user_id = searchParams.get('user_id');
    const search = searchParams.get('search');

    let query = supabase
      .from('orders')
      .select(`
        *,
        user_profiles!orders_user_id_fkey (
          id,
          full_name,
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (profile?.role === 'user' || profile?.role === 'client') {
      query = query.eq('user_id', user.id);
    } else if (user_id && (profile?.role === 'admin' || profile?.role === 'finance' || profile?.role === 'team_lead')) {
      query = query.eq('user_id', user_id);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%, order_number.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: orders, error, count } = await query
      .range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: orders,
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
    console.error('Orders GET error:', error);
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

    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = body.amount || 0;

    // Create order data
    const orderData = {
      user_id: user.id,
      title: body.title,
      description: body.description,
      type: body.type,
      technology: body.technology,
      timeline: body.timeline,
      team_size: body.team_size,
      amount: totalAmount,
      status: 'draft', // Start with draft status
      payment_status: 'pending',
      delivery_status: 'pending',
      team_members: body.team_members || [],
      delivery_address: body.delivery_address,
      estimated_delivery: body.estimated_delivery,
      attachments: [],
      metadata: {}
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderData])
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
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'created',
      entity_type: 'order',
      entity_id: order.id,
      description: `Created order: ${order.title}`,
      new_values: order
    }]);

    // Create notification for admin users
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .in('role', ['admin', 'team_lead']);

    if (adminUsers) {
      const notifications = adminUsers.map(admin => ({
        user_id: admin.id,
        title: 'New Order Created',
        message: `A new order "${order.title}" has been created by ${user.email}`,
        type: 'order',
        related_order_id: order.id
      }));

      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({ 
      data: order,
      success: true,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}