import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SkillItem { id: string; name: string; level: string; category: string; description: string; }
interface AvailabilitySlot { day: string; start: string; end: string; }

export default function Availability() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([
    { day: "Mon", start: "", end: "" },
    { day: "Tue", start: "", end: "" },
    { day: "Wed", start: "", end: "" },
    { day: "Thu", start: "", end: "" },
    { day: "Fri", start: "", end: "" },
    { day: "Sat", start: "", end: "" },
    { day: "Sun", start: "", end: "" },
  ]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("sc_skills");
      if (s) setSkills(JSON.parse(s));
      const a = localStorage.getItem("sc_availability");
      if (a) setSlots(JSON.parse(a));
    } catch {}
  }, []);

  function saveSkills(next: SkillItem[]) {
    setSkills(next);
    try { localStorage.setItem("sc_skills", JSON.stringify(next)); } catch {}
  }
  function saveAvailability(next: AvailabilitySlot[]) {
    setSlots(next);
    try { localStorage.setItem("sc_availability", JSON.stringify(next)); } catch {}
  }

  function addSkill(e: React.FormEvent) {
    e.preventDefault();
    const newItem: SkillItem = { id: crypto.randomUUID(), name: name.trim(), level, category: category.trim(), description: description.trim() };
    if (!newItem.name) return;
    const next = [newItem, ...skills];
    saveSkills(next);
    setName(""); setLevel("Beginner"); setCategory(""); setDescription("");
    toast({ title: "Skill added", description: `${newItem.name} saved.` });
  }

  function updateSlot(idx: number, key: keyof AvailabilitySlot, value: string) {
    const next = slots.map((s, i) => i === idx ? { ...s, [key]: value } : s);
    saveAvailability(next);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-48 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-lavender/30" />
        <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-sky/30" />
      </div>
      <div className="container pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Skill</CardTitle>
              <CardDescription>Share a skill you can teach</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={addSkill}>
                <div>
                  <Label htmlFor="skill-name">Skill name</Label>
                  <Input id="skill-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="React, Figma, DSA" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <select id="level" className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Design, Coding, Editing" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <textarea id="desc" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will you teach?" />
                </div>
                <Button type="submit" className="w-full">Save skill</Button>
              </form>
              <div className="mt-6">
                <p className="text-sm font-medium">Your skills</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {skills.length === 0 && <li className="text-muted-foreground">No skills yet.</li>}
                  {skills.map((s) => (
                    <li key={s.id} className="rounded-xl border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.level}</span>
                      </div>
                      {s.category && <div className="text-xs text-muted-foreground">{s.category}</div>}
                      {s.description && <div className="mt-1 text-sm">{s.description}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Set weekly time windows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slots.map((slot, idx) => (
                  <div key={slot.day} className="grid grid-cols-[60px,1fr,1fr] items-center gap-3">
                    <div className="text-sm font-medium">{slot.day}</div>
                    <Input type="time" value={slot.start} onChange={(e) => updateSlot(idx, "start", e.target.value)} />
                    <Input type="time" value={slot.end} onChange={(e) => updateSlot(idx, "end", e.target.value)} />
                  </div>
                ))}
              </div>
              <Button type="button" variant="secondary" className="mt-4" onClick={() => toast({ title: "Availability saved" })}>Save availability</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
