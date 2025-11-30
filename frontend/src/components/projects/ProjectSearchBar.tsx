import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface ProjectSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export const ProjectSearchBar: React.FC<ProjectSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search projects by name, stack, or owner",
  className,
}) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && onSubmit) {
        onSubmit();
      }
    },
    [onSubmit]
  );

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-12 rounded-2xl border-border/70 bg-card/90 pl-10 pr-4 text-base shadow-sm transition focus-visible:ring-2 focus-visible:ring-brand-blue"
      />
    </div>
  );
};

export default ProjectSearchBar;
