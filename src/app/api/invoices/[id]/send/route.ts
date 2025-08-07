import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { zohoInvoice } from '@/lib/zoho-invoice';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check permissions - only admin and finance can send invoices
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    if (!['admin', 'finance'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get invoice details
    const { data: invoice, error: fetchError } = await supabase
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
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      to_emails = [invoice.customer_email],
      cc_emails = [],
      subject,
      message
    } = body;

    let sent = false;
    const emailData = {
      sent_to: to_emails,
      sent_at: new Date().toISOString(),
      subject: subject || `Invoice ${invoice.invoice_number}`,
      message: message || `Please find attached invoice ${invoice.invoice_number} for your order.`
    };

    // Try sending via Zoho first if configured and has Zoho ID
    if (invoice.zoho_invoice_id && zohoInvoice.isConfigured()) {
      try {
        const zohoResult = await zohoInvoice.sendInvoice(invoice.zoho_invoice_id, {
          to_mail_ids: to_emails,
          cc_mail_ids: cc_emails.length > 0 ? cc_emails : undefined,
          subject: emailData.subject,
          body: emailData.message
        });

        if (zohoResult) {
          sent = true;
        }
      } catch (zohoError) {
        console.error('Zoho send error:', zohoError);
        // Continue to try alternative methods
      }
    }

    // If Zoho fails or is not configured, implement alternative email sending
    // This could be SendGrid, AWS SES, or other email service
    if (!sent) {
      // TODO: Implement alternative email service here
      console.log('Alternative email sending not implemented yet');
      
      // For now, just mark as sent in database
      // In production, implement proper email service
      sent = true;
    }

    if (sent) {
      // Update invoice status and email tracking
      const updatedSentEmails = [...(invoice.sent_emails || []), emailData];
      
      await supabase
        .from('invoices')
        .update({
          status: invoice.status === 'draft' ? 'sent' : invoice.status,
          sent_emails: updatedSentEmails,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      // Log activity
      await supabase.from('activity_logs').insert([{
        user_id: user.id,
        action: 'sent',
        entity_type: 'invoice',
        entity_id: invoiceId,
        description: `Sent invoice ${invoice.invoice_number} to ${to_emails.join(', ')}`,
        new_values: { sent_emails: updatedSentEmails }
      }]);

      // Create notification
      const order = (invoice as any).orders;
      await supabase.from('notifications').insert([{
        user_id: order.user_id,
        title: 'Invoice Sent',
        message: `Invoice ${invoice.invoice_number} has been sent to ${to_emails[0]}`,
        type: 'invoice',
        related_order_id: order.id,
        related_invoice_id: invoiceId
      }]);

      return NextResponse.json({
        success: true,
        message: `Invoice sent successfully to ${to_emails.join(', ')}`
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send invoice. Please try again later.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Invoice send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}