import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, ProjectStatus } from "@/lib/api";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    category: string;
    techStack: string[];
    githubLink?: string;
    status: ProjectStatus;
  }) => Promise<void> | void;
  initialData?: Partial<Project> | null;
  isSubmitting?: boolean;
}

interface FormValues {
  title: string;
  description: string;
  category: string;
  techStack: string;
  githubLink?: string;
  status: ProjectStatus;
}

const statusOptions: ProjectStatus[] = ["in-progress", "completed"];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      techStack: "",
      githubLink: "",
      status: "in-progress",
    },
  });

  useEffect(() => {
    reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      techStack: (initialData?.techStack || []).join(", "),
      githubLink: initialData?.githubLink || "",
      status: initialData?.status || "in-progress",
    });
  }, [initialData, reset]);

  const submitHandler = handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      githubLink: values.githubLink?.trim() || undefined,
      status: values.status,
      techStack: values.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    await onSubmit(payload);
  });

  const currentStatus = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit project" : "Create new project"}</DialogTitle>
          <DialogDescription>
            Share the key details so peers know what you're building and how to get involved.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submitHandler}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Project title</label>
            <Input placeholder="Campus notes app" {...register("title", { required: true })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What problem are you solving and what help are you looking for?"
              className="min-h-[120px]"
              {...register("description", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input placeholder="AI, Fintech, SaaS" {...register("category", { required: true })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tech stack</label>
            <Input
              placeholder="React, Node.js, Tailwind"
              {...register("techStack")}
            />
            <p className="text-xs text-muted-foreground">Separate technologies with commas.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub (optional)</label>
            <Input placeholder="https://github.com/..." {...register("githubLink")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={currentStatus} onValueChange={(value) => setValue("status", value as ProjectStatus)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "in-progress" ? "In progress" : "Completed"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update project" : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
