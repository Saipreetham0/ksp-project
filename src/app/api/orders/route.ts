import { getUserOr401 } from "@/lib/api-auth";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Order, CreateOrderRequest, OrderFilters } from '@/types/database';
import { listOrders, createOrder, logOrderActivity, notifyAdminsOfNewOrder } from '@/features/orders/services/orders.service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getUserOr401(supabase);
    if (user instanceof NextResponse) return user;

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

    const { data: orders, error, count } = await listOrders(
      supabase,
      {
        page,
        limit,
        status: status || undefined,
        user_id: user_id || undefined,
        search: search || undefined
      },
      profile?.role,
      user.id
    );

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
    const user = await getUserOr401(supabase);
    if (user instanceof NextResponse) return user;

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

    const { data: order, error } = await createOrder(supabase, orderData);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Log activity
    await logOrderActivity(supabase, {
      user_id: user.id,
      action: 'created',
      entity_id: order.id,
      description: `Created order: ${order.title}`,
      new_values: order
    });

    // Create notification for admin users
    await notifyAdminsOfNewOrder(supabase, order, user.email || '');

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