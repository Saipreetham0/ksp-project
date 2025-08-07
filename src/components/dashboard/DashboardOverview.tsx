// src/components/dashboard/DashboardOverview.tsx
"use client";

import React, { useState, useEffect } from "react";
// Firebase imports removed - replaced with Supabase authentication
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Laptop,
  Calendar,
  CheckCircle,
  XCircle,
  Clock3,
  IndianRupee,
} from "lucide-react";

// Updated to use Order instead of Project
interface Order {
  id: number;
  user_id: string;
  title: string;
  description: string;
  type: string;
  technology: string;
  timeline: number;
  team_size: number;
  amount?: number;
  status: string;
  payment_status?: string;
  delivery_status?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  description: string;
  type: string;
  technology: string;
  timeline: string;
  team_size: string;
  status: string;
}
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";


// Constants
const PROJECT_TYPES = ["mini", "major", "custom"] as const;
const TECHNOLOGIES = [
  "Arduino",
  "Raspberry Pi",
  "IoT",
  "Embedded Systems",
  "PCB Design",
  "PLC",
  "SCADA",
  "Robotics",
  "Industrial Automation",
  "others",
] as const;

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "secondary";
    case "processing":
    case "shipped":
    case "delivered":
      return "default";
    case "pending":
    case "draft":
      return "default";
    case "rejected":
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
};

const OrderCard = ({ order }: { order: Order }) => {
  const router = useRouter();
  // const router = useRouter();
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {order.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {order.status === "completed" && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {(order.status === "pending" || order.status === "draft") && (
              <Clock3 className="h-4 w-4 text-yellow-500" />
            )}
            {(order.status === "rejected" || order.status === "cancelled") && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{order.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Laptop className="h-4 w-4" />
              <span>{order.technology}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{order.team_size} members</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{order.timeline} days</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {order.amount && (
            <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
              <IndianRupee className="h-4 w-4" />
              <span>₹{order.amount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      {/* <CardFooter className="bg-gray-50">
      <div className="flex items-center justify-between w-full">
        <Badge variant="outline" className="capitalize">
          {project.type} Project
        </Badge>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </div>
    </CardFooter> */}

      <CardFooter className="bg-gray-50">
        <div className="flex items-center justify-between w-full">
          <Badge variant="outline" className="capitalize">
            {order.type} Order
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
  // );
};

export function DashboardOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, session, loading: authLoading, supabase } = useAuthSession();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    type: "mini",
    technology: "",
    timeline: "",
    team_size: "",
    status: "pending",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle authentication state
  useEffect(() => {
    if (!authLoading && !session) {
      // Only redirect if we're not loading and there's definitely no session
      router.push("/login");
    }
  }, [authLoading, session, router]);

  // Fetch orders for the current user
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id) // Filter orders by user_id
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError("You must be logged in to submit an order");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const timeline = parseInt(formData.timeline);
    const team_size = parseInt(formData.team_size);

    if (isNaN(timeline) || isNaN(team_size)) {
      setError("Timeline and team size must be valid numbers");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("orders").insert([
        {
          ...formData,
          timeline,
          team_size,
          user_id: user.id, // Add user_id to the order
          status: formData.status === "pending" ? "draft" : formData.status, // Map pending to draft for orders
          payment_status: "pending",
          delivery_status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        type: "mini",
        technology: "",
        timeline: "",
        team_size: "",
        status: "pending",
      });
      fetchOrders();
    } catch (err) {
      console.error("Error submitting order:", err);
      setError("Failed to submit order");
    } finally {
      setLoading(false);
    }
  };



  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if there's no session (will redirect)
  if (!session || !user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Order Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Order Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Order Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technology">Technology</Label>
                  <Select
                    value={formData.technology}
                    onValueChange={(value) =>
                      setFormData({ ...formData, technology: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technology" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECHNOLOGIES.map((tech) => (
                        <SelectItem key={tech} value={tech}>
                          {tech}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline (days)</Label>
                  <Input
                    id="timeline"
                    type="number"
                    min="1"
                    value={formData.timeline}
                    onChange={(e) =>
                      setFormData({ ...formData, timeline: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={(e) =>
                      setFormData({ ...formData, team_size: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              {success && (
                <div className="text-sm text-green-500">
                  Order submitted successfully!
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {orders.length === 0 && (
              <p className="text-center text-gray-500">
                No orders submitted yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardOverview;
