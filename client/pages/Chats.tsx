import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChatRequest { id: string; from: string; to: string; skill: string; message: string; status: "pending" | "accepted" | "rejected"; }

export default function Chats() {
  const [received, setReceived] = useState<ChatRequest[]>([]);
  const [sent, setSent] = useState<ChatRequest[]>([]);

  useEffect(() => {
    try {
      const r = localStorage.getItem("sc_requests_received");
      const s = localStorage.getItem("sc_requests_sent");
      if (r) setReceived(JSON.parse(r));
      if (s) setSent(JSON.parse(s));
    } catch {}
  }, []);

  return (
    <section className="container py-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requests to you</CardTitle>
          </CardHeader>
          <CardContent>
            {received.length === 0 ? (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">No requests yet.</div>
            ) : (
              <ul className="space-y-3">
                {received.map((r) => (
                  <li key={r.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.from} → You</div>
                        <div className="text-sm text-muted-foreground">Skill: {r.skill}</div>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{r.status}</span>
                    </div>
                    {r.message && <p className="mt-2 text-sm">{r.message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests you made</CardTitle>
          </CardHeader>
          <CardContent>
            {sent.length === 0 ? (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">You haven't sent any requests.</div>
            ) : (
              <ul className="space-y-3">
                {sent.map((r) => (
                  <li key={r.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">You → {r.to}</div>
                        <div className="text-sm text-muted-foreground">Skill: {r.skill}</div>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{r.status}</span>
                    </div>
                    {r.message && <p className="mt-2 text-sm">{r.message}</p>}
                  </li>
                ))}
              </ul>
            )}
            <Button className="mt-4" variant="secondary" onClick={() => {
              const sample: ChatRequest = { id: crypto.randomUUID(), from: "You", to: "Aarav", skill: "React", message: "Hi! Can we connect this week?", status: "pending" };
              const next = [sample, ...sent];
              setSent(next);
              try { localStorage.setItem("sc_requests_sent", JSON.stringify(next)); } catch {}
            }}>New sample request</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
