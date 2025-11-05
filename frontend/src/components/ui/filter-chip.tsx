import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  count?: number;
  className?: string;
}

export function FilterChip({ label, selected, onClick, count, className }: FilterChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors",
        selected
          ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm"
          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50",
        className
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn("rounded-full px-1.5 py-0.5 text-xs", 
          selected ? "bg-white/20" : "bg-gray-100"
        )}>
          {count}
        </span>
      )}
    </motion.button>
  );
}