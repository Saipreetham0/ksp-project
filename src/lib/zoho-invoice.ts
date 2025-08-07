// Zoho Invoice API Integration
import { Invoice, InvoiceLineItem, CreateInvoiceRequest } from '@/types/database';

interface ZohoAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  organizationId: string;
}

interface ZohoAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZohoCustomer {
  contact_id: string;
  contact_name: string;
  customer_name: string;
  email: string;
}

interface ZohoInvoiceItem {
  item_id?: string;
  name: string;
  description: string;
  rate: number;
  quantity: number;
  tax_id?: string;
}

interface ZohoInvoicePayload {
  customer_id: string;
  date: string;
  due_date?: string;
  invoice_number?: string;
  reference_number?: string;
  line_items: ZohoInvoiceItem[];
  notes?: string;
  terms?: string;
  custom_fields?: Array<{
    customfield_id: string;
    value: string;
  }>;
}

interface ZohoInvoiceResponse {
  invoice_id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  status: string;
  total: number;
  balance: number;
  invoice_url: string;
  customer_id: string;
  line_items: Array<{
    line_item_id: string;
    name: string;
    description: string;
    rate: number;
    quantity: number;
    item_total: number;
  }>;
}

class ZohoInvoiceAPI {
  private config: ZohoAuthConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      clientId: process.env.ZOHO_INVOICE_CLIENT_ID || '',
      clientSecret: process.env.ZOHO_INVOICE_CLIENT_SECRET || '',
      refreshToken: process.env.ZOHO_INVOICE_REFRESH_TOKEN || '',
      organizationId: process.env.ZOHO_ORGANIZATION_ID || ''
    };
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const data: ZohoAccessTokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry

    return this.accessToken;
  }

  private async makeZohoRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();
    const baseUrl = 'https://invoice.zoho.com/api/v3';
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'X-com-zoho-invoice-organizationid': this.config.organizationId,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Zoho API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createCustomer(customerData: {
    name: string;
    email: string;
    phone?: string;
    billing_address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  }): Promise<ZohoCustomer> {
    const payload = {
      contact_name: customerData.name,
      customer_name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      billing_address: customerData.billing_address
    };

    const response = await this.makeZohoRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return response.contact;
  }

  async findOrCreateCustomer(email: string, name: string): Promise<string> {
    try {
      // Try to find existing customer
      const response = await this.makeZohoRequest(`/contacts?email=${encodeURIComponent(email)}`);
      
      if (response.contacts && response.contacts.length > 0) {
        return response.contacts[0].contact_id;
      }

      // Create new customer if not found
      const customer = await this.createCustomer({ name, email });
      return customer.contact_id;
    } catch (error) {
      console.error('Error finding/creating customer:', error);
      throw error;
    }
  }

  async createInvoice(invoiceData: CreateInvoiceRequest & {
    customer_email: string;
    customer_name: string;
  }): Promise<ZohoInvoiceResponse> {
    try {
      // Find or create customer
      const customerId = await this.findOrCreateCustomer(
        invoiceData.customer_email, 
        invoiceData.customer_name
      );

      // Prepare line items
      const lineItems: ZohoInvoiceItem[] = invoiceData.line_items.map(item => ({
        name: item.description,
        description: item.description,
        rate: item.rate,
        quantity: item.quantity
      }));

      const payload: ZohoInvoicePayload = {
        customer_id: customerId,
        date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoiceData.due_date,
        line_items: lineItems,
        notes: invoiceData.notes
      };

      const response = await this.makeZohoRequest('/invoices', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return response.invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getInvoice(invoiceId: string): Promise<ZohoInvoiceResponse> {
    const response = await this.makeZohoRequest(`/invoices/${invoiceId}`);
    return response.invoice;
  }

  async updateInvoice(invoiceId: string, updateData: Partial<ZohoInvoicePayload>): Promise<ZohoInvoiceResponse> {
    const response = await this.makeZohoRequest(`/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    return response.invoice;
  }

  async sendInvoice(invoiceId: string, emailData: {
    to_mail_ids: string[];
    cc_mail_ids?: string[];
    subject?: string;
    body?: string;
  }): Promise<boolean> {
    try {
      await this.makeZohoRequest(`/invoices/${invoiceId}/email`, {
        method: 'POST',
        body: JSON.stringify(emailData)
      });
      return true;
    } catch (error) {
      console.error('Error sending invoice:', error);
      return false;
    }
  }

  async getInvoicePDF(invoiceId: string): Promise<Buffer> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://invoice.zoho.com/api/v3/invoices/${invoiceId}?accept=pdf`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'X-com-zoho-invoice-organizationid': this.config.organizationId
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get PDF: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async deleteInvoice(invoiceId: string): Promise<boolean> {
    try {
      await this.makeZohoRequest(`/invoices/${invoiceId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  async markInvoiceAsPaid(invoiceId: string, paymentData: {
    date: string;
    amount: number;
    payment_mode: string;
    reference_number?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      await this.makeZohoRequest(`/invoices/${invoiceId}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
      return true;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      return false;
    }
  }

  async getInvoicePayments(invoiceId: string): Promise<any[]> {
    try {
      const response = await this.makeZohoRequest(`/invoices/${invoiceId}/payments`);
      return response.payments || [];
    } catch (error) {
      console.error('Error fetching invoice payments:', error);
      return [];
    }
  }

  // Utility methods
  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.refreshToken &&
      this.config.organizationId
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeZohoRequest('/organizations');
      return true;
    } catch (error) {
      console.error('Zoho connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const zohoInvoice = new ZohoInvoiceAPI();

// Helper functions for invoice status mapping
export const mapZohoStatusToLocal = (zohoStatus: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'draft',
    'sent': 'sent',
    'viewed': 'sent',
    'expired': 'overdue',
    'accepted': 'sent',
    'declined': 'cancelled',
    'paid': 'paid',
    'partially_paid': 'sent',
    'overdue': 'overdue',
    'void': 'cancelled'
  };

  return statusMap[zohoStatus.toLowerCase()] || 'draft';
};

export const formatCurrencyForZoho = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};