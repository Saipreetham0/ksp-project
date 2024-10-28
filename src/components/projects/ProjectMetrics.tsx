// src/components/projects/ProjectMetrics.tsx
import { Clock, Users, Laptop, Calendar } from "lucide-react";
import React from "react";

interface ProjectMetricsProps {
  technology: string;
  teamSize: number;
  timeline: number;
  createdAt: string;
}

export function ProjectMetrics({
  technology,
  teamSize,
  timeline,
  createdAt,
}: ProjectMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-2">
        <Laptop className="h-5 w-5 text-gray-500" />
        <span className="text-sm">{technology}</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-gray-500" />
        <span className="text-sm">{teamSize} members</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-500" />
        <span className="text-sm">{timeline} weeks</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-500" />
        <span className="text-sm">
          {new Date(createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
