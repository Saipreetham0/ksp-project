"use client";

import { formatCurrency } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Download,
  Copy,
  Trash2,
  FileText,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
  ExternalLink,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "@/hooks/use-toast";

// Types based on PRD and database schema
interface Invoice {
  id: number;
  invoice_number: string;
  title: string;
  description: string;
  order_id: number;
  order_title?: string;
  user_id: string;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  zoho_invoice_id?: string;
  zoho_status?: string;
  zoho_permalink?: string;
  status: 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'void';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  currency: string;
  invoice_date: string;
  due_date: string;
  payment_date?: string;
  payment_terms: string;
  line_items: any[];
  created_at: string;
  updated_at: string;
  sent_at?: string;
  paid_at?: string;
  days_overdue?: number;
  payment_status_label?: string;
}

interface InvoiceFilters {
  status: string;
  client: string;
  date_range: string;
  amount_range: string;
}

// Invoice status configurations
const INVOICE_STATUSES = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
    icon: FileText,
    description: 'Invoice is being prepared'
  },
  sent: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-700',
    icon: Mail,
    description: 'Invoice has been sent to client'
  },
  viewed: {
    label: 'Viewed',
    color: 'bg-purple-100 text-purple-700',
    icon: Eye,
    description: 'Client has viewed the invoice'
  },
  partially_paid: {
    label: 'Partially Paid',
    color: 'bg-yellow-100 text-yellow-700',
    icon: DollarSign,
    description: 'Partial payment received'
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    description: 'Full payment received'
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
    description: 'Payment is overdue'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600',
    icon: Trash2,
    description: 'Invoice has been cancelled'
  },
  void: {
    label: 'Void',
    color: 'bg-gray-100 text-gray-600',
    icon: Trash2,
    description: 'Invoice has been voided'
  },
};

