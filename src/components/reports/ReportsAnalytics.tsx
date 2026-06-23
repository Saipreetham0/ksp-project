'use client';

import { formatCurrency } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Download, Calendar, Filter, BarChart3,
  IndianRupee, Users, Clock, Target, Award, AlertCircle, Activity,
  FileText, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface ReportFilters {
  dateRange: DateRange | undefined;
  status: string;
  department: string;
  client: string;
}

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  ordersByStatus: { name: string; value: number; color: string }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topClients: { name: string; orders: number; revenue: number }[];
  departmentStats: { department: string; orders: number; revenue: number }[];
}

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  tasksByStatus: { name: string; value: number; color: string }[];
  tasksByPriority: { priority: string; count: number }[];
  productivityTrend: { date: string; completed: number; created: number }[];
}

interface PaymentAnalytics {
  totalPayments: number;
  pendingAmount: number;
  collectionRate: number;
  averagePaymentDelay: number;
  paymentsByMonth: { month: string; amount: number; count: number }[];
  paymentMethods: { method: string; amount: number; percentage: number }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

export function ReportsAnalytics() {
  const supabase = createClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: startOfMonth(subMonths(new Date(), 5)),
      to: endOfMonth(new Date()),
    },
    status: 'all',
    department: 'all',
    client: 'all',
  });

  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completionRate: 0,
    ordersByStatus: [],
    revenueByMonth: [],
    topClients: [],
    departmentStats: [],
  });

  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics>({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    averageCompletionTime: 0,
    tasksByStatus: [],
    tasksByPriority: [],
    productivityTrend: [],
  });

  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics>({
    totalPayments: 0,
    pendingAmount: 0,
    collectionRate: 0,
    averagePaymentDelay: 0,
    paymentsByMonth: [],
    paymentMethods: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters, user]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([
        fetchOrderAnalytics(),
        fetchTaskAnalytics(),
        fetchPaymentAnalytics(),
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderAnalytics = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        user_profiles!orders_user_id_fkey(full_name, company)
      `)
      .gte('created_at', filters.dateRange?.from?.toISOString())
      .lte('created_at', filters.dateRange?.to?.toISOString());

    if (!orders) return;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'completed').length;

    // Orders by status
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ordersByStatus = Object.entries<number>(statusCounts).map(([status, count], index) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: COLORS[index % COLORS.length],
    }));

    // Revenue by month (mock data for demo)
    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM yyyy'),
        revenue: Math.random() * 100000 + 50000,
        orders: Math.floor(Math.random() * 20) + 5,
      };
    });

    // Top clients
    const clientRevenue = orders.reduce((acc, order) => {
      const clientName = order.user_profiles?.full_name || order.user_profiles?.company || 'Unknown';
      if (!acc[clientName]) {
        acc[clientName] = { orders: 0, revenue: 0 };
      }
      acc[clientName].orders += 1;
      acc[clientName].revenue += order.total_amount || 0;
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    const topClients = Object.entries<{ orders: number; revenue: number }>(clientRevenue)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setOrderAnalytics({
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      ordersByStatus,
      revenueByMonth,
      topClients,
      departmentStats: [], // Mock for now
    });
  };

  const fetchTaskAnalytics = async () => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .gte('created_at', filters.dateRange?.from?.toISOString())
      .lte('created_at', filters.dateRange?.to?.toISOString());

    if (!tasks) return;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const overdueTasks = tasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
    ).length;

    // Tasks by status
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByStatus = Object.entries<number>(statusCounts).map(([status, count], index) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: COLORS[index % COLORS.length],
    }));

    // Tasks by priority
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority || 'medium'] = (acc[task.priority || 'medium'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByPriority = Object.entries<number>(priorityCounts).map(([priority, count]) => ({
      priority: priority.toUpperCase(),
      count,
    }));

    setTaskAnalytics({
      totalTasks,
      completedTasks,
      overdueTasks,
      averageCompletionTime: 3.5, // Mock average days
      tasksByStatus,
      tasksByPriority,
      productivityTrend: [], // Mock for now
    });
  };

  const fetchPaymentAnalytics = async () => {
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', filters.dateRange?.from?.toISOString())
      .lte('created_at', filters.dateRange?.to?.toISOString());

    if (!payments) return;

    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingPayments = payments.filter(payment => payment.status === 'pending');
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Payment methods
    const methodCounts = payments.reduce((acc, payment) => {
      const method = payment.method || 'unknown';
      acc[method] = (acc[method] || 0) + (payment.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const paymentMethods = Object.entries<number>(methodCounts).map(([method, amount]) => ({
      method: method.toUpperCase(),
      amount,
      percentage: (amount / totalPayments) * 100,
    }));

    setPaymentAnalytics({
      totalPayments,
      pendingAmount,
      collectionRate: totalPayments > 0 ? ((totalPayments - pendingAmount) / totalPayments) * 100 : 0,
      averagePaymentDelay: 5.2, // Mock average days
      paymentsByMonth: [], // Mock for now
      paymentMethods,
    });
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    toast({
      title: 'Export Started',
      description: `Generating ${format.toUpperCase()} report...`,
    });
    // Mock export - would implement actual export functionality
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: `Report exported as ${format.toUpperCase()}`,
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-8 w-8 border-b-2 border-gray-900"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => exportReport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => setFilters(prev => ({ ...prev, dateRange }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select
                value={filters.client}
                onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Revenue',
                value: `₹${orderAnalytics.totalRevenue.toLocaleString()}`,
                change: '+12.5%',
                positive: true,
                icon: IndianRupee,
              },
              {
                title: 'Active Orders',
                value: orderAnalytics.totalOrders,
                change: '+8.2%',
                positive: true,
                icon: BarChart3,
              },
              {
                title: 'Completion Rate',
                value: `${orderAnalytics.completionRate.toFixed(1)}%`,
                change: '+3.1%',
                positive: true,
                icon: Target,
              },
              {
                title: 'Avg Order Value',
                value: `₹${orderAnalytics.averageOrderValue.toLocaleString()}`,
                change: '-2.3%',
                positive: false,
                icon: Award,
              },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <kpi.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className={`flex items-center text-sm font-medium ${
                        kpi.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.positive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {kpi.change}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                      <div className="text-sm text-gray-600">{kpi.title}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChartIcon className="h-5 w-5 mr-2" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={orderAnalytics.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Orders by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderAnalytics.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderAnalytics.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue & Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={orderAnalytics.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                      />
                      <Bar yAxisId="right" dataKey="orders" fill="#10B981" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderAnalytics.topClients.map((client, index) => (
                    <div key={client.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{client.name}</div>
                        <div className="text-xs text-gray-600">{client.orders} orders</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{formatCurrency(client.revenue)}</div>
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{taskAnalytics.totalTasks}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{taskAnalytics.completedTasks}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{taskAnalytics.overdueTasks}</div>
                  <div className="text-sm text-gray-600">Overdue</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskAnalytics.tasksByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskAnalytics.tasksByPriority.map((item, index) => (
                    <div key={item.priority} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.priority}</span>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(paymentAnalytics.totalPayments)}</div>
                  <div className="text-sm text-gray-600">Total Collected</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(paymentAnalytics.pendingAmount)}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">{paymentAnalytics.collectionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Collection Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentAnalytics.paymentMethods.map((method, index) => (
                  <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{method.method}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{method.percentage.toFixed(1)}%</span>
                      <span className="font-medium">{formatCurrency(method.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}