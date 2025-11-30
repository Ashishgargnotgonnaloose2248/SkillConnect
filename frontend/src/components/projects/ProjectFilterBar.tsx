import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type ProjectStatus } from "@/lib/api";

interface ProjectFilterBarProps {
  category: string | null;
  categories: string[];
  onCategoryChange: (value: string | null) => void;
  status: "all" | ProjectStatus;
  onStatusChange: (value: "all" | ProjectStatus) => void;
  selectedTech: string[];
  onToggleTech: (tech: string) => void;
  techOptions: string[];
}

const STATUS_OPTIONS: Array<{ label: string; value: "all" | ProjectStatus }> = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  category,
  categories,
  onCategoryChange,
  status,
  onStatusChange,
  selectedTech,
  onToggleTech,
  techOptions,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 lg:flex-row lg:items-center">
      <div className="flex flex-1 items-center gap-3">
        <div className="w-full max-w-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Category</p>
          <Select
            value={category || "all"}
            onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="mt-1 h-12 rounded-xl border-border/70 bg-background/70">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={status === option.value ? "default" : "outline"}
              className={cn(
                "rounded-full border-border/70",
                status === option.value && "shadow-sm"
              )}
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {techOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {techOptions.map((tech) => {
            const isActive = selectedTech.includes(tech);
            return (
              <Badge
                key={tech}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1 text-xs font-medium",
                  isActive
                    ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                    : "text-muted-foreground"
                )}
                onClick={() => onToggleTech(tech)}
              >
                {tech}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectFilterBar;
