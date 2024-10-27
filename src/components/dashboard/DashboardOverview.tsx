// src/components/dashboard/DashboardOverview.tsx
"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Project, FormData } from "@/types/project";

import { useRouter } from "next/navigation";


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
      return "secondary"; // Changed from 'success'
    case "pending":
      return "default"; // Changed from 'warning'
    case "rejected":
      return "destructive";
    default:
      return "default";
  }
};

// const ProjectCard = ({ project }: { project: Project }) => (
const ProjectCard = ({ project }: { project: Project }) => {
  const router = useRouter();
  // const router = useRouter();
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {project.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {project.status === "completed" && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {project.status === "pending" && (
              <Clock3 className="h-4 w-4 text-yellow-500" />
            )}
            {project.status === "rejected" && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={getStatusBadgeVariant(project.status)}>
              {project.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{project.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Laptop className="h-4 w-4" />
              <span>{project.technology}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{project.team_size} members</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{project.timeline} weeks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
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
            {project.type} Project
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/projects/${project.id}`)}
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch projects for the current user
  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchProjects = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId) // Filter projects by user_id
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("You must be logged in to submit a project");
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
      const { error } = await supabase.from("projects").insert([
        {
          ...formData,
          timeline,
          team_size,
          user_id: userId, // Add user_id to the project
          created_at: new Date().toISOString(),
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
      fetchProjects();
    } catch (err) {
      console.error("Error submitting project:", err);
      setError("Failed to submit project");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
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
                <Label htmlFor="description">Project Description</Label>
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
                  <Label htmlFor="type">Project Type</Label>
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
                  <Label htmlFor="timeline">Timeline (weeks)</Label>
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
                  Project submitted successfully!
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Project"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {projects.length === 0 && (
              <p className="text-center text-gray-500">
                No projects submitted yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardOverview;
