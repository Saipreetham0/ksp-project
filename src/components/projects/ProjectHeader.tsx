// src/components/projects/ProjectHeader.tsx
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";

interface ProjectHeaderProps {
  title: string;
  status: Project["status"];
}

export function ProjectHeader({ title, status }: ProjectHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <Badge variant={status === "completed" ? "secondary" : "default"}>
          {status.replace("_", " ")}
        </Badge>
      </div>
    </CardHeader>
  );
}