export function InvoiceManagement() {
  const router = useRouter();
  const { user, session, supabase } = useAuthSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<InvoiceFilters>({
    status: 'all',
    client: 'all',
    date_range: 'all',
    amount_range: 'all',
  });

  // Create new invoice state
  const [newInvoiceData, setNewInvoiceData] = useState({
    order_id: '',
    title: '',
    description: '',
    due_date: '',
    payment_terms: 'Net 30',
    line_items: [
      {
        name: '',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      }
    ],
    tax_rate: 18,
    discount_amount: 0,
    notes: '',
  });

  // Fetch invoices from database
  const fetchInvoices = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Check user role to determine query scope
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('invoice_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userProfile?.role === 'client') {
        query = query.eq('user_id', user.id);
      }
      // Admin and finance can see all invoices
      // Team members can see invoices for their assigned orders

      const { data, error } = await query;

      if (error) throw error;

      setInvoices(data || []);
      setFilteredInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error loading invoices",
        description: error.message || "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInvoices();
    }
  }, [user?.id]);

  // Apply filters and search
  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.order_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, filters]);

  // Create invoice
  const handleCreateInvoice = async () => {
    try {
      setActionLoading('create');

      if (!newInvoiceData.order_id || !newInvoiceData.title) {
        toast({
          title: "Validation Error",
          description: "Please fill in required fields",
          variant: "destructive",
        });
        return;
      }

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        return;
      }

      // Calculate totals
      const subtotal = newInvoiceData.line_items.reduce((sum, item) => sum + item.amount, 0);
      const tax_amount = (subtotal * newInvoiceData.tax_rate) / 100;
      const total_amount = subtotal + tax_amount - newInvoiceData.discount_amount;

      const invoiceData = {
        order_id: parseInt(newInvoiceData.order_id),
        user_id: user.id, // This should be the actual user ID from the order
        created_by: user.id,
        title: newInvoiceData.title,
        description: newInvoiceData.description,
        subtotal,
        tax_rate: newInvoiceData.tax_rate,
        tax_amount,
        discount_amount: newInvoiceData.discount_amount,
        total_amount,
        balance_due: total_amount,
        currency: 'INR',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: newInvoiceData.due_date,
        payment_terms: newInvoiceData.payment_terms,
        line_items: JSON.stringify(newInvoiceData.line_items),
        status: 'draft',
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invoice created successfully! 📄",
        description: `Invoice ${data.invoice_number} has been created`,
      });

      setShowCreateInvoice(false);
      fetchInvoices();

      // Reset form
      setNewInvoiceData({
        order_id: '',
        title: '',
        description: '',
        due_date: '',
        payment_terms: 'Net 30',
        line_items: [{ name: '', description: '', quantity: 1, rate: 0, amount: 0 }],
        tax_rate: 18,
        discount_amount: 0,
        notes: '',
      });

    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Send invoice via Zoho
  const handleSendInvoice = async (invoiceId: number) => {
    try {
      setActionLoading(`send-${invoiceId}`);

      const response = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      const result = await response.json();

      toast({
        title: "Invoice sent successfully! 📧",
        description: "The invoice has been sent to the client via email",
      });

      // Update invoice status in local state
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: 'sent' as any, sent_at: new Date().toISOString() }
          : inv
      ));

    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error sending invoice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Download invoice PDF
  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      setActionLoading(`download-${invoiceId}`);

      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoices.find(i => i.id === invoiceId)?.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF downloaded successfully! 📄",
        description: "Invoice PDF has been downloaded",
      });

    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error downloading PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Update line item
  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newInvoiceData.line_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setNewInvoiceData({ ...newInvoiceData, line_items: updatedItems });
  };

  // Add line item
  const addLineItem = () => {
    setNewInvoiceData({
      ...newInvoiceData,
      line_items: [
        ...newInvoiceData.line_items,
        { name: '', description: '', quantity: 1, rate: 0, amount: 0 }
      ]
    });
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    if (newInvoiceData.line_items.length > 1) {
      const updatedItems = newInvoiceData.line_items.filter((_, i) => i !== index);
      setNewInvoiceData({ ...newInvoiceData, line_items: updatedItems });
    }
  };

  // Invoice Statistics
  const invoiceStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    paidAmount: invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0),
    outstandingAmount: invoices.reduce((sum, i) => sum + (i.balance_due || 0), 0),
  };

  if (!session || !user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Statistics */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600 mt-1">Generate, send, and track invoices with Zoho integration</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={fetchInvoices}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowCreateInvoice(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{invoiceStats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoiceStats.totalAmount)}</p>
                    <p className="text-xs text-green-600">{formatCurrency(invoiceStats.paidAmount)} collected</p>
                  </div>
                  <IndianRupee className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(invoiceStats.outstandingAmount)}</p>
                    <p className="text-xs text-gray-500">{invoiceStats.overdue} overdue</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Invoices</p>
                    <p className="text-2xl font-bold text-green-600">{invoiceStats.paid}</p>
                    <p className="text-xs text-gray-500">{invoiceStats.sent} sent</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(INVOICE_STATUSES).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Invoices ({filteredInvoices.length})</span>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'Create your first invoice to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateInvoice(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredInvoices.map((invoice) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.invoice_number}</div>
                            <div className="text-sm text-gray-600 truncate max-w-[150px]">
                              {invoice.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{invoice.client_name?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{invoice.client_name}</div>
                              <div className="text-xs text-gray-500">{invoice.client_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">#{invoice.order_id}</div>
                            <div className="text-gray-600 truncate max-w-[120px]">{invoice.order_title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={INVOICE_STATUSES[invoice.status].color}>
                            {INVOICE_STATUSES[invoice.status].label}
                          </Badge>
                          {invoice.days_overdue && invoice.days_overdue > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {invoice.days_overdue} days overdue
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>
                            {invoice.paid_amount > 0 && (
                              <div className="text-xs text-green-600">
                                {formatCurrency(invoice.paid_amount)} paid
                              </div>
                            )}
                            {invoice.balance_due > 0 && (
                              <div className="text-xs text-red-600">
                                {formatCurrency(invoice.balance_due)} due
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceDetails(true);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)} disabled={actionLoading === `download-${invoice.id}`}>
                                <Download className="w-4 h-4 mr-2" />
                                {actionLoading === `download-${invoice.id}` ? 'Downloading...' : 'Download PDF'}
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)} disabled={actionLoading === `send-${invoice.id}`}>
                                  <Send className="w-4 h-4 mr-2" />
                                  {actionLoading === `send-${invoice.id}` ? 'Sending...' : 'Send Invoice'}
                                </DropdownMenuItem>
                              )}
                              {invoice.zoho_permalink && (
                                <DropdownMenuItem onClick={() => window.open(invoice.zoho_permalink, '_blank')}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View in Zoho
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Generate a professional invoice for your order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_id">Order ID *</Label>
                <Input
                  id="order_id"
                  placeholder="Enter order ID"
                  value={newInvoiceData.order_id}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, order_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newInvoiceData.due_date}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Invoice Title *</Label>
              <Input
                id="title"
                placeholder="Enter invoice title"
                value={newInvoiceData.title}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter invoice description"
                value={newInvoiceData.description}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, description: e.target.value })}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              {newInvoiceData.line_items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-6 gap-4 items-end">
                    <div className="col-span-2 space-y-2">
                      <Label>Item Name</Label>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={newInvoiceData.line_items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Tax and Discount */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newInvoiceData.tax_rate}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, tax_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_amount">Discount Amount</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newInvoiceData.discount_amount}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, discount_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Select value={newInvoiceData.payment_terms} onValueChange={(value) => setNewInvoiceData({ ...newInvoiceData, payment_terms: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoice} 
              disabled={actionLoading === 'create'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading === 'create' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice Details - {selectedInvoice?.invoice_number}</span>
              <Badge className={selectedInvoice ? INVOICE_STATUSES[selectedInvoice.status].color : ''}>
                {selectedInvoice ? INVOICE_STATUSES[selectedInvoice.status].label : ''}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Complete invoice information and payment tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Invoice Title</label>
                      <p className="text-sm">{selectedInvoice.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-600">{selectedInvoice.description || 'No description'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Client</label>
                      <p className="text-sm">{selectedInvoice.client_name} ({selectedInvoice.client_email})</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Invoice Date</label>
                      <p className="text-sm">{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Due Date</label>
                      <p className="text-sm">
                        {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Payment Terms</label>
                      <p className="text-sm">{selectedInvoice.payment_terms}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Financial Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Subtotal</label>
                      <p className="text-lg font-bold">{formatCurrency(selectedInvoice.subtotal)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tax ({selectedInvoice.tax_rate}%)</label>
                      <p className="text-lg font-bold">{formatCurrency(selectedInvoice.tax_amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedInvoice.total_amount)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Paid Amount</label>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(selectedInvoice.paid_amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Balance Due</label>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(selectedInvoice.balance_due)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="space-y-4">
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment History</h3>
                  <p className="text-gray-600">Payment tracking will be implemented with Zoho Payments integration</p>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice History</h3>
                  <p className="text-gray-600">Activity tracking will show all invoice events and changes</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InvoiceManagement;