import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Project } from "@/lib/api";
import ProjectCardDashboard from "./ProjectCardDashboard";

interface MyProjectsListProps {
  projects: Project[];
  isLoading?: boolean;
  onCreate: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const MyProjectsList: React.FC<MyProjectsListProps> = ({
  projects,
  isLoading,
  onCreate,
  onEdit,
  onDelete,
}) => {
  return (
    <Card id="my-projects" className="border-border/70 bg-card/80">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>My Projects</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showcase what you're building and invite collaborators.
          </p>
        </div>
        <Button onClick={onCreate}>Create new project</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading projects...</p>}
        {!isLoading && projects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center">
            <p className="font-medium">You haven't published any projects yet.</p>
            <p className="text-sm text-muted-foreground">
              Start by sharing what you're building so peers can join you.
            </p>
          </div>
        )}
        {projects.map((project) => (
          <ProjectCardDashboard
            key={project._id}
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default MyProjectsList;
