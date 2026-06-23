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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "@/hooks/use-toast";

// Types based on PRD and database schema
interface Payment {
  id: number;
  payment_id: string;
  order_id?: number;
  invoice_id?: number;
  order_title?: string;
  invoice_number?: string;
  user_id: string;
  client_name?: string;
  client_email?: string;
  recorded_by: string;
  recorded_by_name?: string;
  amount: number;
  currency: string;
  payment_type: 'advance' | 'partial' | 'full' | 'refund' | 'adjustment';
  payment_method: 'card' | 'upi' | 'netbanking' | 'wallet' | 'bank_transfer' | 'cash' | 'cheque' | 'other';
  gateway?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'disputed';
  transaction_reference?: string;
  payment_date: string;
  processed_at?: string;
  description?: string;
  internal_notes?: string;
  receipt_number?: string;
  days_overdue?: number;
  zoho_payment_id?: string;
  zoho_transaction_id?: string;
  gateway_response?: any;
  created_at: string;
  updated_at: string;
}

interface PaymentFilters {
  status: string;
  payment_method: string;
  payment_type: string;
  client: string;
  date_range: string;
}

// Payment configurations
const PAYMENT_STATUSES = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    description: 'Payment is pending processing'
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-700',
    icon: RefreshCw,
    description: 'Payment is being processed'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    description: 'Payment completed successfully'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    description: 'Payment failed to process'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600',
    icon: XCircle,
    description: 'Payment was cancelled'
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-purple-100 text-purple-700',
    icon: ArrowDownRight,
    description: 'Payment has been refunded'
  },
  disputed: {
    label: 'Disputed',
    color: 'bg-orange-100 text-orange-700',
    icon: AlertTriangle,
    description: 'Payment is under dispute'
  },
};

const PAYMENT_METHODS = {
  card: { label: 'Card Payment', icon: CreditCard, color: 'text-blue-600' },
  upi: { label: 'UPI', icon: Smartphone, color: 'text-green-600' },
  netbanking: { label: 'Net Banking', icon: Building, color: 'text-purple-600' },
  wallet: { label: 'Digital Wallet', icon: Smartphone, color: 'text-orange-600' },
  bank_transfer: { label: 'Bank Transfer', icon: Building, color: 'text-gray-600' },
  cash: { label: 'Cash', icon: Banknote, color: 'text-green-700' },
  cheque: { label: 'Cheque', icon: Banknote, color: 'text-blue-700' },
  other: { label: 'Other', icon: DollarSign, color: 'text-gray-600' },
};

const PAYMENT_TYPES = {
  advance: { label: 'Advance', color: 'bg-blue-100 text-blue-700' },
  partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700' },
  full: { label: 'Full Payment', color: 'bg-green-100 text-green-700' },
  refund: { label: 'Refund', color: 'bg-red-100 text-red-700' },
  adjustment: { label: 'Adjustment', color: 'bg-purple-100 text-purple-700' },
};

