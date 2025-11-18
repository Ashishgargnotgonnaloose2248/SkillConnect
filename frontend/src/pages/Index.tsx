import { Button } from "@/components/ui/button";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { publicAPI, skillsAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Brand from "@/components/Brand";
import { BookOpen, Users, Sparkles, Clock, Rocket, Globe, ArrowRight } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion } from "framer-motion";

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

  const imgWrapRef = React.useRef<HTMLDivElement | null>(null);

  // small, accessible parallax effect for the hero illustration (desktop only)
  React.useEffect(() => {
    const el = imgWrapRef.current;
    if (!el) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isDesktop = () => window.innerWidth >= 768;
    if (!isDesktop()) return;

    // Smooth parallax using lerp to avoid jitter
    let rafId: number | null = null;
    let target = 0;
    let current = 0;

    const updateTarget = () => {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const centerY = rect.top + rect.height / 2;
      const diff = centerY - viewportCenter;
      const factor = 0.02; // even gentler factor
      const max = 12; // smaller clamp for subtle movement
      target = Math.max(Math.min(diff * factor, max), -max);
    };

    const loop = () => {
      // simple linear interpolation (lerp)
      const lerpFactor = 0.08; // stronger smoothing (slower follow)
      current += (target - current) * lerpFactor;
      // apply transform
      el.style.transform = `translateY(${current.toFixed(2)}px)`;
      rafId = requestAnimationFrame(loop);
    };

    const onScroll = () => updateTarget();
    updateTarget();
    rafId = requestAnimationFrame(loop);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateTarget);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateTarget);
      if (el) el.style.transform = '';
    };
  }, []);

  return (
    <>
      {/* Hero */}
    <section className="relative overflow-hidden pt-6 md:pt-10 pb-16">
      <div className="container grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left Text Column */}
          <div>
            <Brand size="xl" className="mb-5" />
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-2.5 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand-green" />
              Real-time availability
            </div>
            <motion.h1 
              className="mt-4 text-5xl font-extrabold tracking-tight leading-tight md:text-6xl max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {isAuthenticated ? `Welcome back, ${user?.fullName}!` : "Connect. Learn. Grow — Together on SkillConnect."}
            </motion.h1>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isAuthenticated 
                ? "Ready to continue your learning journey? Explore new skills or manage your sessions."
                : "A campus-exclusive network where students and faculty exchange skills and knowledge in real-time."
              }
            </motion.p>
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

        {/* Right Feature Cards + Illustration */}
        <div className="w-full flex flex-col items-center md:items-start gap-8 md:gap-10">
          <Dialog>
            <DialogTrigger asChild>
              <motion.button
                type="button"
                ref={imgWrapRef}
                className="relative w-full flex justify-center md:justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                aria-label="Open illustration details"
              >
                <div className="absolute inset-0 mx-auto w-[22rem] md:w-[26rem] rounded-[28px] bg-brand-blue/10 blur-3xl -z-10" aria-hidden="true" />
                <motion.img
                  src="/peergroup.jpg"
                  alt="Students collaborating in a group, sharing skills and working together"
                  className="w-[22rem] md:w-[26rem] rounded-2xl shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.02, rotate: -1 }}
                />
              </motion.button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Peer group learning</DialogTitle>
                <DialogDescription>
                  Visual representation of collaborative learning on SkillConnect. Click below to learn more about our mission.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <img
                  src="/peergroup.jpg"
                  alt="Students collaborating in a group, sharing skills and working together"
                  className="w-full rounded-md object-cover"
                />
              </div>
              <DialogFooter>
                <Button asChild>
                  <Link to="/about">Learn more</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <motion.div
            className="w-full max-w-xl rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur"
            role="region"
            aria-label="Feature highlights"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ staggerChildren: 0.15 }}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                className="rounded-xl bg-brand-lavender/15 px-5 py-4"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-brand-lavender/30 flex items-center justify-center">
                    <Users className="h-4 w-4 text-brand-blue" />
                  </div>
                  <p className="text-sm font-semibold text-brand-blue">Peer Learning</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Find students teaching the skills you need.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl bg-brand-sky/15 px-5 py-4"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-brand-sky/30 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-brand-blue" />
                  </div>
                  <p className="text-sm font-semibold text-brand-blue">Faculty Access</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Consultation slots and mentorship.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl bg-brand-pink/15 px-5 py-4"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-brand-pink/30 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-brand-blue" />
                  </div>
                  <p className="text-sm font-semibold text-brand-blue">AI Assistant</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Get quick answers and suggestions instantly.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl bg-brand-blue/10 px-5 py-4 md:col-span-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-brand-blue/20 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-brand-blue" />
                  </div>
                  <p className="text-sm font-semibold text-brand-blue">Your schedule, connected</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Toggle availability and let others know when to connect.
                </p>
              </motion.div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Peer Learning Card */}
          <Link
            to="/explorer"
            className="group block rounded-2xl border bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up focus:outline-none focus:ring-2 focus:ring-brand-blue"
            aria-label="Explore peer learning"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-sky text-white shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-sky/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-110"></div>
                      <img
                        src="https://img.freepik.com/free-vector/students-studying-together-illustration_23-2148952292.jpg"
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-blue/20 group-hover:ring-brand-blue/40 transition-all transform group-hover:scale-105"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-semibold">Peer Learning</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Connect with students willing to teach real skills — from Figma to DSA.</p>
                </div>
              </div>
              <div className="flex items-center text-brand-blue opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* Faculty Access Card */}
          <Link
            to="/connect-faculty"
            className="group block rounded-2xl border bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up animate-delay-1 focus:outline-none focus:ring-2 focus:ring-brand-sky"
            aria-label="Connect with faculty"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-sky to-brand-lavender text-white shadow-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-sky/20 to-brand-lavender/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-110"></div>
                      <img
                        src="https://img.freepik.com/free-vector/teacher-concept-illustration_114360-1638.jpg"
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-sky/20 group-hover:ring-brand-sky/40 transition-all transform group-hover:scale-105"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-semibold">Faculty Access</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Mentorship and consultation hours from your campus faculty.</p>
                </div>
              </div>
              <div className="flex items-center text-brand-blue opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* AI Assistant Card */}
          <Link
            to="/explorer"
            className="group block rounded-2xl border bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up animate-delay-2 focus:outline-none focus:ring-2 focus:ring-brand-pink"
            aria-label="AI assistant"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink to-brand-purple text-white shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-pink/20 to-brand-purple/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-110"></div>
                      <img
                        src="https://img.freepik.com/free-vector/chat-bot-concept-illustration_114360-5522.jpg"
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-pink/20 group-hover:ring-brand-pink/40 transition-all transform group-hover:scale-105"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-semibold">AI Assistant</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Get quick answers and suggestions tailored to your skills.</p>
                </div>
              </div>
              <div className="flex items-center text-brand-blue opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
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
