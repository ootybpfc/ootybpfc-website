import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Shield,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { endSession, ROLE_LABEL, useSession } from "@/lib/session";
import type { MeResponse } from "@/lib/types";

/** Portal tabs — only shown to a signed-in member. */
const TABS = [
  { label: "Feed", icon: Home, route: "/portal" },
  { label: "Events", icon: Calendar, route: "/events" },
  { label: "Programs", icon: GraduationCap, route: "/programs" },
  { label: "Register", icon: ClipboardCheck, route: "/register", staffOnly: true },
  { label: "Roster", icon: Users, route: "/roster" },
  { label: "Payments", icon: CreditCard, route: "/payments" },
  { label: "Admin", icon: Shield, route: "/admin", adminOnly: true },
];

/** Public navigation — a visitor needs somewhere to go before they sign in. */
const PUBLIC_LINKS = [
  { label: "Club", route: "/" },
  { label: "Programs", route: "/programs" },
  { label: "League table", route: "/standings" },
  { label: "Coaching", route: "/coach-signup" },
];

export function Crest({ className }: { className?: string }) {
  return (
    <img
      src="/crest.png"
      alt="Ooty Black Pearl FC crest"
      width={144}
      height={126}
      className={cn("size-9 shrink-0 object-contain", className)}
    />
  );
}

/** Yellow · navy · crimson kit stripe lifted from the crest. */
export function KitStripe({ className }: { className?: string }) {
  return <div aria-hidden className={cn("club-stripe h-[3px] w-full", className)} />;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet on navigation so the overlay never traps the visitor.
  useEffect(() => setMenuOpen(false), [location.pathname]);

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
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <KitStripe className="fixed inset-x-0 top-0 z-50" />

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-300",
          scrolled
            ? "border-border bg-navy-deep/92 backdrop-blur-xl"
            : "border-transparent bg-navy-deep/70 backdrop-blur-md",
        )}
        data-testid="app-header"
      >
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between gap-4 px-4 pt-[3px] md:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            data-testid="header-brand-link"
            aria-label="Ooty Black Pearl FC — home"
          >
            <Crest className="size-10 crest-shadow" />
            {/* The full wordmark needs room; on narrow phones the crest carries the brand
                and a compact monogram stands in, so nothing wraps to two lines. */}
            <span className="min-w-0">
              <span className="block font-heading text-[13px] font-extrabold uppercase leading-none tracking-[0.02em] [word-spacing:0.14em] text-white">
                <span className="hidden whitespace-nowrap sm:inline">Ooty Black Pearl FC</span>
                <span className="sm:hidden">Ooty BPFC</span>
              </span>
              <span className="mt-1.5 block whitespace-nowrap text-[10px] font-semibold uppercase leading-none tracking-[0.28em] text-gold">
                Canada · USA
              </span>
            </span>
          </Link>

          {/* Desktop navigation: portal tabs when signed in, club links when not. */}
          <nav className="hidden items-center gap-1 lg:flex" data-testid="header-nav">
            {(user ? tabs : PUBLIC_LINKS).map((item) => {
              const active = location.pathname === item.route;
              return (
                <Link
                  key={item.route}
                  to={item.route}
                  data-testid={`header-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-[13px] font-semibold transition-colors duration-150",
                    active ? "text-gold" : "text-muted-foreground hover:text-white",
                  )}
                >
                  {item.label}
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gold"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden text-right sm:block">
                  <p
                    className="text-[13px] font-semibold leading-tight text-white"
                    data-testid="header-user-name"
                  >
                    {user.name}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                    {ROLE_LABEL[user.role]}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  aria-label="Sign out"
                  className="text-muted-foreground hover:text-white"
                  data-testid="header-signout-button"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-md bg-crimson px-4 text-[13px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(210,38,48,0.7)] transition-colors duration-150 hover:bg-crimson-bright"
                data-testid="header-login-link"
              >
                <span className="hidden sm:inline">Portal Login</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-white lg:hidden"
              data-testid="header-menu-toggle"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {menuOpen ? (
          <div
            className="border-t border-border bg-navy-deep/98 backdrop-blur-xl lg:hidden"
            data-testid="header-mobile-menu"
          >
            <nav className="mx-auto grid w-full max-w-7xl gap-1 px-4 py-4">
              {(user ? tabs : PUBLIC_LINKS).map((item) => (
                <Link
                  key={item.route}
                  to={item.route}
                  className={cn(
                    "rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                    location.pathname === item.route
                      ? "bg-gold-soft text-gold"
                      : "text-muted-foreground hover:bg-navy-soft hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8 md:py-12",
          user && "pb-28 md:pb-14",
        )}
      >
        {children}
      </main>

      <SiteFooter />

      {/* Mobile portal tab bar for signed-in members */}
      {user ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-50 flex h-[68px] items-center justify-around border-t border-border bg-navy-deep/96 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
          data-testid="bottom-tab-bar"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = location.pathname === t.route;
            return (
              <Link
                key={t.route}
                to={t.route}
                data-testid={`bottom-tab-${t.label.toLowerCase()}`}
                className={cn(
                  "flex h-14 min-w-[58px] flex-col items-center justify-center gap-1 rounded-lg px-2 transition-colors duration-150",
                  active ? "text-gold" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-semibold">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-navy-deep" data-testid="site-footer">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Crest className="size-11 crest-shadow" />
            <span>
              <span className="block font-heading text-sm font-extrabold uppercase leading-none tracking-tight [word-spacing:0.14em] text-white">
                Ooty Black Pearl FC
              </span>
              <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                Est. Canada · USA
              </span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A guardian-first football academy running weekly classes, pickup games and league
            football across Toronto and Chicago.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            Club
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PUBLIC_LINKS.map((l) => (
              <li key={l.route}>
                <Link
                  to={l.route}
                  className="text-muted-foreground transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            Members
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/login" className="text-muted-foreground transition-colors hover:text-gold">
                Portal login
              </Link>
            </li>
            <li>
              <Link
                to="/coach-signup"
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                Apply to coach
              </Link>
            </li>
            <li>
              <Link
                to="/programs"
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                Register a player
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {year} Ooty Black Pearl FC. All rights reserved.</p>
          <p>
            Player profiles are guardian-owned. Uploaded media is reviewed by a coach before it
            appears publicly.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function RequireAuth({
  user,
  isLoading,
  children,
}: {
  user: MeResponse | null;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  if (isLoading)
    return (
      <div className="py-20" data-testid="auth-loading">
        <div className="mx-auto max-w-md space-y-3">
          <div className="h-8 animate-pulse rounded-md bg-navy-soft" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-navy-soft" />
          <div className="h-4 w-1/2 animate-pulse rounded-md bg-navy-soft" />
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="py-20 text-center" data-testid="auth-required">
        <span className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-gold-soft text-gold">
          <UserCheck className="size-6" />
        </span>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          Portal sign-in required
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Sign in with your registered club email and we'll send you a one-time 6-digit code.
        </p>
        <Link
          to="/login"
          className="mt-7 inline-flex h-12 items-center rounded-md bg-crimson px-6 text-sm font-bold text-white transition-colors hover:bg-crimson-bright"
          data-testid="auth-required-login-link"
        >
          Go to portal login
        </Link>
      </div>
    );

  return <>{children}</>;
}
