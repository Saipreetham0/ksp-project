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
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Users,
  DollarSign,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Target,
  Zap,
  IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "@/hooks/use-toast";
import { getDetailedOrders, updateOrderStatus } from "@/features/orders/services/orders.service";

// Types based on PRD requirements
interface Order {
  id: number;
  order_number: string;
  title: string;
  description: string;
  status: 'draft' | 'processing' | 'shipped' | 'delivered' | 'completed';
  payment_status: 'pending' | 'advance_paid' | 'partially_paid' | 'fully_paid' | 'overdue' | 'refunded';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user_id: string;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  primary_assignee?: string;
  assignee_name?: string;
  assigned_team_members?: string[];
  order_value: number;
  currency: string;
  progress_percentage: number;
  timeline_days: number;
  due_date: string;
  order_date: string;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
  total_invoiced?: number;
  total_paid?: number;
  category?: string;
  project_type?: string;
  technology_stack?: string[];
}

interface FilterOptions {
  status: string;
  payment_status: string;
  priority: string;
  assignee: string;
  client: string;
  date_range: string;
}

// Status configurations based on PRD
const ORDER_STATUSES = {
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-700', 
    icon: FileText,
    description: 'Order is being prepared' 
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-700', 
    icon: Clock,
    description: 'Work is in progress' 
  },
  shipped: { 
    label: 'Shipped', 
    color: 'bg-yellow-100 text-yellow-700', 
    icon: Truck,
    description: 'Order has been shipped' 
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-orange-100 text-orange-700', 
    icon: Package,
    description: 'Order has been delivered' 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-700', 
    icon: CheckCircle,
    description: 'Order completed successfully' 
  },
};

const PAYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  advance_paid: { label: 'Advance Paid', color: 'bg-blue-100 text-blue-700' },
  partially_paid: { label: 'Partially Paid', color: 'bg-yellow-100 text-yellow-700' },
  fully_paid: { label: 'Fully Paid', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700' },
};

const PRIORITY_CONFIGS = {
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100' },
  medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-100' },
};

