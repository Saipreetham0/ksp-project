"use client";

import { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, DeliveryStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Clock, DollarSign, Truck } from 'lucide-react';

interface OrderStatusUpdaterProps {
  order: Order;
  onStatusUpdate?: (updatedOrder: Order) => void;
  allowedStatuses?: OrderStatus[];
  canUpdatePayment?: boolean;
  canUpdateDelivery?: boolean;
}

const ORDER_STATUSES: { value: OrderStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Order is being prepared' },
  { value: 'processing', label: 'Processing', description: 'Order is being worked on' },
  { value: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
  { value: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
  { value: 'completed', label: 'Completed', description: 'Order is fully completed' },
  { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' }
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' }
];

const DELIVERY_STATUSES: { value: DeliveryStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'not_applicable', label: 'Not Applicable' }
];

export default function OrderStatusUpdater({
  order,
  onStatusUpdate,
  allowedStatuses,
  canUpdatePayment = true,
  canUpdateDelivery = true
}: OrderStatusUpdaterProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<DeliveryStatus | undefined>(order.delivery_status);
  const [notes, setNotes] = useState('');

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const updateData: any = {};
      
      if (selectedStatus !== order.status) {
        updateData.status = selectedStatus;
      }
      
      if (canUpdatePayment && selectedPaymentStatus !== order.payment_status) {
        updateData.payment_status = selectedPaymentStatus;
      }
      
      if (canUpdateDelivery && selectedDeliveryStatus !== order.delivery_status) {
        updateData.delivery_status = selectedDeliveryStatus;
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No status changes to update'
        });
        return;
      }

      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update order status');
      }

      toast({
        title: 'Success',
        description: 'Order status updated successfully'
      });

      onStatusUpdate?.(result.data);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableStatuses = allowedStatuses ? 
    ORDER_STATUSES.filter(s => allowedStatuses.includes(s.value)) : 
    ORDER_STATUSES;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Order Status Management
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Order Status</label>
            <Badge className={getStatusColor(order.status)}>
              {ORDER_STATUSES.find(s => s.value === order.status)?.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Status</label>
            <Badge className={getPaymentStatusColor(order.payment_status)}>
              {PAYMENT_STATUSES.find(s => s.value === order.payment_status)?.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Delivery Status</label>
            <Badge className={getStatusColor(order.delivery_status || 'pending')}>
              {DELIVERY_STATUSES.find(s => s.value === order.delivery_status)?.label || 'Pending'}
            </Badge>
          </div>
        </div>

        {/* Status Update Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Order Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Update Order Status
            </label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div>
                      <div className="font-medium">{status.label}</div>
                      <div className="text-sm text-gray-500">{status.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          {canUpdatePayment && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Payment Status
              </label>
              <Select value={selectedPaymentStatus} onValueChange={(value) => setSelectedPaymentStatus(value as PaymentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Delivery Status */}
          {canUpdateDelivery && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Delivery Status
              </label>
              <Select value={selectedDeliveryStatus || 'pending'} onValueChange={(value) => setSelectedDeliveryStatus(value as DeliveryStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Status Update Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Update Notes (Optional)
          </label>
          <Textarea
            placeholder="Add notes about this status update..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleUpdateStatus} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Status
          </Button>
        </div>

        {/* Status Progression Indicator */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-3">Order Progress</div>
          <div className="flex items-center justify-between">
            {ORDER_STATUSES.filter(s => s.value !== 'cancelled').map((status, index) => {
              const isActive = status.value === selectedStatus;
              const isPast = ORDER_STATUSES.findIndex(s => s.value === selectedStatus) > index;
              const isCancelled = selectedStatus === 'cancelled';
              
              return (
                <div key={status.value} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCancelled 
                        ? 'bg-gray-200 text-gray-500' 
                        : isPast || isActive 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className={`text-xs mt-1 text-center max-w-16 ${
                    isCancelled ? 'text-gray-400' : isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {status.label}
                  </div>
                  {index < ORDER_STATUSES.length - 2 && (
                    <div className={`h-0.5 w-8 mt-2 ${
                      isCancelled ? 'bg-gray-200' : isPast ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          {selectedStatus === 'cancelled' && (
            <div className="mt-4 text-center">
              <Badge variant="destructive">Order Cancelled</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}