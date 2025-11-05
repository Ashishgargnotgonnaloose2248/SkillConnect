import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StudentCard, { type Student } from "@/components/StudentCard";

const seed: Student[] = [
  {
    id: "s1",
    name: "Aarav Sharma",
    skills: ["React", "Figma"],
    available: true,
    mode: "Online",
    slots: ["Mon 10:00–12:00", "Wed 16:00–18:00"],
  },
  {
    id: "s2",
    name: "Priya Verma",
    skills: ["Python", "Data Science"],
    available: true,
    mode: "On-campus",
    slots: ["Tue 11:00–13:00", "Thu 15:00–17:00"],
  },
  {
    id: "s3",
    name: "Neha Gupta",
    skills: ["Video Editing"],
    available: false,
    mode: "Online",
    slots: ["Sat 10:00–12:00"],
  },
];

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    try {
      const s = localStorage.getItem("sc_students");
      setStudents(s ? JSON.parse(s) : seed);
    } catch {
      setStudents(seed);
    }
    try {
      const sess = localStorage.getItem("sc_session");
      if (sess) {
        const u = JSON.parse(sess);
        if (u && typeof u.firstName === "string") setFirstName(u.firstName);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sc_students", JSON.stringify(students));
    } catch {}
  }, [students]);

  const availableCount = useMemo(
    () => students.filter((s) => s.available).length,
    [students],
  );

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-48 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-lavender/30" />
        <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-sky/30" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/5 blur-2xl" />
      </div>
      <div className="container pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-blue">
              Students availability
            </h1>
            <p className="text-sm text-muted-foreground">
              {availableCount} available now
              {firstName ? ` • Welcome, ${firstName}` : ""}
            </p>
          </div>
          <Button asChild>
            <Link to="/chats">Messages</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((st) => (
            <StudentCard key={st.id} student={st} />
          ))}
        </div>
      </div>
    </section>
  );
}
