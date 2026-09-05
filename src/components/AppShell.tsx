import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Home,
  LogOut,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { endSession, ROLE_LABEL, useSession } from "@/lib/session";
import type { MeResponse } from "@/lib/types";

const TABS = [
  { label: "Feed", icon: Home, route: "/portal" },
  { label: "Events", icon: Calendar, route: "/events" },
  { label: "Programs", icon: GraduationCap, route: "/programs" },
  { label: "Register", icon: ClipboardCheck, route: "/register", staffOnly: true },
  { label: "Roster", icon: Users, route: "/roster" },
  { label: "Payments", icon: CreditCard, route: "/payments" },
  { label: "Admin", icon: Shield, route: "/admin", adminOnly: true },
];

export function Crest({ className }: { className?: string }) {
  return (
    <img src="/crest.png" alt="Ooty Black Pearl FC crest" className={cn("size-9 shrink-0 object-contain", className)} />
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const tabs = TABS.filter((t) => {
    if (t.adminOnly && user?.role !== "admin") return false;
    if (t.staffOnly && user?.role !== "coach" && user?.role !== "admin") return false;
    return true;
  });

  async function signOut() {
    await endSession(qc);
    navigate("/");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-10" data-testid="app-header">
        <Link to="/" className="flex items-center gap-3" data-testid="header-brand-link">
          <Crest />
          <span className="font-heading text-sm font-black uppercase leading-none tracking-tight">
            Ooty Black Pearl FC
            <span className="mt-1 block text-[10px] font-medium tracking-[0.22em] text-muted-foreground">CANADA · USA</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" data-testid="header-nav">
          {user ? tabs.map((t) => (
            <Link key={t.route} to={t.route} data-testid={`header-nav-${t.label.toLowerCase()}`}
              className={cn("rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 hover:text-crimson-bright",
                location.pathname === t.route ? "text-crimson-bright" : "text-muted-foreground")}>
              {t.label}
            </Link>
          )) : null}
        </nav>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight" data-testid="header-user-name">{user.name}</p>
              <p className="text-[11px] uppercase tracking-wider text-crimson-bright">{ROLE_LABEL[user.role]}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" data-testid="header-signout-button">
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <Link to="/login" className="inline-flex h-11 items-center rounded-md bg-crimson px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#F3CE66]" data-testid="header-login-link">
            Portal Login
          </Link>
        )}
      </header>
      <main className={cn("mx-auto w-full max-w-6xl px-4 py-6 md:px-8", user && "pb-28 md:pb-12")}>
        {children}
      </main>
      {user ? (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border bg-[#0C1015]/95 px-2 backdrop-blur-xl md:hidden" data-testid="bottom-tab-bar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = location.pathname === t.route;
            return (
              <Link key={t.route} to={t.route} data-testid={`bottom-tab-${t.label.toLowerCase()}`}
                className={cn("flex h-12 min-w-[56px] flex-col items-center justify-center gap-1 rounded-lg px-2 transition-colors duration-150",
                  active ? "text-crimson-bright" : "text-muted-foreground")}>
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}

export function RequireAuth({ user, isLoading, children }: { user: MeResponse | null; isLoading: boolean; children: React.ReactNode }) {
  if (isLoading) return <p className="py-20 text-center text-sm text-muted-foreground" data-testid="auth-loading">Checking your session…</p>;
  if (!user) return (
    <div className="py-20 text-center" data-testid="auth-required">
      <UserCheck className="mx-auto mb-4 size-8 text-crimson-bright" />
      <h2 className="font-heading text-2xl font-bold">Portal sign-in required</h2>
      <p className="mt-2 text-sm text-muted-foreground">Open your bookmarked portal link and verify with a 6-digit code.</p>
      <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-md bg-crimson px-5 text-sm font-semibold text-white" data-testid="auth-required-login-link">Go to portal login</Link>
    </div>
  );
  return <>{children}</>;
}
