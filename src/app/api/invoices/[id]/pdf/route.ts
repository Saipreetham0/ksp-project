import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { zohoInvoice } from '@/lib/zoho-invoice';

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

    // Get invoice details with access control
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
      .eq('id', invoiceId);

    // Apply role-based access control
    if (profile?.role === 'user' || profile?.role === 'client') {
      query = query.eq('orders.user_id', user.id);
    } else if (!['admin', 'finance'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: invoice, error: fetchError } = await query.single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let pdfBuffer: Buffer;

    // Try to get PDF from Zoho if configured
    if (invoice.zoho_invoice_id && zohoInvoice.isConfigured()) {
      try {
        pdfBuffer = await zohoInvoice.getInvoicePDF(invoice.zoho_invoice_id);
      } catch (zohoError) {
        console.error('Zoho PDF error:', zohoError);
        // Fall back to generating local PDF
        pdfBuffer = await generateLocalInvoicePDF(invoice);
      }
    } else {
      // Generate local PDF
      pdfBuffer = await generateLocalInvoicePDF(invoice);
    }

    // Log PDF download activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'downloaded',
      entity_type: 'invoice',
      entity_id: invoiceId,
      description: `Downloaded PDF for invoice ${invoice.invoice_number}`
    }]);

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Invoice PDF error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fallback PDF generation when Zoho is not available
async function generateLocalInvoicePDF(invoice: any): Promise<Buffer> {
  // This is a simplified PDF generation
  // In production, you'd use a proper PDF library like puppeteer, jsPDF, or PDFKit
  
  const order = invoice.orders;
  const customer = order?.user_profiles;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          color: #333; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 40px; 
        }
        .customer-info, .invoice-info { 
          flex: 1; 
        }
        .invoice-info { 
          text-align: right; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left; 
        }
        th { 
          background-color: #f8f9fa; 
          font-weight: bold; 
        }
        .total-row { 
          font-weight: bold; 
          background-color: #f8f9fa; 
        }
        .text-right { 
          text-align: right; 
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <h2>Your Company Name</h2>
        <p>Your Company Address | Phone | Email</p>
      </div>

      <div class="invoice-details">
        <div class="customer-info">
          <h3>Bill To:</h3>
          <p><strong>${customer?.full_name || customer?.display_name || 'Customer'}</strong></p>
          <p>${customer?.email || ''}</p>
          ${invoice.billing_address ? `
            <p>
              ${invoice.billing_address.street || ''}<br>
              ${invoice.billing_address.city || ''}, ${invoice.billing_address.state || ''}<br>
              ${invoice.billing_address.postalCode || ''}<br>
              ${invoice.billing_address.country || ''}
            </p>
          ` : ''}
        </div>
        <div class="invoice-info">
          <h3>Invoice Details:</h3>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</p>
          ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ''}
          <p><strong>Order #:</strong> ${order?.order_number || ''}</p>
          <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.line_items.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">₹${item.rate.toFixed(2)}</td>
              <td class="text-right">₹${item.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          ${invoice.discount_amount > 0 ? `
            <tr>
              <td colspan="3" class="text-right"><strong>Discount:</strong></td>
              <td class="text-right">-₹${invoice.discount_amount.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${invoice.tax_amount > 0 ? `
            <tr>
              <td colspan="3" class="text-right"><strong>Tax:</strong></td>
              <td class="text-right">₹${invoice.tax_amount.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td colspan="3" class="text-right"><strong>Total:</strong></td>
            <td class="text-right"><strong>₹${invoice.total_amount.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      ${invoice.notes ? `
        <div style="margin-top: 30px;">
          <h3>Notes:</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer-generated invoice.</p>
      </div>
    </body>
    </html>
  `;

  // For now, return a simple text-based "PDF" 
  // In production, use puppeteer or similar to generate actual PDF
  const textContent = `
INVOICE ${invoice.invoice_number}

Bill To: ${customer?.full_name || customer?.display_name || 'Customer'}
Email: ${customer?.email || ''}

Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}
Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
Order: ${order?.order_number || ''}

Items:
${invoice.line_items.map((item: any) => 
  `${item.description} - Qty: ${item.quantity} x ₹${item.rate} = ₹${item.amount}`
).join('\n')}

${invoice.discount_amount > 0 ? `Discount: -₹${invoice.discount_amount}` : ''}
${invoice.tax_amount > 0 ? `Tax: ₹${invoice.tax_amount}` : ''}
Total: ₹${invoice.total_amount}

${invoice.notes ? `Notes: ${invoice.notes}` : ''}

Thank you for your business!
`;

  // Convert to buffer
  return Buffer.from(textContent, 'utf-8');
}