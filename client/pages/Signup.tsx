import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
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
    <section>
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">Use your college email to sign up</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="firstName" className="text-sm font-medium">First name</label>
              <input id="firstName" name="firstName" type="text" required autoComplete="given-name" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium">Last name</label>
              <input id="lastName" name="lastName" type="text" required autoComplete="family-name" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">College email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" />
            </div>
            <div>
              <label htmlFor="mobile" className="text-sm font-medium">Mobile number</label>
              <input id="mobile" name="mobile" type="tel" required inputMode="tel" className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none" />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                aria-describedby="password-help"
              />
              <p id="password-help" className="mt-2 text-xs text-muted-foreground">
                Must include: <span className={strength.lengthOk ? "text-green-600" : "text-red-600"}>8+ chars</span>,
                <span className="mx-1">/</span>
                <span className={strength.hasUpper ? "text-green-600" : "text-red-600"}>uppercase</span>,
                <span className="mx-1">/</span>
                <span className={strength.hasLower ? "text-green-600" : "text-red-600"}>lowercase</span>,
                <span className="mx-1">/</span>
                <span className={strength.hasNumber ? "text-green-600" : "text-red-600"}>number</span>,
                <span className="mx-1">/</span>
                <span className={strength.hasSymbol ? "text-green-600" : "text-red-600"}>symbol</span>
              </p>
            </div>
            <Button type="submit" variant="default" className="w-full" disabled={!strength.ok}>Sign Up</Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/auth" className="text-brand-blue hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
