import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export interface Student {
  id: string;
  name: string;
  skills: string[];
  available: boolean;
  slots: string[];
  mode: "Online" | "On-campus";
}

export default function StudentCard({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<string>("Hi! I'd like to connect for a quick session.");
  const [custom, setCustom] = useState<string>("");

  function sendRequest() {
    const message = custom.trim() || template;
    const req = {
      id: crypto.randomUUID(),
      from: "You",
      to: student.name,
      skill: student.skills[0] || "",
      message,
      status: "pending" as const,
    };
    try {
      const s = localStorage.getItem("sc_requests_sent");
      const arr = s ? JSON.parse(s) : [];
      arr.unshift(req);
      localStorage.setItem("sc_requests_sent", JSON.stringify(arr));
    } catch {}
    setOpen(false);
  }

  return (
    <Card className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white font-semibold">
            {student.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
          </div>
          <div>
            <p className="font-semibold leading-tight text-foreground">{student.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Student</span>
              <span>•</span>
              <span>{student.mode}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${student.available ? "bg-brand-green" : "bg-brand-red"}`} />
          <span className="text-xs text-muted-foreground">{student.available ? "Available" : "Offline"}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {student.skills.map((s) => (
          <span key={s} className="inline-flex items-center rounded-full bg-brand-sky/10 text-brand-blue px-2.5 py-1 text-xs ring-1 ring-brand-blue/20">
            {s}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">Availability</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {student.slots.length === 0 ? (
            <span className="text-muted-foreground">Not provided</span>
          ) : (
            student.slots.map((t) => (
              <span key={t} className="rounded-lg border px-2 py-1">{t}</span>
            ))
          )}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 px-4">Connect</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message to {student.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Choose a template</label>
                <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={template} onChange={(e) => setTemplate(e.target.value)}>
                  <option>Hi! I'd like to connect for a quick session.</option>
                  <option>Can we schedule a session this week?</option>
                  <option>I need help with {student.skills[0] || "your skill"}. Are you available?</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Or write a custom message</label>
                <textarea className="mt-1 w-full rounded-md border px-3 py-2 text-sm" rows={4} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Type your message" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={sendRequest}>Send</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
