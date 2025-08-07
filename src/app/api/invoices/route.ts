import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CreateInvoiceRequest, Invoice } from '@/types/database';
import { zohoInvoice, mapZohoStatusToLocal } from '@/lib/zoho-invoice';

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
    const order_id = searchParams.get('order_id');

    let query = supabase
      .from('invoices')
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
        )
      `)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (profile?.role === 'user' || profile?.role === 'client') {
      // Users can only see invoices for their own orders
      query = query.eq('orders.user_id', user.id);
    } else if (!['admin', 'finance'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (order_id) {
      query = query.eq('order_id', parseInt(order_id));
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: invoices, error, count } = await query.range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: invoices,
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
    console.error('Invoices GET error:', error);
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

    // Check permissions - only admin and finance can create invoices
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    if (!['admin', 'finance'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: CreateInvoiceRequest = await request.json();

    // Validate required fields
    if (!body.order_id || !body.line_items || body.line_items.length === 0) {
      return NextResponse.json({ error: 'Order ID and line items are required' }, { status: 400 });
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
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
      .eq('id', body.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate amounts
    const lineItemsTotal = body.line_items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = body.tax_amount || 0;
    const discountAmount = body.discount_amount || 0;
    const totalAmount = lineItemsTotal + taxAmount - discountAmount;

    // Prepare invoice data
    const invoiceData = {
      order_id: body.order_id,
      amount: body.amount || lineItemsTotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      currency: 'INR',
      status: 'draft',
      due_date: body.due_date,
      invoice_date: new Date().toISOString().split('T')[0],
      customer_email: body.customer_email || (order as any).user_profiles?.email,
      customer_name: body.customer_name || (order as any).user_profiles?.full_name || (order as any).user_profiles?.display_name,
      billing_address: body.billing_address,
      line_items: body.line_items,
      notes: body.notes,
      metadata: {}
    };

    // Create invoice in database
    const { data: invoice, error: dbError } = await supabase
      .from('invoices')
      .insert([invoiceData])
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
        )
      `)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    // Try to create invoice in Zoho (if configured)
    let zohoInvoiceId = null;
    if (zohoInvoice.isConfigured()) {
      try {
        const zohoResult = await zohoInvoice.createInvoice({
          ...body,
          customer_email: invoiceData.customer_email!,
          customer_name: invoiceData.customer_name!,
          invoice_date: invoiceData.invoice_date
        });

        zohoInvoiceId = zohoResult.invoice_id;

        // Update invoice with Zoho ID
        await supabase
          .from('invoices')
          .update({ 
            zoho_invoice_id: zohoInvoiceId,
            status: mapZohoStatusToLocal(zohoResult.status),
            metadata: { zoho_data: zohoResult }
          })
          .eq('id', invoice.id);

      } catch (zohoError) {
        console.error('Zoho integration error:', zohoError);
        // Don't fail the request if Zoho fails - invoice is still created locally
      }
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'created',
      entity_type: 'invoice',
      entity_id: invoice.id,
      description: `Created invoice ${invoice.invoice_number} for order ${order.title}`,
      new_values: invoice
    }]);

    // Create notification for customer
    await supabase.from('notifications').insert([{
      user_id: order.user_id,
      title: 'Invoice Generated',
      message: `Invoice ${invoice.invoice_number} has been generated for your order "${order.title}"`,
      type: 'invoice',
      related_order_id: order.id,
      related_invoice_id: invoice.id
    }]);

    return NextResponse.json({ 
      data: { ...invoice, zoho_invoice_id: zohoInvoiceId },
      success: true,
      message: 'Invoice created successfully'
    });

  } catch (error) {
    console.error('Invoices POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}