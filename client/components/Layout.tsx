import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

function NavItem({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <NavLink
      to={to}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground",
        active && "bg-secondary text-foreground"
      )}
    >
      {label}
    </NavLink>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brand-gradient" />
          <span className="text-lg font-bold tracking-tight">SkillConnect</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/explorer" label="Skill Explorer" />
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/chatbot" label="Chatbot" />
          <NavItem to="/profile" label="Profile" />
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild variant="gradient" className="">
            <Link to="/explorer">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container py-10 grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-brand-gradient" />
            <span className="font-semibold">SkillConnect</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Learn and share skills across campus. Real-time availability. Peer & faculty mentorship.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Product</p>
          <ul className="space-y-1">
            <li><Link to="/explorer" className="hover:text-foreground">Skill Explorer</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/chatbot" className="hover:text-foreground">Chatbot</Link></li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Legal</p>
          <ul className="space-y-1">
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-xs text-muted-foreground flex items-center justify-between">
          <p>© {new Date().getFullYear()} SkillConnect. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-green" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
