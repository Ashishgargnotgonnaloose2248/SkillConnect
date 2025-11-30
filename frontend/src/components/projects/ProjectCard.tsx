import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Github, Users, ExternalLink } from "lucide-react";
import { type Project } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onCollaborate: (project: Project) => void;
  disabled?: boolean;
}

const statusStyles: Record<Project["status"], string> = {
  "in-progress": "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onCollaborate, disabled }) => {
  const ownerInitials = project.owner?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="h-full border-border/70 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl leading-tight line-clamp-2">
            {project.title}
          </CardTitle>
          <Badge className={cn("rounded-full px-3 py-1 text-xs", statusStyles[project.status])}>
            {project.status === "in-progress" ? "In progress" : "Completed"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Tech stack</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(project.techStack || []).slice(0, 6).map((tech) => (
              <Badge key={tech} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {tech}
              </Badge>
            ))}
            {project.techStack?.length > 6 && (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs text-muted-foreground">
                +{project.techStack.length - 6}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback>{ownerInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{project.owner?.fullName}</p>
              <p className="text-xs text-muted-foreground">Project owner</p>
              {project.owner?.linkedin && (
                <a
                  href={project.owner.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  LinkedIn <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-4 w-4" />
            {(project.collaborators?.length || 0) + 1} people building this
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
              View repository
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">Private repository</span>
          )}
          <Button size="sm" onClick={() => onCollaborate(project)} disabled={disabled}>
            {disabled ? "Collaboration unavailable" : "Request to collaborate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
