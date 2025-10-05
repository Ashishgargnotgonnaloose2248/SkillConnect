import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  const [firstName, setFirstName] = useState<string>("");
  useEffect(() => {
    try {
      const s = localStorage.getItem("sc_session");
      if (s) {
        const u = JSON.parse(s);
        if (u && typeof u.firstName === "string") setFirstName(u.firstName);
      }
    } catch {}
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-48 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-lavender/30" />
        <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-sky/30" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/5 blur-2xl" />
      </div>
      <div className="container pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-brand-blue">Welcome{firstName ? `, ${firstName}` : ""} 👋</h1>
            <p className="text-muted-foreground">Here are some quick actions to get started.</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Explore Skills</CardTitle>
                <CardDescription>Find mentors and sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full"><Link to="/explorer">Open Explorer</Link></Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Update details and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="w-full"><Link to="/profile">Go to Profile</Link></Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Suggested</CardTitle>
                <CardDescription>Recommended for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Coming soon</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
