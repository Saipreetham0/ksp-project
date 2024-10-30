// // src/app/(adminpanel)/admin/projects/[id]/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { PaymentSection } from "@/components/admin/PaymentSection";
import { DeliverySection } from "@/components/admin/DeliverySection";
import { DeliveryManagementSection } from "@/components/admin/DeliveryManagementSection";
// import { Project } from "@/types";

// Constants
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

// Types
interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  technology: string;
  timeline: number;
  team_size: number;
  status: "pending" | "active" | "completed" | "cancelled";
  created_at: string;
  user_id: string;
  delivery_status: "pending" | "delivered" | "not_set" | null;
  amount: number;
  payment_status: "pending" | "paid" | "cancelled";
}
// Loading Component
function LoadingState() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

// Error Component
function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <Alert variant="destructive" className="m-6">
      <AlertDescription className="flex flex-col gap-4">
        <p>{error}</p>
        <Button variant="outline" onClick={onBack} className="w-fit">
          Back to Projects
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// Status Badge Component
function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: "status" | "payment" | "delivery";
}) {
  const getStatusColor = (
    status: string,
    type: "status" | "payment" | "delivery"
  ) => {
    const colors = {
      status: {
        pending: "bg-yellow-100 text-yellow-800",
        active: "bg-green-100 text-green-800",
        completed: "bg-blue-100 text-blue-800",
        cancelled: "bg-red-100 text-red-800",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        paid: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
      },
      delivery: {
        pending: "bg-yellow-100 text-yellow-800",
        delivered: "bg-green-100 text-green-800",
      },
    } as const;
    // return colors[type]?.[status] || 'bg-gray-100 text-gray-800';
    return (
      colors[type]?.[status as keyof (typeof colors)[typeof type]] ||
      "bg-gray-100 text-gray-800"
    );
  };

  return (
    <Badge className={`${getStatusColor(status, type)} capitalize`}>
      {status}
    </Badge>
  );
}

// Project Form Component
function ProjectForm({
  project,
  isEditing,
  onSave,
  onCancel,
  isSubmitting,
  projectTypes,
}: {
  project: Project;
  isEditing: boolean;
  onSave: (updatedProject: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  projectTypes: string[];
}) {
  const [formData, setFormData] = useState(project);

  const handleChange = (field: keyof Project, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          disabled={!isEditing}
          required
        />
      </div>

      {/* Description - Second */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={!isEditing}
          required
          className="h-19"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Project Type</Label>
          <Select
            disabled={!isEditing}
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {projectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Technology - Predefined List */}
        <div className="space-y-2">
          <Label htmlFor="technology">Technology</Label>
          <Select
            disabled={!isEditing}
            value={formData.technology}
            onValueChange={(value) => handleChange("technology", value)}
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
          <Label htmlFor="timeline">Timeline (Weeks)</Label>
          <Input
            id="timeline"
            type="number"
            value={formData.timeline}
            onChange={(e) => handleChange("timeline", parseInt(e.target.value))}
            disabled={!isEditing}
            required
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team_size">Team Size</Label>
          <Input
            id="team_size"
            type="number"
            value={formData.team_size}
            onChange={(e) =>
              handleChange("team_size", parseInt(e.target.value))
            }
            disabled={!isEditing}
            required
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
            disabled={!isEditing}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="status">Project Status</Label>
          <Select
            disabled={!isEditing}
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_status">Payment Status</Label>
          <Select
            disabled={!isEditing}
            value={formData.payment_status}
            onValueChange={(value) => handleChange("payment_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="delivery_status">Delivery Status</Label>
          <Select
            disabled={!isEditing}
            // value={formData.delivery_status || ''}
            value={formData.delivery_status || "not_set"}
            onValueChange={(value) => handleChange("delivery_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select delivery status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_set">Not Set</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select
              disabled={!isEditing}
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              disabled={!isEditing}
              value={formData.payment_status}
              onValueChange={(value) => handleChange("payment_status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_status">Delivery Status</Label>
            <Select
              disabled={!isEditing}
              value={formData.delivery_status || "not_set"}
              onValueChange={(value) => handleChange("delivery_status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_set">Not Set</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* <PaymentSection projectId={project.id} totalAmount={project.amount} /> */}

      {isEditing && (
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </form>
  );
}

// Main Component
export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error("Project not found");

      setProject(projectData);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load project details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedProject: Partial<Project>) => {
    if (!projectId || !project) return;

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update(updatedProject)
        .eq("id", projectId);

      if (updateError) throw updateError;

      await fetchProjectDetails();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBack={() => router.back()} />;
  if (!project)
    return (
      <ErrorState error="Project not found" onBack={() => router.back()} />
    );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Project Details</h2>
            <p className="text-sm text-gray-500">
              Created on {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel Edit" : "Edit Project"}
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={project.status} type="status" />
              <StatusBadge status={project.payment_status} type="payment" />
              {project.delivery_status && (
                <StatusBadge status={project.delivery_status} type="delivery" />
              )}
            </div>

            <ProjectForm
              project={project}
              isEditing={isEditing}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
              projectTypes={["Mini", "Major", "Custom"]} // Add this line
            />
          </div>
        </CardContent>

        <CardFooter className="border-t bg-gray-50">
          <div className="flex justify-between w-full items-center">
            <Badge variant="outline" className="capitalize">
              {project.type} Project
            </Badge>
            <Button variant="ghost" onClick={() => router.back()}>
              Back to Projects
            </Button>
          </div>
        </CardFooter>
      </Card>

      <PaymentSection projectId={project.id} totalAmount={project.amount} />

      {/* <DeliverySection projectId={project.id} /> */}
      <DeliveryManagementSection projectId={project.id} />

      {/* <ProjectDownloadLinks projectId={project.id} /> */}
    </div>
  );
}
