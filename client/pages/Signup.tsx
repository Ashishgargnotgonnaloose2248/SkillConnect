import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <section>
      <div className="container py-20">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">Use your college email to sign up</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
            <Button type="submit" variant="default" className="w-full">Sign Up</Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/auth" className="text-brand-blue hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
