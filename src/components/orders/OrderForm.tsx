"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateOrderRequest, Order } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const orderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['mini', 'major', 'custom']),
  technology: z.string().optional(),
  timeline: z.coerce.number().min(1, 'Timeline must be at least 1 day').optional(),
  team_size: z.coerce.number().min(1, 'Team size must be at least 1').optional(),
  amount: z.coerce.number().min(0, 'Amount must be positive').optional(),
  
  // Delivery address (optional)
  delivery_street: z.string().optional(),
  delivery_city: z.string().optional(),
  delivery_state: z.string().optional(),
  delivery_postal_code: z.string().optional(),
  delivery_country: z.string().optional(),
  delivery_contact: z.string().optional(),
  
  estimated_delivery: z.string().optional()
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  initialData?: Order;
  onSuccess?: (order: Order) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export default function OrderForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  mode = 'create' 
}: OrderFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: (initialData?.type as 'mini' | 'major' | 'custom') || 'mini',
      technology: initialData?.technology || '',
      timeline: initialData?.timeline || undefined,
      team_size: initialData?.team_size || undefined,
      amount: initialData?.amount || undefined,
      
      // Extract delivery address if exists
      delivery_street: initialData?.delivery_address?.street || '',
      delivery_city: initialData?.delivery_address?.city || '',
      delivery_state: initialData?.delivery_address?.state || '',
      delivery_postal_code: initialData?.delivery_address?.postalCode || '',
      delivery_country: initialData?.delivery_address?.country || '',
      delivery_contact: initialData?.delivery_address?.contactNumber || '',
      
      estimated_delivery: initialData?.estimated_delivery?.split('T')[0] || ''
    }
  });

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true);
    try {
      // Prepare the request data
      const requestData: CreateOrderRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        technology: data.technology,
        timeline: data.timeline,
        team_size: data.team_size,
        amount: data.amount
      };

      // Add delivery address if any field is filled
      if (data.delivery_street || data.delivery_city || data.delivery_state) {
        requestData.delivery_address = {
          street: data.delivery_street || '',
          city: data.delivery_city || '',
          state: data.delivery_state || '',
          postalCode: data.delivery_postal_code || '',
          country: data.delivery_country || '',
          contactNumber: data.delivery_contact
        };
      }

      if (data.estimated_delivery) {
        requestData.estimated_delivery = data.estimated_delivery;
      }

      let response;
      
      if (mode === 'edit' && initialData) {
        response = await fetch(`/api/orders/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
      } else {
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save order');
      }

      toast({
        title: 'Success',
        description: `Order ${mode === 'edit' ? 'updated' : 'created'} successfully`
      });

      onSuccess?.(result.data);
      
      if (mode === 'create') {
        form.reset();
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${mode} order`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Edit Order' : 'Create New Order'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter order title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mini">Mini Project</SelectItem>
                        <SelectItem value="major">Major Project</SelectItem>
                        <SelectItem value="custom">Custom Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the order"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="technology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technology</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React, Node.js" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="30" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="3" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="50000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Delivery Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_delivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'edit' ? 'Update Order' : 'Create Order'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}