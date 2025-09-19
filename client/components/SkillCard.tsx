import { Button } from "@/components/ui/button";

export interface SkillProfile {
  name: string;
  role: "Student" | "Faculty";
  skills: string[];
  available: boolean;
  mode: "Online" | "On-campus";
  linkedin?: string;
}

export function StatusDot({ on }: { on: boolean }) {
  return (
    <span
      className={
        "inline-flex h-2.5 w-2.5 rounded-full " + (on ? "bg-brand-green" : "bg-brand-red")
      }
      aria-label={on ? "Available" : "Offline"}
    />
  );
}

export default function SkillCard({ profile }: { profile: SkillProfile }) {
  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white font-semibold">
            {profile.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
          </div>
          <div>
            <p className="font-semibold leading-tight text-foreground">{profile.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{profile.role}</span>
              <span>•</span>
              <span>{profile.mode}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot on={profile.available} />
          <span className="text-xs text-muted-foreground">{profile.available ? "Available" : "Offline"}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {profile.skills.map((s) => (
          <span key={s} className="inline-flex items-center rounded-full bg-brand-sky/10 text-brand-blue px-2.5 py-1 text-xs ring-1 ring-brand-blue/20">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        {profile.linkedin ? (
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
            LinkedIn profile →
          </a>
        ) : <span />}
        <Button variant="default" className="h-10 px-4">Connect</Button>
      </div>
    </div>
  );
}
