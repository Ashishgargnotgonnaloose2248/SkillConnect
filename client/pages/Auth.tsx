import { Button } from "@/components/ui/button";

export default function Auth() {
  return (
    <section>
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to SkillConnect</h1>
            <p className="text-sm text-muted-foreground">Login with your institute email</p>
          </div>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" placeholder="you@institute.edu" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" placeholder="••••••••" />
            </div>
            <Button type="submit" variant="default" className="w-full">Continue</Button>
          </form>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button variant="secondary" className="mt-4 w-full">Continue with LinkedIn</Button>
        </div>
      </div>
    </section>
  );
}
