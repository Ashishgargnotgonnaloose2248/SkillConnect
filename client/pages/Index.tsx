import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SkillCard, { type SkillProfile } from "@/components/SkillCard";

const featured: SkillProfile[] = [
  { name: "Aarav Sharma", role: "Student", skills: ["Figma UI", "React"], available: true, mode: "Online", linkedin: "https://linkedin.com" },
  { name: "Priya Verma", role: "Faculty", skills: ["Data Science", "Python"], available: true, mode: "On-campus" },
  { name: "Neha Gupta", role: "Student", skills: ["Video Editing"], available: false, mode: "Online" },
];

export default function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-48 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-lavender/30" />
          <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-sky/30" />
        </div>
        <div className="container pb-14 pt-10 md:pb-20 md:pt-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                <span className="inline-flex h-2 w-2 rounded-full bg-brand-green" />
                Real-time availability
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                Learn and share skills on campus
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                SkillConnect helps students and faculty connect for peer-to-peer learning, mentorship, and real-time sessions.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild variant="default" className="h-12 px-6">
                  <Link to="/explorer">Explore Skills</Link>
                </Button>
                <Button asChild variant="secondary" className="h-12 px-6">
                  <Link to="/auth">Login / Signup</Link>
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-pink" /> Friendly community</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-sky" /> Online + On-campus</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-green" /> Verified emails</div>
              </div>
            </div>
            <div>
              <div className="relative mx-auto max-w-md rounded-2xl border bg-white p-5 shadow-sm">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-brand-lavender/20 p-5">
                    <p className="text-xs font-medium text-brand-blue">Peer Learning</p>
                    <p className="mt-2 text-sm text-muted-foreground">Find students teaching the skills you need.</p>
                  </div>
                  <div className="rounded-2xl bg-brand-sky/20 p-5">
                    <p className="text-xs font-medium text-brand-blue">Faculty Access</p>
                    <p className="mt-2 text-sm text-muted-foreground">Consultation slots and mentorship.</p>
                  </div>
                  <div className="rounded-2xl bg-brand-pink/20 p-5">
                    <p className="text-xs font-medium text-brand-blue">AI Assistant</p>
                    <p className="mt-2 text-sm text-muted-foreground">Get FAQs and skill matches instantly.</p>
                  </div>
                  <div className="col-span-3 rounded-2xl bg-brand-blue/10 p-5">
                    <p className="text-sm font-semibold">Your schedule, connected</p>
                    <p className="text-xs text-muted-foreground">Toggle availability and let others know when to connect.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-brand-blue" />
            <h3 className="mt-4 font-semibold">Peer Learning</h3>
            <p className="mt-1 text-sm text-muted-foreground">Connect with students willing to teach real skills — from Figma to DSA.</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-brand-sky" />
            <h3 className="mt-4 font-semibold">Faculty Access</h3>
            <p className="mt-1 text-sm text-muted-foreground">Mentorship and consultation hours from your campus faculty.</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-brand-pink" />
            <h3 className="mt-4 font-semibold">AI Assistant</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get quick answers and suggestions tailored to your skills.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 text-center">
            <p className="text-3xl font-extrabold text-brand-blue">1.2k+</p>
            <p className="text-sm text-muted-foreground">Active students</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 text-center">
            <p className="text-3xl font-extrabold text-brand-blue">350+</p>
            <p className="text-sm text-muted-foreground">Skills listed</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 text-center">
            <p className="text-3xl font-extrabold text-brand-blue">2.8k</p>
            <p className="text-sm text-muted-foreground">Sessions completed</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-8">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm font-medium text-brand-blue">1. Create profile</p>
            <p className="mt-1 text-sm text-muted-foreground">Add skills to teach and learn, plus LinkedIn.</p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm font-medium text-brand-blue">2. Set availability</p>
            <p className="mt-1 text-sm text-muted-foreground">Toggle Online or On-campus and time slots.</p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm font-medium text-brand-blue">3. Connect & learn</p>
            <p className="mt-1 text-sm text-muted-foreground">Use Skill Explorer to find a match and start.</p>
          </div>
        </div>
      </section>

      {/* Featured mentors */}
      <section className="container py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured mentors</h2>
          <Button asChild variant="secondary"><Link to="/explorer">View all</Link></Button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <SkillCard key={p.name} profile={p} />
          ))}
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
