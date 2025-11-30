import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Github, Pencil, Trash2 } from "lucide-react";
import { type Project } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProjectCardDashboardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusBadge: Record<Project["status"], string> = {
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export const ProjectCardDashboard: React.FC<ProjectCardDashboardProps> = ({ project, onEdit, onDelete }) => {
  const collaborators = project.collaborators || [];
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        </div>
        <Badge className={cn("rounded-full px-3 py-1 text-xs", statusBadge[project.status])}>
          {project.status === "in-progress" ? "In progress" : "Completed"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {project.techStack?.map((tech) => (
            <Badge key={tech} variant="outline" className="rounded-full px-3 py-1 text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Collaborators</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {collaborators.length === 0 && <p className="text-sm text-muted-foreground">No collaborators yet</p>}
            {collaborators.map((person) => {
              const initials = person.fullName
                ?.split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <div
                  key={person._id}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  {person.fullName}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {project.githubLink ? (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Github className="h-4 w-4" />
              Repository
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No repo linked</span>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => onEdit(project)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" className="gap-2" onClick={() => onDelete(project)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCardDashboard;
