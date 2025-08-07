import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { zohoInvoice, mapZohoStatusToLocal } from '@/lib/zoho-invoice';

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

    const invoiceId = parseInt(params.id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

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
            display_name,
            phone_number
          )
        )
      `)
      .eq('id', invoiceId);

    // Apply role-based access control
    if (profile?.role === 'user' || profile?.role === 'client') {
      // Users can only see invoices for their own orders
      query = query.eq('orders.user_id', user.id);
    } else if (!['admin', 'finance'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: invoice, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }

    // Sync with Zoho if configured and has Zoho ID
    if (invoice.zoho_invoice_id && zohoInvoice.isConfigured()) {
      try {
        const zohoData = await zohoInvoice.getInvoice(invoice.zoho_invoice_id);
        
        // Update local status if different from Zoho
        const localStatus = mapZohoStatusToLocal(zohoData.status);
        if (localStatus !== invoice.status) {
          await supabase
            .from('invoices')
            .update({ 
              status: localStatus,
              metadata: { ...invoice.metadata, zoho_data: zohoData }
            })
            .eq('id', invoiceId);
          
          invoice.status = localStatus;
        }
      } catch (zohoError) {
        console.error('Zoho sync error:', zohoError);
        // Don't fail the request if Zoho sync fails
      }
    }

    return NextResponse.json({ data: invoice, success: true });

  } catch (error) {
    console.error('Invoice GET error:', error);
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

    const invoiceId = parseInt(params.id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Check permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    if (!['admin', 'finance'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get existing invoice
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const body = await request.json();

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.status) updateData.status = body.status;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.paid_date !== undefined) updateData.paid_date = body.paid_date;

    // Update in database
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
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

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    // Sync with Zoho if configured
    if (existingInvoice.zoho_invoice_id && zohoInvoice.isConfigured()) {
      try {
        const zohoUpdateData: any = {};
        if (body.due_date !== undefined) zohoUpdateData.due_date = body.due_date;
        if (body.notes !== undefined) zohoUpdateData.notes = body.notes;

        if (Object.keys(zohoUpdateData).length > 0) {
          await zohoInvoice.updateInvoice(existingInvoice.zoho_invoice_id, zohoUpdateData);
        }

        // Mark as paid in Zoho if status changed to paid
        if (body.status === 'paid' && existingInvoice.status !== 'paid') {
          await zohoInvoice.markInvoiceAsPaid(existingInvoice.zoho_invoice_id, {
            date: body.paid_date || new Date().toISOString().split('T')[0],
            amount: existingInvoice.total_amount,
            payment_mode: 'other',
            reference_number: body.payment_reference,
            notes: body.payment_notes
          });
        }
      } catch (zohoError) {
        console.error('Zoho update error:', zohoError);
      }
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'updated',
      entity_type: 'invoice',
      entity_id: invoiceId,
      description: `Updated invoice ${updatedInvoice.invoice_number}`,
      old_values: existingInvoice,
      new_values: updatedInvoice
    }]);

    // Send notification if status changed to paid
    if (body.status === 'paid' && existingInvoice.status !== 'paid') {
      const order = (updatedInvoice as any).orders;
      await supabase.from('notifications').insert([{
        user_id: order.user_id,
        title: 'Payment Received',
        message: `Payment received for invoice ${updatedInvoice.invoice_number}`,
        type: 'payment',
        related_order_id: order.id,
        related_invoice_id: invoiceId
      }]);
    }

    return NextResponse.json({ 
      data: updatedInvoice,
      success: true,
      message: 'Invoice updated successfully'
    });

  } catch (error) {
    console.error('Invoice PUT error:', error);
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

    const invoiceId = parseInt(params.id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Only admins can delete invoices
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get invoice details before deletion
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete from Zoho if configured
    if (invoice.zoho_invoice_id && zohoInvoice.isConfigured()) {
      try {
        await zohoInvoice.deleteInvoice(invoice.zoho_invoice_id);
      } catch (zohoError) {
        console.error('Zoho deletion error:', zohoError);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'deleted',
      entity_type: 'invoice',
      entity_id: invoiceId,
      description: `Deleted invoice ${invoice.invoice_number}`,
      old_values: invoice
    }]);

    return NextResponse.json({ 
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Invoice DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}