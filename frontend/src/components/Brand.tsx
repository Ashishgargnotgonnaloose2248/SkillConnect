import React from "react";
import { Link } from "react-router-dom";

interface BrandProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** where the brand links to; pass empty string to render non-interactive */
  to?: string;
}

export default function Brand({ showText = true, size = "lg", className, to = "/" }: BrandProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  } as const;
  const content = (
    <div className={"flex items-center gap-2 " + (className || "")} aria-label="SkillConnect">
      <img
        src="/logo.jpg"
        alt="SkillConnect logo"
        className={sizeMap[size]}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (!(img as any).dataset.fallback) {
            (img as any).dataset.fallback = "1";
            img.src = "/logo.png";
          }
        }}
      />
      {showText && (
        <span className="font-bold tracking-tight text-brand-gradient">SkillConnect</span>
      )}
    </div>
  );

  if (to === "") return content; // non-interactive

  return (
    <Link to={to} aria-label="SkillConnect home">
      {content}
    </Link>
  );
}