export function OrdersManagement() {
  const router = useRouter();
  const { user, session, supabase } = useAuthSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    payment_status: 'all',
    priority: 'all',
    assignee: 'all',
    client: 'all',
    date_range: 'all',
  });

  // Fetch orders from database
  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Query based on user role
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const { data, error } = await getDetailedOrders(
        supabase,
        userProfile?.role,
        user.id
      );

      if (error) throw error;

      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: error.message || "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  // Apply filters and search
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client_company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Payment status filter
    if (filters.payment_status !== 'all') {
      filtered = filtered.filter(order => order.payment_status === filters.payment_status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(order => order.priority === filters.priority);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, filters]);

  // Handle status update
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await updateOrderStatus(supabase, orderId, newStatus);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}`,
      });

      // Create notification for client
      await supabase.rpc('create_notification', {
        p_user_id: orders.find(o => o.id === orderId)?.user_id,
        p_title: 'Order Status Updated',
        p_message: `Your order #${orders.find(o => o.id === orderId)?.order_number} status has been updated to ${newStatus}`,
        p_type: 'order_updated',
        p_order_id: orderId
      });

    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Order Statistics
  const orderStats = {
    total: orders.length,
    draft: orders.filter(o => o.status === 'draft').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalValue: orders.reduce((sum, o) => sum + (o.order_value || 0), 0),
    paidAmount: orders.reduce((sum, o) => sum + (o.total_paid || 0), 0),
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
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">Manage all project orders and track progress</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            >
              {viewMode === 'table' ? <BarChart3 className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </Button>
            <Button 
              onClick={() => router.push('/orders/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {Object.entries(ORDER_STATUSES).map(([status, config], index) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{config.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orderStats[status as keyof typeof orderStats] || 0}
                      </p>
                    </div>
                    <config.icon className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(orderStats.totalValue)}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatCurrency(orderStats.paidAmount)} received
                    </p>
                  </div>
                  <IndianRupee className="w-8 h-8 text-green-500" />
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
                  placeholder="Search orders..."
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
                  {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.payment_status} onValueChange={(value) => setFilters(prev => ({ ...prev, payment_status: value }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  {Object.entries(PAYMENT_STATUSES).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {Object.entries(PRIORITY_CONFIGS).map(([priority, config]) => (
                    <SelectItem key={priority} value={priority}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders ({filteredOrders.length})</span>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'Create your first order to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/orders/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.order_number}</div>
                            <div className="text-sm text-gray-600 truncate max-w-[200px]">
                              {order.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{order.client_name?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{order.client_name}</div>
                              <div className="text-xs text-gray-500">{order.client_company}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={ORDER_STATUSES[order.status].color}>
                            {ORDER_STATUSES[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={PAYMENT_STATUSES[order.payment_status].color}>
                            {PAYMENT_STATUSES[order.payment_status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${PRIORITY_CONFIGS[order.priority].bg} ${PRIORITY_CONFIGS[order.priority].color}`}>
                            {PRIORITY_CONFIGS[order.priority].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{order.progress_percentage}%</span>
                              <span className="text-gray-500">
                                {order.completed_tasks || 0}/{order.total_tasks || 0}
                              </span>
                            </div>
                            <Progress value={order.progress_percentage} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(order.order_value)}</div>
                            <div className="text-xs text-green-600">
                              {formatCurrency(order.total_paid)} paid
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.due_date ? new Date(order.due_date).toLocaleDateString() : '-'}
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
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                                <DropdownMenuItem 
                                  key={status}
                                  onClick={() => handleStatusUpdate(order.id, status)}
                                  disabled={order.status === status}
                                >
                                  <config.icon className="w-4 h-4 mr-2" />
                                  Mark as {config.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          ) : (
            // Card View
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{order.order_number}</CardTitle>
                          <div className="flex gap-2">
                            <Badge className={ORDER_STATUSES[order.status].color}>
                              {ORDER_STATUSES[order.status].label}
                            </Badge>
                            <Badge variant="outline" className={`${PRIORITY_CONFIGS[order.priority].bg} ${PRIORITY_CONFIGS[order.priority].color}`}>
                              {PRIORITY_CONFIGS[order.priority].label}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{order.title}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{order.client_name?.charAt(0) || 'C'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{order.client_name}</div>
                            <div className="text-xs text-gray-500">{order.client_company}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{order.progress_percentage}%</span>
                          </div>
                          <Progress value={order.progress_percentage} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-gray-400" />
                            <span>{formatCurrency(order.order_value)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{order.due_date ? new Date(order.due_date).toLocaleDateString() : 'No due date'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <Badge className={PAYMENT_STATUSES[order.payment_status].color}>
                            {PAYMENT_STATUSES[order.payment_status].label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {order.completed_tasks || 0}/{order.total_tasks || 0} tasks
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Details - {selectedOrder?.order_number}</span>
              <Badge className={selectedOrder ? ORDER_STATUSES[selectedOrder.status].color : ''}>
                {selectedOrder ? ORDER_STATUSES[selectedOrder.status].label : ''}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Complete order information and progress tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="client">Client Info</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <p className="text-sm">{selectedOrder.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-600">{selectedOrder.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <p className="text-sm">{selectedOrder.category || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Order Date</label>
                      <p className="text-sm">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Due Date</label>
                      <p className="text-sm">
                        {selectedOrder.due_date ? new Date(selectedOrder.due_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Timeline</label>
                      <p className="text-sm">{selectedOrder.timeline_days || 0} days</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="client" className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{selectedOrder.client_name?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedOrder.client_name}</h3>
                    <p className="text-sm text-gray-600">{selectedOrder.client_email}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.client_company}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-2xl font-bold">{selectedOrder.progress_percentage}%</span>
                  </div>
                  <Progress value={selectedOrder.progress_percentage} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{selectedOrder.total_tasks || 0}</div>
                      <div className="text-xs text-gray-600">Total Tasks</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{selectedOrder.completed_tasks || 0}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {(selectedOrder.total_tasks || 0) - (selectedOrder.completed_tasks || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="financials" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Order Value</label>
                      <p className="text-lg font-bold">{formatCurrency(selectedOrder.order_value)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount Paid</label>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(selectedOrder.total_paid)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Payment Status</label>
                      <Badge className={PAYMENT_STATUSES[selectedOrder.payment_status].color}>
                        {PAYMENT_STATUSES[selectedOrder.payment_status].label}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Balance Due</label>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(((selectedOrder.order_value || 0) - (selectedOrder.total_paid || 0)))}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrdersManagement;