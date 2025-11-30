import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectSearchBar from "@/components/projects/ProjectSearchBar";
import ProjectFilterBar from "@/components/projects/ProjectFilterBar";
import ProjectCard from "@/components/projects/ProjectCard";
import CollabRequestModal from "@/components/projects/CollabRequestModal";
import { projectsAPI, type Project, type ProjectStatus } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [techFilter, setTechFilter] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      "projects",
      { search, category, status, tech: techFilter },
    ],
    queryFn: () =>
      projectsAPI
        .getAll({
          search: search.trim() || undefined,
          category: category || undefined,
          status: status === "all" ? undefined : status,
          tech: techFilter,
        })
        .then((response) => response.data.data),
  });

  const projects = data?.projects ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => {
      if (project.category) {
        set.add(project.category);
      }
    });
    return Array.from(set);
  }, [projects]);

  const techOptions = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => {
      project.techStack?.forEach((tech) => set.add(tech));
    });
    return Array.from(set).slice(0, 12);
  }, [projects]);

  const toggleTechFilter = (tech: string) => {
    setTechFilter((prev) =>
      prev.includes(tech) ? prev.filter((item) => item !== tech) : [...prev, tech]
    );
  };

  const handleCollaborateClick = (project: Project) => {
    if (!isAuthenticated) {
      navigate("/auth?intent=collaborate");
      return;
    }
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const mutation = useMutation({
    mutationFn: ({ projectId, message }: { projectId: string; message?: string }) =>
      projectsAPI.requestCollaboration(projectId, { message }),
    onSuccess: () => {
      toast({ title: "Request sent", description: "The project owner has been notified." });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to send request",
        description: error?.response?.data?.message || "Try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const submitRequest = async (message: string) => {
    if (!selectedProject) return;
    await mutation.mutateAsync({ projectId: selectedProject._id, message });
    setIsModalOpen(false);
  };

  const isCollabDisabled = (project: Project) => {
    if (!isAuthenticated) return false;
    if (project.owner?._id === user?._id) return true;
    return project.collaborators?.some((collaborator) => collaborator._id === user?._id);
  };

  return (
    <section className="container py-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-blue/70">Project collaboration</p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">Explore student projects</h1>
          <p className="text-muted-foreground">Find real builds to join, contribute, or learn from.</p>
        </div>
        <Button asChild variant="outline" className="h-11 rounded-full">
          <Link to="/dashboard#my-projects">My Projects →</Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <ProjectSearchBar value={search} onChange={setSearch} />
        <ProjectFilterBar
          category={category}
          categories={categories}
          onCategoryChange={setCategory}
          status={status}
          onStatusChange={setStatus}
          selectedTech={techFilter}
          onToggleTech={toggleTechFilter}
          techOptions={techOptions}
        />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px] rounded-2xl" />
          ))}
        {!isLoading && projects.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border/70 p-10 text-center text-muted-foreground">
            No projects match your filters yet.
          </div>
        )}
        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onCollaborate={handleCollaborateClick}
            disabled={isCollabDisabled(project)}
          />
        ))}
      </div>

      {selectedProject && (
        <CollabRequestModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          projectTitle={selectedProject.title}
          onSubmit={submitRequest}
          isSubmitting={mutation.isPending}
        />
      )}
    </section>
  );
};

export default ProjectsPage;
