import { Button } from "@/components/ui/button";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { publicAPI, skillsAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Brand from "@/components/Brand";
import { BookOpen, Users, Sparkles, Clock, Rocket, Globe } from "lucide-react";

export default function Index() {
  const { isAuthenticated, user } = useAuth();
  const { data: publicStats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => publicAPI.getStats().then(res => res.data.data),
    staleTime: 60_000,
  });

  const { data: popularSkills } = useQuery({
    queryKey: ['popular-skills'],
    queryFn: () => skillsAPI.getPopular(12).then(res => res.data.data),
    staleTime: 60_000,
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-48 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-gradient-to-br from-brand-lavender/30 to-brand-sky/30 animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-gradient-to-tr from-brand-sky/30 to-brand-pink/30 animate-[pulse_10s_ease-in-out_infinite]" />
          {/* Faint logo watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
            <Brand size="xl" />
          </div>
        </div>
        <div className="container pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Brand size="xl" className="mb-5" />
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-2.5 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
                <span className="inline-flex h-2 w-2 rounded-full bg-brand-green" />
                Real-time availability
              </div>
              <h1 className="mt-4 text-5xl font-extrabold tracking-tight leading-tight md:text-6xl">
                {isAuthenticated ? `Welcome back, ${user?.fullName}!` : "Connect. Learn. Grow — Together on SkillConnect."}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                {isAuthenticated 
                  ? "Ready to continue your learning journey? Explore new skills or manage your sessions."
                  : "A campus-exclusive network where students and faculty exchange skills and knowledge in real-time."
                }
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="default" className="h-12 px-6">
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button asChild variant="secondary" className="h-12 px-6">
                      <Link to="/explorer">Explore Skills</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="h-12 px-7 text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400">
                      <Link to="/auth" className="inline-flex items-center gap-2"><Rocket className="h-4 w-4"/> Get Started</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-12 px-7">
                      <Link to="/explorer" className="inline-flex items-center gap-2"><Globe className="h-4 w-4"/> Explore Skills</Link>
                    </Button>
                  </>
                )}
              </div>
              <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-pink" /> Friendly community</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-sky" /> Online + On-campus</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-green" /> Verified emails</div>
              </div>
            </div>
            <div className="animate-fade-in-up animate-delay-1">
              <div className="relative mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-brand-lavender/20 p-5 transition-colors hover:bg-brand-lavender/30">
                    <p className="text-xs font-medium text-brand-blue inline-flex items-center gap-2"><Users className="h-3.5 w-3.5"/> Peer Learning</p>
                    <p className="mt-2 text-sm text-muted-foreground">Find students teaching the skills you need.</p>
                  </div>
                  <div className="rounded-2xl bg-brand-sky/20 p-5 transition-colors hover:bg-brand-sky/30">
                    <p className="text-xs font-medium text-brand-blue inline-flex items-center gap-2"><BookOpen className="h-3.5 w-3.5"/> Faculty Access</p>
                    <p className="mt-2 text-sm text-muted-foreground">Consultation slots and mentorship.</p>
                  </div>
                  <div className="rounded-2xl bg-brand-pink/20 p-5 transition-colors hover:bg-brand-pink/30">
                    <p className="text-xs font-medium text-brand-blue inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5"/> AI Assistant</p>
                    <p className="mt-2 text-sm text-muted-foreground">Get FAQs and skill matches instantly.</p>
                  </div>
                  <div className="col-span-3 rounded-2xl bg-brand-blue/10 p-6 transition-colors hover:bg-brand-blue/15">
                    <p className="text-sm font-semibold text-brand-blue inline-flex items-center gap-2"><Clock className="h-4 w-4"/> Your schedule, connected</p>
                    <p className="text-xs text-muted-foreground">Toggle availability and let others know when to connect.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-brand-blue/90" />
            <h3 className="mt-4 font-semibold">Peer Learning</h3>
            <p className="mt-1 text-sm text-muted-foreground">Connect with students willing to teach real skills — from Figma to DSA.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-brand-sky/90" />
            <h3 className="mt-4 font-semibold">Faculty Access</h3>
            <p className="mt-1 text-sm text-muted-foreground">Mentorship and consultation hours from your campus faculty.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-brand-pink/90" />
            <h3 className="mt-4 font-semibold">AI Assistant</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get quick answers and suggestions tailored to your skills.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-8">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Active students" value={publicStats?.users.active} />
          <StatCard label="Total users" value={publicStats?.users.total} />
          <StatCard label="Skills listed" value={publicStats?.skills.total} />
          <StatCard label="Sessions completed" value={publicStats?.sessions.completed} />
        </div>
      </section>

      {/* How it works */}
      <section className="container py-8">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-brand-sky/5 p-5 animate-fade-in-up">
            <p className="text-sm font-medium text-brand-blue">1. Create profile</p>
            <p className="mt-1 text-sm text-muted-foreground">Add skills to teach and learn, plus LinkedIn.</p>
          </div>
          <div className="rounded-2xl border bg-brand-sky/5 p-5 animate-fade-in-up animate-delay-1">
            <p className="text-sm font-medium text-brand-blue">2. Set availability</p>
            <p className="mt-1 text-sm text-muted-foreground">Toggle Online or On-campus and time slots.</p>
          </div>
          <div className="rounded-2xl border bg-brand-sky/5 p-5 animate-fade-in-up animate-delay-2">
            <p className="text-sm font-medium text-brand-blue">3. Connect & learn</p>
            <p className="mt-1 text-sm text-muted-foreground">Use Skill Explorer to find a match and start.</p>
          </div>
        </div>
      </section>

      {/* Featured skills */}
      <section className="container py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured skills</h2>
          <Button asChild variant="secondary"><Link to="/explorer">View all</Link></Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(popularSkills || []).map((s: any) => (
            <Link key={s._id} to={`/explorer?q=${encodeURIComponent(s.name)}`} className="inline-flex items-center rounded-full bg-brand-sky/10 text-brand-blue px-3 py-1 text-xs ring-1 ring-brand-blue/20 hover:bg-brand-sky/20 transition-transform hover:-translate-y-0.5">
              {s.name}
            </Link>
          ))}
          {!popularSkills && (
            <div className="text-sm text-muted-foreground">Loading popular skills...</div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-6">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl bg-brand-blue p-6 text-white">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold">Ready to level up your skills?</h2>
                <p className="text-white/90">Find mentors, set availability, and start learning today.</p>
              </div>
              <Button asChild variant="secondary" className="bg-white text-brand-blue hover:bg-white/90">
                <Link to="/explorer">Browse Skill Explorer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    if (typeof value !== 'number') return;
    const duration = 600;
    const steps = 24;
    const increment = value / steps;
    let current = 0;
    setDisplay(0);
    const id = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(id);
  }, [value]);
  return (
    <div className="rounded-2xl border bg-white p-5 text-center">
      <p className="text-3xl font-extrabold text-brand-blue">{typeof value === 'number' ? display : '--'}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
