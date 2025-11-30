import SkillCard, { SkillProfile } from "@/components/SkillCard";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { skillsAPI, userAPI, type Skill, type User } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterChip } from "@/components/ui/filter-chip";
import { SortDropdown, type SortOption } from "@/components/ui/sort-dropdown";
import { Search, GraduationCap, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

export default function Explorer() {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"all" | "online" | "on-campus">("all");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("best-match");
  const [showFacultyOnly, setShowFacultyOnly] = useState(false);
  const [page, setPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearch(q);
  }, [location.search]);

  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ["skills", search],
    queryFn: async () => {
      const params: any = { limit: 50 };
      const q = search.trim();
      if (q.length >= 2) params.search = q;
      const response = await skillsAPI.getAll(params);
      // Add user count from backend if available, or get counts from users query
      const skills = response.data.data.skills;
      if (!skills[0]?.userCount) {
        const usersPromises = skills.map(async (skill: Skill) => {
          const users = await userAPI.getUsersBySkill(skill._id)
            .then(r => r.data.data.users);
          return { ...skill, userCount: users.length };
        });
        return Promise.all(usersPromises);
      }
      return skills;
    },
  });

  // Categories for filter chips
  const { data: categoriesResp } = useQuery({
    queryKey: ["skill-categories"],
    queryFn: () => skillsAPI.getCategories().then(r => r.data.data),
  });
  const categories = categoriesResp ?? [] as string[];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const topSkills = useMemo(() => (skillsData ?? []).slice(0, 12), [skillsData]);

  const { data: usersForSkill } = useQuery({
    enabled: !!selectedSkillId,
    queryKey: ["users-by-skill", selectedSkillId],
    queryFn: () => userAPI.getUsersBySkill(selectedSkillId as string).then((r) => r.data.data.users),
  });

  const results: SkillProfile[] = useMemo(() => {
    const users = usersForSkill ?? [];
    return users
      .filter((u: User) => {
        if (mode === "all") return true;
        if (mode === "online") return (u as any).availabilityMode === "online";
        return (u as any).availabilityMode === "on-campus";
      })
      .map((u: User) => ({
        name: u.fullName,
        role: u.role === 'faculty' ? 'Faculty' : 'Student',
        skills: (u.skillsOffered || []).map((s: any) => s.name),
        available: !!(u as any).isAvailable,
        mode: ((u as any).availabilityMode === 'on-campus' ? 'On-campus' : 'Online') as SkillProfile["mode"],
        linkedin: u.linkedin,
        email: u.email,
        verified: !!u.isVerified || u.role === 'faculty',
      }));
  }, [usersForSkill, mode]);

  return (
    <section className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find mentors and peers</h1>
        <p className="text-muted-foreground mt-2">Search by skill, filter by availability, and connect instantly.</p>
      </div>

      {selectedSkillId && (
        <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          {showFacultyOnly ? (
            <span>Showing faculty mentors available this week</span>
          ) : (
            <span>Showing mentors and peers available this week</span>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card/95 dark:bg-card/80 p-4 md:p-5 shadow-lg/40">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills, e.g. Figma, Python"
                className="w-full rounded-xl border border-border/60 bg-background/80 dark:bg-background/40 pl-10 pr-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-shadow hover:shadow-md"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <SortDropdown value={sortOption} onChange={setSortOption} />
              </div>
            </div>
            
            <AnimatePresence>
              {topSkills.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {topSkills.map((s) => (
                    <TooltipProvider key={s._id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FilterChip
                            label={s.name}
                            selected={selectedSkillId === s._id}
                            onClick={() => setSelectedSkillId(s._id)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {s.userCount || 0} users offer this skill
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="Online"
              selected={mode === 'online'}
              onClick={() => setMode('online')}
            />
            <FilterChip
              label="On-campus"
              selected={mode === 'on-campus'}
              onClick={() => setMode('on-campus')}
            />
            <FilterChip
              label="All"
              selected={mode === 'all'}
              onClick={() => setMode('all')}
            />
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "ml-2 gap-2 transition-colors border-border/70 bg-background/70 dark:bg-background/40",
                showFacultyOnly && "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-200/20 dark:text-amber-200"
              )}
              onClick={() => setShowFacultyOnly(!showFacultyOnly)}
            >
              <GraduationCap className="h-4 w-4" />
              Faculty Only
            </Button>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="mt-4">
          {!categoriesResp && skillsLoading && (
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          )}
          {categories.length > 0 && (
            <motion.div 
              initial={false}
              className="flex flex-wrap gap-2"
            >
              <FilterChip
                label="All categories"
                selected={selectedCategory === null}
                onClick={() => setSelectedCategory(null)}
              />
              {categories.map((c) => (
                <FilterChip
                  key={c}
                  label={c.replace('-', ' ')}
                  selected={selectedCategory === c}
                  onClick={() => setSelectedCategory(c === selectedCategory ? null : c)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <motion.div 
        layout
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {results
            .filter(p => !showFacultyOnly || p.role === "Faculty")
            .slice(0, page * 9)
            .map((p) => (
              <motion.div
                key={p.name + p.mode}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <SkillCard profile={p} />
              </motion.div>
            ))}
        </AnimatePresence>
        
        {selectedSkillId && results.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            No users found for this skill and filters.
          </motion.div>
        )}
        
        {!selectedSkillId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            Select a skill to see matching users.
          </motion.div>
        )}

        {results.length > page * 9 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex justify-center mt-4"
          >
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              className="gap-2"
            >
              Load more results
              <BarChart2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
