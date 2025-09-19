import SkillCard, { SkillProfile } from "@/components/SkillCard";
import { Button } from "@/components/ui/button";

const mock: SkillProfile[] = [
  { name: "Aarav Sharma", role: "Student", skills: ["Figma UI", "React"], available: true, mode: "Online", linkedin: "https://linkedin.com" },
  { name: "Priya Verma", role: "Faculty", skills: ["Data Science", "Python"], available: false, mode: "On-campus" },
  { name: "Rahul Mehta", role: "Student", skills: ["C++", "DSA"], available: true, mode: "On-campus" },
  { name: "Neha Gupta", role: "Student", skills: ["Video Editing", "Premiere Pro"], available: true, mode: "Online" },
];

export default function Explorer() {
  return (
    <section className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find mentors and peers</h1>
        <p className="text-muted-foreground mt-2">Search by skill, filter by availability, and connect instantly.</p>
      </div>

      <div className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              placeholder="Search skills, e.g. Figma, Python"
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Online</Button>
            <Button variant="secondary">On-campus</Button>
            <Button variant="gradient">Filters</Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mock.map((p) => (
          <SkillCard key={p.name} profile={p} />
        ))}
      </div>
    </section>
  );
}
