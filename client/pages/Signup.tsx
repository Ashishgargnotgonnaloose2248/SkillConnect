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
        <div className="absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/5 blur-2xl" />
      </div>
      <div className="container py-16 md:py-20">
        <div className="mx-auto max-w-md">
          <Card>
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
                    <div className={`${strength.lengthOk ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"} rounded-lg border px-2 py-1`}>8+ chars</div>
                    <div className={`${strength.hasUpper ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"} rounded-lg border px-2 py-1`}>Uppercase</div>
                    <div className={`${strength.hasLower ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"} rounded-lg border px-2 py-1`}>Lowercase</div>
                    <div className={`${strength.hasNumber ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"} rounded-lg border px-2 py-1`}>Number</div>
                    <div className={`${strength.hasSymbol ? "border-green-300 bg-green-50 text-green-700" : "border-rose-300 bg-rose-50 text-rose-700"} col-span-2 rounded-lg border px-2 py-1`}>Symbol</div>
                  </div>
                </div>
                <Button type="submit" variant="default" className="w-full" disabled={!strength.ok}>Sign Up</Button>
                <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/auth" className="text-brand-blue hover:underline">Log in</Link></p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
