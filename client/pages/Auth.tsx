import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") || "").toString().trim();
    const password = (fd.get("password") || "").toString();

    try {
      const saved = localStorage.getItem("sc_user");
      if (!saved) {
        toast({ title: "No account found", description: "Please sign up first." });
        return;
      }
      const user = JSON.parse(saved);
      if (user.email !== email || user.password !== password) {
        toast({ title: "Invalid credentials", description: "Check your email and password." });
        return;
      }
      localStorage.setItem("sc_session", JSON.stringify({ firstName: user.firstName, email: user.email }));
      toast({ title: `Welcome, ${user.firstName}!` });
      navigate("/home");
    } catch {
      toast({ title: "Login error", description: "Please try again." });
    }
  }

  return (
    <section>
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to SkillConnect</h1>
            <p className="text-sm text-muted-foreground">Login with your institute email</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" placeholder="you@mitsgwl.ac.in" required />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input id="password" name="password" type="password" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" placeholder="••••••••" required />
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
