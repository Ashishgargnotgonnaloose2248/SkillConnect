import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Brand from "@/components/Brand";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Shield,
  Calendar,
  Target,
  Moon,
  Sun,
  Search,
  GraduationCap,
  FolderKanban
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon?: any }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground",
          isActive && "bg-secondary text-foreground"
        )
      }
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </NavLink>
  );
}

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const submitSearch = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`/explorer?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/80">
      <div className="container flex h-16 items-center gap-3 justify-between">
        <Brand size="lg" />
        
        {isAuthenticated ? (
          <>
            <nav className="hidden md:flex items-center gap-2 lg:gap-3">
              <NavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
              <NavItem to="/explorer" label="Explore" icon={BookOpen} />
              <NavItem to="/projects" label="Projects" icon={FolderKanban} />
              <NavItem to="/sessions" label="Sessions" icon={Calendar} />
              <NavItem to="/skills" label="Skills" icon={Target} />
              {user?.role === 'faculty' && (
                <NavItem to="/faculty-dashboard" label="Faculty" icon={Shield} />
              )}
              <NavItem to="/connect-faculty" label="Connect Faculty" icon={GraduationCap} />
              <NavItem to="/profile" label="Profile" icon={User} />
              {user?.role === 'admin' && (
                <NavItem to="/admin" label="Admin" icon={Shield} />
              )}
            </nav>
            
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Global Search */}
              <div className="hidden md:flex items-center gap-2 lg:gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                    placeholder="Search skills, users, sessions..."
                    className="pl-8 w-[280px]"
                  />
                </div>
                <Button size="sm" onClick={submitSearch}>
                  Search
                </Button>
              </div>

              {/* Theme Toggle */}
              <div className="hidden md:flex items-center gap-2">
                <Sun className={cn("h-4 w-4", !dark ? "text-primary" : "text-muted-foreground")} />
                <Switch checked={dark} onCheckedChange={setDark} aria-label="Toggle dark mode" />
                <Moon className={cn("h-4 w-4", dark ? "text-primary" : "text-muted-foreground")} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.fullName} />
                      <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'faculty' && (
                    <DropdownMenuItem asChild>
                      <Link to="/faculty-dashboard" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Faculty Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/connect-faculty" className="flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Connect to Faculty
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild variant="default">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 text-foreground">
      <div className="container py-10 grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <Brand size="md" />
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
      <div className="border-t border-border/70">
        <div className="container py-4 text-xs text-muted-foreground flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SkillConnect. Built with ❤ at MITS Gwalior.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-green" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground app-bg">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
