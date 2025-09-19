import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-48 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-lavender/30" />
          <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-sky/30" />
        </div>
        <div className="container pb-20 pt-14 md:pb-28 md:pt-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                <span className="inline-flex h-2 w-2 rounded-full bg-brand-green" />
                Real-time availability
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                Learn and share skills on campus
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                SkillConnect helps students and faculty connect for peer-to-peer learning, mentorship, and real-time sessions.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild variant="gradient" className="h-12 px-6">
                  <Link to="/explorer">Explore Skills</Link>
                </Button>
                <Button asChild variant="secondary" className="h-12 px-6">
                  <Link to="/auth">Login / Signup</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-pink" /> Friendly community</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-sky" /> Online + On-campus</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-green" /> Verified emails</div>
              </div>
            </div>
            <div>
              <div className="relative mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                <div className="absolute -inset-1 -z-10 rounded-3xl bg-brand-gradient opacity-20 blur-md" />
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
                  <div className="col-span-3 rounded-2xl bg-gradient-to-r from-brand-purple/15 to-brand-blue/15 p-5">
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
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue" />
            <h3 className="mt-4 font-semibold">Peer Learning</h3>
            <p className="mt-1 text-sm text-muted-foreground">Connect with students willing to teach real skills — from Figma to DSA.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-brand-sky" />
            <h3 className="mt-4 font-semibold">Faculty Access</h3>
            <p className="mt-1 text-sm text-muted-foreground">Mentorship and consultation hours from your campus faculty.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-brand-pink" />
            <h3 className="mt-4 font-semibold">AI Assistant</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get quick answers and suggestions tailored to your skills.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-8">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-8 text-white">
            <div className="absolute right-[-10%] top-[-40%] h-48 w-48 rounded-full bg-white/20 blur-3xl" />
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold">Ready to level up your skills?</h2>
                <p className="text-white/80">Find mentors, set availability, and start learning today.</p>
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