export function PaymentManagement() {
  const router = useRouter();
  const { user, session, supabase } = useAuthSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    payment_method: 'all',
    payment_type: 'all',
    client: 'all',
    date_range: 'all',
  });

  // Record payment state
  const [newPaymentData, setNewPaymentData] = useState({
    order_id: '',
    invoice_id: '',
    amount: '',
    payment_method: 'card',
    payment_type: 'full',
    transaction_reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    internal_notes: '',
  });

  // Fetch payments from database
  const fetchPayments = async () => {
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
        .from('payments')
        .select(`
          *,
          orders (
            title,
            order_number
          ),
          invoices (
            invoice_number,
            title
          ),
          client:user_profiles!payments_user_id_fkey (
            full_name,
            email,
            company
          ),
          recorder:user_profiles!payments_recorded_by_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userProfile?.role === 'client') {
        query = query.eq('user_id', user.id);
      }
      // Admin and finance can see all payments

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      const transformedPayments = data?.map(payment => ({
        ...payment,
        order_title: payment.orders?.title,
        invoice_number: payment.invoices?.invoice_number,
        client_name: payment.client?.full_name,
        client_email: payment.client?.email,
        recorded_by_name: payment.recorder?.full_name,
      })) || [];

      setPayments(transformedPayments);
      setFilteredPayments(transformedPayments);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error loading payments",
        description: error.message || "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [user?.id]);

  // Apply filters and search
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Payment method filter
    if (filters.payment_method !== 'all') {
      filtered = filtered.filter(payment => payment.payment_method === filters.payment_method);
    }

    // Payment type filter
    if (filters.payment_type !== 'all') {
      filtered = filtered.filter(payment => payment.payment_type === filters.payment_type);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, filters]);

  // Record new payment
  const handleRecordPayment = async () => {
    try {
      setActionLoading('record');

      if (!newPaymentData.amount || (!newPaymentData.order_id && !newPaymentData.invoice_id)) {
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

      const paymentData = {
        order_id: newPaymentData.order_id ? parseInt(newPaymentData.order_id) : null,
        invoice_id: newPaymentData.invoice_id ? parseInt(newPaymentData.invoice_id) : null,
        user_id: user.id, // This should be the actual user ID
        recorded_by: user.id,
        amount: parseFloat(newPaymentData.amount),
        currency: 'INR',
        payment_method: newPaymentData.payment_method,
        payment_type: newPaymentData.payment_type,
        transaction_reference: newPaymentData.transaction_reference,
        payment_date: newPaymentData.payment_date,
        description: newPaymentData.description,
        internal_notes: newPaymentData.internal_notes,
        status: 'completed', // For manual entries, mark as completed
        processed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Payment recorded successfully! 💰",
        description: `Payment of ₹${parseFloat(newPaymentData.amount).toLocaleString()} has been recorded`,
      });

      setShowRecordPayment(false);
      fetchPayments();

      // Reset form
      setNewPaymentData({
        order_id: '',
        invoice_id: '',
        amount: '',
        payment_method: 'card',
        payment_type: 'full',
        transaction_reference: '',
        payment_date: new Date().toISOString().split('T')[0],
        description: '',
        internal_notes: '',
      });

      // If payment is linked to an invoice, update invoice status
      if (newPaymentData.invoice_id) {
        await supabase.rpc('update_invoice_payment_status', {
          p_invoice_id: parseInt(newPaymentData.invoice_id)
        });
      }

    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error recording payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Payment Statistics
  const paymentStats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
    thisMonth: payments.filter(p => {
      const paymentDate = new Date(p.payment_date);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0),
    advances: payments.filter(p => p.payment_type === 'advance' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    refunds: payments.filter(p => p.payment_type === 'refund' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
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
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Track payments and manage financial transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={fetchPayments}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowRecordPayment(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
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
                    <p className="text-sm text-gray-600">Total Received</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentStats.totalAmount)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">{formatCurrency(paymentStats.thisMonth)} this month</span>
                    </div>
                  </div>
                  <IndianRupee className="w-8 h-8 text-green-500" />
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
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{paymentStats.completed}</p>
                    <p className="text-xs text-gray-500">{paymentStats.total} total payments</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
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
                    <p className="text-sm text-gray-600">Advances</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(paymentStats.advances)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600">Advance payments</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-8 h-8 text-blue-500" />
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
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</p>
                    <p className="text-xs text-red-600">{paymentStats.failed} failed</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
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
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(PAYMENT_STATUSES).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.payment_method} onValueChange={(value) => setFilters(prev => ({ ...prev, payment_method: value }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {Object.entries(PAYMENT_METHODS).map(([method, config]) => (
                    <SelectItem key={method} value={method}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.payment_type} onValueChange={(value) => setFilters(prev => ({ ...prev, payment_type: value }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(PAYMENT_TYPES).map(([type, config]) => (
                    <SelectItem key={type} value={type}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payments ({filteredPayments.length})</span>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'Record your first payment to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowRecordPayment(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Order/Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredPayments.map((payment) => {
                      const methodConfig = PAYMENT_METHODS[payment.payment_method as keyof typeof PAYMENT_METHODS];
                      const statusConfig = PAYMENT_STATUSES[payment.status];
                      const typeConfig = PAYMENT_TYPES[payment.payment_type as keyof typeof PAYMENT_TYPES];
                      const MethodIcon = methodConfig?.icon || DollarSign;
                      
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.payment_id}</div>
                              {payment.transaction_reference && (
                                <div className="text-sm text-gray-600">
                                  Ref: {payment.transaction_reference}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{payment.client_name?.charAt(0) || 'C'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{payment.client_name}</div>
                                <div className="text-xs text-gray-500">{payment.client_email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {payment.order_id && (
                                <div>
                                  <span className="font-medium">Order #{payment.order_id}</span>
                                  <div className="text-gray-600 truncate max-w-[120px]">{payment.order_title}</div>
                                </div>
                              )}
                              {payment.invoice_id && (
                                <div>
                                  <span className="font-medium">{payment.invoice_number}</span>
                                  <div className="text-gray-600">Invoice #{payment.invoice_id}</div>
                                </div>
                              )}
                              {!payment.order_id && !payment.invoice_id && (
                                <span className="text-gray-500">Direct payment</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-lg">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-xs text-gray-500">{payment.currency}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MethodIcon className={`w-4 h-4 ${methodConfig?.color}`} />
                              <span className="text-sm">{methodConfig?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={typeConfig?.color}>
                              {typeConfig?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </div>
                            {payment.processed_at && (
                              <div className="text-xs text-gray-500">
                                Processed: {new Date(payment.processed_at).toLocaleTimeString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowPaymentDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordPayment} onOpenChange={setShowRecordPayment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
            <DialogDescription>
              Record a payment received from client
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_id">Order ID</Label>
                <Input
                  id="order_id"
                  placeholder="Enter order ID"
                  value={newPaymentData.order_id}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, order_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_id">Invoice ID</Label>
                <Input
                  id="invoice_id"
                  placeholder="Enter invoice ID"
                  value={newPaymentData.invoice_id}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, invoice_id: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={newPaymentData.amount}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={newPaymentData.payment_date}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, payment_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={newPaymentData.payment_method} onValueChange={(value) => setNewPaymentData({ ...newPaymentData, payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHODS).map(([method, config]) => (
                      <SelectItem key={method} value={method}>
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select value={newPaymentData.payment_type} onValueChange={(value) => setNewPaymentData({ ...newPaymentData, payment_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_TYPES).map(([type, config]) => (
                      <SelectItem key={type} value={type}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_reference">Transaction Reference</Label>
              <Input
                id="transaction_reference"
                placeholder="Enter transaction ID or reference"
                value={newPaymentData.transaction_reference}
                onChange={(e) => setNewPaymentData({ ...newPaymentData, transaction_reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter payment description"
                value={newPaymentData.description}
                onChange={(e) => setNewPaymentData({ ...newPaymentData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                placeholder="Internal notes (not visible to client)"
                value={newPaymentData.internal_notes}
                onChange={(e) => setNewPaymentData({ ...newPaymentData, internal_notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordPayment(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPayment} 
              disabled={actionLoading === 'record'}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading === 'record' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Details - {selectedPayment?.payment_id}</span>
              <Badge className={selectedPayment ? PAYMENT_STATUSES[selectedPayment.status].color : ''}>
                {selectedPayment ? PAYMENT_STATUSES[selectedPayment.status].label : ''}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Complete payment information and transaction details
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const methodConfig = PAYMENT_METHODS[selectedPayment.payment_method as keyof typeof PAYMENT_METHODS];
                        const Icon = methodConfig?.icon || DollarSign;
                        return (
                          <>
                            <Icon className="w-4 h-4" />
                            <span>{methodConfig?.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Type</label>
                    <Badge className={PAYMENT_TYPES[selectedPayment.payment_type as keyof typeof PAYMENT_TYPES]?.color}>
                      {PAYMENT_TYPES[selectedPayment.payment_type as keyof typeof PAYMENT_TYPES]?.label}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Client</label>
                    <p className="text-sm">{selectedPayment.client_name}</p>
                    <p className="text-xs text-gray-500">{selectedPayment.client_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Date</label>
                    <p className="text-sm">{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
                  </div>
                  {selectedPayment.processed_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Processed At</label>
                      <p className="text-sm">{new Date(selectedPayment.processed_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.transaction_reference && (
                <div className="bg-gray-50 p-3 rounded">
                  <label className="text-sm font-medium text-gray-700">Transaction Reference</label>
                  <p className="font-mono text-sm">{selectedPayment.transaction_reference}</p>
                </div>
              )}

              {selectedPayment.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600">{selectedPayment.description}</p>
                </div>
              )}

              {selectedPayment.internal_notes && (
                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <label className="text-sm font-medium text-gray-700">Internal Notes</label>
                  <p className="text-sm text-gray-600">{selectedPayment.internal_notes}</p>
                </div>
              )}

              {selectedPayment.recorded_by_name && (
                <div className="text-sm text-gray-500 pt-2 border-t">
                  Recorded by {selectedPayment.recorded_by_name} on {new Date(selectedPayment.created_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaymentManagement;