import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import ZohoInvoiceAPI, { formatOrderForZohoInvoice } from '@/lib/zoho-invoice';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get invoice details with order and client information
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        orders (
          title,
          description,
          user_id,
          due_date
        ),
        user_profiles!invoices_user_id_fkey (
          full_name,
          email,
          company
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Initialize Zoho API
    const zohoAPI = new ZohoInvoiceAPI();

    try {
      // Check if customer exists in Zoho, create if not
      let zohoCustomer = await zohoAPI.getCustomerByEmail(invoice.user_profiles.email);
      
      if (!zohoCustomer) {
        zohoCustomer = await zohoAPI.createCustomer({
          name: invoice.user_profiles.full_name || invoice.user_profiles.email,
          email: invoice.user_profiles.email,
        });
      }

      // Prepare line items
      const lineItems = JSON.parse(invoice.line_items || '[]').map((item: any) => ({
        name: item.name,
        description: item.description || '',
        rate: item.rate,
        quantity: item.quantity,
      }));

      // Create invoice in Zoho if not already created
      let zohoInvoice;
      if (!invoice.zoho_invoice_id) {
        const invoiceData = formatOrderForZohoInvoice(
          invoice.orders,
          zohoCustomer,
          lineItems
        );

        zohoInvoice = await zohoAPI.createInvoice(invoiceData);

        // Update local invoice with Zoho details
        await supabase
          .from('invoices')
          .update({
            zoho_invoice_id: zohoInvoice.invoice_id,
            zoho_status: zohoInvoice.status,
            zoho_permalink: zohoInvoice.permalink,
          })
          .eq('id', invoiceId);
      } else {
        zohoInvoice = await zohoAPI.getInvoice(invoice.zoho_invoice_id);
      }

      // Send the invoice
      const sendResult = await zohoAPI.sendInvoice(zohoInvoice.invoice_id, {
        to_mail_ids: [invoice.user_profiles.email],
        subject: `Invoice ${invoice.invoice_number} from ${process.env.COMPANY_NAME || 'KSP Electronics'}`,
        body: `Dear ${invoice.user_profiles.full_name},\n\nPlease find attached your invoice for ${invoice.title}.\n\nThank you for your business!`,
      });

      // Update local invoice status
      await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          zoho_status: 'sent',
        })
        .eq('id', invoiceId);

      // Create activity log
      await supabase
        .from('activity_logs')
        .insert({
          user_id: invoice.created_by,
          action: 'sent',
          entity_type: 'invoice',
          entity_id: invoiceId,
          description: `Invoice ${invoice.invoice_number} sent to ${invoice.user_profiles.email}`,
          new_values: { status: 'sent', sent_at: new Date().toISOString() },
        });

      // Create notification for client
      await supabase.rpc('create_notification', {
        p_user_id: invoice.user_id,
        p_title: 'Invoice Sent',
        p_message: `Invoice ${invoice.invoice_number} has been sent to your email`,
        p_type: 'invoice_sent',
        p_invoice_id: invoiceId,
        p_action_url: `/invoices/${invoiceId}`,
        p_action_label: 'View Invoice'
      });

      return NextResponse.json({
        success: true,
        message: 'Invoice sent successfully',
        zoho_invoice_id: zohoInvoice.invoice_id,
      });

    } catch (zohoError: any) {
      console.error('Zoho API error:', zohoError);
      
      // If Zoho integration fails, still mark as sent locally for fallback
      await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      return NextResponse.json({
        success: false,
        error: 'Failed to send via Zoho, but marked as sent locally',
        details: zohoError.message,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error sending invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}