import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const DeliveryStatus = {
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  FAILED: "failed"
};

export const DeliveryManagementSection = ({ projectId }: { projectId: string }) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [trackingLink, setTrackingLink] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setAddresses(data || []);

      // Fetch project delivery status
      const { data: projectData } = await supabase
        .from('projects')
        .select('delivery_status, tracking_link')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setDeliveryStatus(projectData.delivery_status);
        setTrackingLink(projectData.tracking_link || "");
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [projectId]);

  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAddress = {
      project_id: projectId,
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      postal_code: formData.get('postal_code'),
      country: formData.get('country'),
      contact_number: formData.get('contact_number')
    };

    try {
      const { error } = await supabase
        .from('delivery_addresses')
        .insert([newAddress]);

      if (error) throw error;

      setIsAddingAddress(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const updateDeliveryStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ delivery_status: status })
        .eq('id', projectId);

      if (error) throw error;
      setDeliveryStatus(status);
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const saveTrackingLink = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ tracking_link: trackingLink })
        .eq('id', projectId);

      if (error) throw error;
    //   toast.success('Tracking link saved');
    } catch (error) {
      console.error('Error saving tracking link:', error);
    //   toast.error('Failed to save tracking link');
    }
  };

  const handleTrackingLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingLink(e.target.value);
  };

  const handleTrackingLinkBlur = () => {
    if (trackingLink !== "") {
      saveTrackingLink();
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'} capitalize`}>
        {status?.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Management
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Delivery Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input id="street" name="street" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input id="postal_code" name="postal_code" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_number">Contact Number</Label>
                      <Input id="contact_number" name="contact_number" required />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddingAddress(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Address</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Delivery Status</Label>
              <Select value={deliveryStatus} onValueChange={updateDeliveryStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeliveryStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Tracking Link</Label>
              <div className="flex gap-2">
                {/* <Input
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                  placeholder="Enter tracking URL"
                /> */}
                <Input
                  value={trackingLink}
                  onChange={handleTrackingLinkChange}
                  onBlur={handleTrackingLinkBlur}
                  placeholder="Enter tracking URL"
                />
                {trackingLink && (
                  <Button variant="outline" onClick={() => window.open(trackingLink, '_blank')}>
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {address.street}
                        </div>
                        <div className="text-sm text-gray-500">
                          {address.city}, {address.state} {address.postal_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {address.country}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{address.contact_number}</TableCell>
                    <TableCell>{getStatusBadge(deliveryStatus)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryManagementSection;