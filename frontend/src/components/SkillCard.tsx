import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Linkedin, Mail } from "lucide-react";
import { useMemo, useState } from "react";

export interface SkillProfile {
  name: string;
  role: "Student" | "Faculty";
  skills: string[];
  available: boolean;
  mode: "Online" | "On-campus";
  linkedin?: string;
  email?: string;
  verified?: boolean;
}

export function StatusDot({ on }: { on: boolean }) {
  return (
    <span
      className={
        "inline-flex h-2.5 w-2.5 rounded-full " + (on ? "bg-brand-green" : "bg-gray-300")
      }
      aria-label={on ? "Available" : "Offline"}
    />
  );
}

export default function SkillCard({ profile }: { profile: SkillProfile }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const roleClass = profile.role === 'Faculty' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';
  const visibleSkills = profile.skills.slice(0, 5);
  const hiddenCount = Math.max(profile.skills.length - visibleSkills.length, 0);
  const canMail = Boolean(profile.email);
  const canLinkedIn = Boolean(profile.linkedin);
  const gmailHref = useMemo(() => {
    if (!profile.email) return undefined;
    const subject = encodeURIComponent("SkillConnect – Session Request");
    const body = encodeURIComponent(
      `Hi ${profile.name.split(" ")[0]},\n\nI'd love to connect and schedule a session with you via SkillConnect. Let me know when you're available!\n\nThanks!`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${subject}&body=${body}`;
  }, [profile.email, profile.name]);

  return (
    <div className="group h-full overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 hover:border-brand-blue/30 focus-within:ring-2 focus-within:ring-brand-blue/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white font-semibold transition-transform group-hover:scale-105">
            {profile.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight text-foreground flex items-center gap-2 max-w-[200px] truncate">
              <span className="truncate" title={profile.name}>{profile.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${roleClass}`}>{profile.role}</span>
              {profile.verified && (
                <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 text-brand-blue" /> Verified
                </Badge>
              )}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{profile.mode}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground sm:self-start">
          <StatusDot on={profile.available} />
          <span>{profile.available ? "Available" : "Unavailable"}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {visibleSkills.map((s) => (
          <span key={s} className="inline-flex max-w-full items-center rounded-full bg-brand-sky/10 text-brand-blue px-2.5 py-1 text-xs ring-1 ring-brand-blue/20">
            <span className="truncate" title={s}>{s}</span>
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            +{hiddenCount} more
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {profile.linkedin ? (
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary hover:underline truncate"
          >
            LinkedIn profile →
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">&nbsp;</span>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button
            variant="default"
            className="h-10 px-4 shrink-0"
            onClick={() => setIsDialogOpen(true)}
          >
            Connect
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect with {profile.name}</DialogTitle>
              <DialogDescription>
                Choose how you'd like to reach out.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                asChild
                disabled={!canLinkedIn}
              >
                {canLinkedIn ? (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer">
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    Continue via LinkedIn
                  </a>
                ) : (
                  <span className="flex items-center gap-3 text-muted-foreground">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn not available
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                asChild
                disabled={!canMail || !gmailHref}
              >
                {canMail && gmailHref ? (
                  <a href={gmailHref} target="_blank" rel="noreferrer">
                    <Mail className="h-4 w-4" />
                    Compose email in Gmail
                  </a>
                ) : (
                  <span className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email not available
                  </span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
