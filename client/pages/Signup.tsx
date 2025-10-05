import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function isStrongPassword(pw: string) {
  const lengthOk = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  return { lengthOk, hasUpper, hasLower, hasNumber, hasSymbol, ok: lengthOk && hasUpper && hasLower && hasNumber && hasSymbol };
}

export default function Signup() {
  const [password, setPassword] = useState("");
  const strength = useMemo(() => isStrongPassword(password), [password]);
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!strength.ok) {
      toast({ title: "Weak password", description: "Use 8+ chars with uppercase, lowercase, number, and symbol." });
      return;
    }
    toast({ title: "Account created", description: "Please log in to continue." });
    navigate("/auth");
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-48 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-lavender/30" />
        <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full blur-3xl bg-brand-sky/30" />
      </div>
      <div className="container py-16 md:py-20">
        <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-2 items-stretch">
          <Card className="order-2 md:order-1">
            <CardHeader className="relative">
              <div className="absolute inset-x-0 -top-6 mx-6 rounded-xl bg-gradient-to-r from-brand-blue to-brand-sky p-4 text-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/20" />
                  <div>
                    <p className="text-sm/5 font-semibold">Create your account</p>
                    <p className="text-xs/4 text-white/80">Use your college email to sign up</p>
                  </div>
                </div>
              </div>
              <CardTitle className="sr-only">Create your account</CardTitle>
              <CardDescription className="sr-only">Use your college email to sign up</CardDescription>
            </CardHeader>
            <CardContent className="pt-10">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" type="text" required autoComplete="given-name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" type="text" required autoComplete="family-name" />
                </div>
                <div>
                  <Label htmlFor="email">College email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@college.edu" />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile number</Label>
                  <Input id="mobile" name="mobile" type="tel" inputMode="tel" required placeholder="+91 98765 43210" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby="password-help"
                  />
                  <div id="password-help" className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className={`rounded-lg border px-2 py-1 ${strength.lengthOk ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>8+ chars</div>
                    <div className={`rounded-lg border px-2 py-1 ${strength.hasUpper ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>Uppercase</div>
                    <div className={`rounded-lg border px-2 py-1 ${strength.hasLower ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>Lowercase</div>
                    <div className={`rounded-lg border px-2 py-1 ${strength.hasNumber ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>Number</div>
                    <div className={`col-span-2 rounded-lg border px-2 py-1 ${strength.hasSymbol ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"}`}>Symbol</div>
                  </div>
                </div>
                <Button type="submit" variant="default" className="w-full" disabled={!strength.ok}>Sign Up</Button>
                <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/auth" className="text-brand-blue hover:underline">Log in</Link></p>
              </form>
            </CardContent>
          </Card>

          <div className="order-1 md:order-2 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="rounded-xl bg-gradient-to-br from-brand-lavender/40 via-brand-sky/40 to-brand-pink/40 p-6">
              <h2 className="text-xl font-semibold text-brand-blue">Why join SkillConnect?</h2>
              <ul className="mt-4 space-y-3 text-sm text-foreground/80">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-green" /> Campus-verified emails</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-sky" /> Find peers and faculty mentors</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-pink" /> Real-time availability</li>
              </ul>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border bg-white/70 p-3">
                  <p className="text-2xl font-extrabold text-brand-blue">1.2k+</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="rounded-xl border bg-white/70 p-3">
                  <p className="text-2xl font-extrabold text-brand-blue">350+</p>
                  <p className="text-xs text-muted-foreground">Skills</p>
                </div>
                <div className="rounded-xl border bg-white/70 p-3">
                  <p className="text-2xl font-extrabold text-brand-blue">2.8k</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
