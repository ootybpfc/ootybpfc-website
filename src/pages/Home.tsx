import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, ChevronRight, Images, MapPin, Newspaper, ShieldCheck, Trophy, UserCog } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { PublicSummary } from "@/lib/types";

function fmtEvent(dateIso: string, tz: string) {
  return new Date(dateIso).toLocaleString("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: tz });
}
function fmtDay(value: string) {
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default function Home() {
  const { user } = useSession();
  const { data, isError } = useQuery<PublicSummary>({ queryKey: ["public", "summary"], queryFn: () => apiGet<PublicSummary>("/public/summary") });
  const live = !isError && data ? data : null;
  const portalHref = user ? (user.role === "admin" ? "/admin" : "/portal") : "/login";
  const jersey = (live?.sponsors ?? []).find((s) => s.tier === "jersey") ?? null;
  const otherSponsors = (live?.sponsors ?? []).filter((s) => s.tier !== "jersey");
  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-2xl border border-border bg-navy-deep pitch-grid" data-testid="home-hero">
        <div className="absolute inset-x-0 top-0 h-1 club-stripe" />
        <div className="relative grid items-center gap-8 p-6 md:grid-cols-[auto_1fr] md:gap-10 md:p-12">
          <img src="/crest.png" alt="Ooty Black Pearl FC crest" className="h-28 w-auto drop-shadow-[0_8px_24px_rgba(206,32,39,0.35)] md:h-40" data-testid="home-crest" />
          <div className="animate-pearl-rise">
            <Badge className="border-crimson/40 bg-crimson-soft text-crimson-bright" data-testid="home-hero-badge">Season 2026 · Canada &amp; USA</Badge>
            <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-[0.95] tracking-tighter text-white md:text-6xl">Ooty Black<br />Pearl <span className="text-crimson-bright">FC</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">A guardian-first football academy. Build your player's profile, book academy classes and follow every league fixture from one portal.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={portalHref} className="inline-flex h-12 items-center gap-2 rounded-md bg-crimson px-6 text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.02]" data-testid="home-portal-cta">
                {user ? "Go to my portal" : "Create or manage my profile"}<ArrowRight className="size-4" />
              </Link>
              <Link to="/standings" className="inline-flex h-12 items-center rounded-md border border-border px-6 text-sm font-semibold text-white transition-colors duration-150 hover:border-crimson/50" data-testid="home-standings-cta">League table</Link>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section data-testid="home-classes">
          <SectionTitle icon={<CalendarDays className="size-4" />} title="Upcoming academy classes" action={{ to: "/events", label: "Full schedule" }} />
          <div className="mt-4 space-y-3">
            {live && live.upcoming_events.length > 0 ? live.upcoming_events.map((e) => (
              <Card key={e.id} className="border-border transition-colors duration-200 hover:border-crimson/40">
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-semibold" data-testid={`home-event-title-${e.id}`}>{e.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3 shrink-0" /><span className="truncate">{e.location} · {e.org_name}</span></p>
                    <p className="mt-2 font-mono text-xs text-crimson-bright">{fmtEvent(e.starts_at, e.venue_timezone)}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 uppercase">{e.kind}</Badge>
                </CardContent>
              </Card>
            )) : <p className="text-sm text-muted-foreground" data-testid="home-classes-empty">The next block of academy classes will be published here.</p>}
          </div>
        </section>
        <section data-testid="home-fixtures">
          <SectionTitle icon={<Trophy className="size-4" />} title="League game details" action={{ to: "/standings", label: "Standings" }} />
          <div className="mt-4 space-y-3">
            {live && live.fixtures.length > 0 ? live.fixtures.map((f) => (
              <Card key={f.id} className="border-border" data-testid={`home-fixture-${f.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground"><span>{f.league_name}</span><span className="font-mono">{fmtDay(f.kickoff)}</span></div>
                  <div className="mt-3 flex items-center justify-between gap-3"><TeamBadge name={f.home_team} logo={f.home_logo} /><span className="shrink-0 font-heading text-xs font-bold uppercase text-crimson-bright">vs</span><TeamBadge name={f.away_team} logo={f.away_logo} align="right" /></div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" /> {f.venue}</p>
                </CardContent>
              </Card>
            )) : <p className="text-sm text-muted-foreground" data-testid="home-fixtures-empty">Fixtures will appear here once the league schedule is confirmed.</p>}
          </div>
        </section>
      </div>
      <section className="mt-10" data-testid="home-profile-cta">
        <Card className="border-crimson/30 bg-navy-soft">
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-crimson/15 text-crimson-bright"><UserCog className="size-5" /></span>
              <div>
                <h2 className="font-heading text-lg font-bold tracking-tight">Your player profile, in three steps</h2>
                <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li>1 · Sign in with a 6-digit code — no password to remember</li>
                  <li>2 · Complete the profile: bio, position, waiver, emergency &amp; medical details</li>
                  <li>3 · RSVP to classes and upload match photos for coach approval</li>
                </ol>
              </div>
            </div>
            <Link to={portalHref} className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-md bg-crimson px-6 text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.02] md:self-auto" data-testid="home-profile-cta-link">{user ? "Manage profile" : "Get started"}<ArrowRight className="size-4" /></Link>
          </CardContent>
        </Card>
      </section>
      <section className="mt-10" data-testid="home-programs">
        <SectionTitle icon={<ShieldCheck className="size-4" />} title="Training programs" action={{ to: "/programs", label: "All programs" }} />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(live?.programs ?? []).map((p) => (
            <Card key={p.id} className="flex flex-col overflow-hidden border-border transition-colors duration-200 hover:border-crimson/40" data-testid={`home-program-${p.id}`}>
              <div className="flex h-32 items-center justify-center bg-navy-deep/60">{p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-20 w-auto object-contain" /> : <ShieldCheck className="size-10 text-crimson-bright/60" />}</div>
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2"><h3 className="font-heading text-base font-semibold">{p.name}</h3><Badge className="shrink-0 border-crimson/40 bg-crimson-soft text-crimson-bright">{p.age_range}</Badge></div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.summary}</p>
                <ul className="mt-4 space-y-1.5">{p.highlights.map((h) => <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground"><ChevronRight className="mt-0.5 size-3 shrink-0 text-crimson-bright" />{h}</li>)}</ul>
                <Link to={`/programs/${p.id}/signup`} className="mt-5 inline-flex h-11 items-center justify-center rounded-md border border-crimson/40 text-sm font-semibold text-crimson-bright transition-colors duration-150 hover:bg-crimson-soft" data-testid={`home-program-register-${p.id}`}>Register &amp; pay</Link>
              </CardContent>
            </Card>
          ))}
          {!live ? <p className="text-sm text-muted-foreground" data-testid="home-programs-empty">Training programs loading…</p> : null}
        </div>
      </section>
      <footer className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground"><p>Player profiles are guardian-owned. Media is reviewed by a coach or admin before it appears publicly. Registration and match fees are handled inside the portal's Payments tab.</p></footer>
    </AppShell>
  );
}
function TeamBadge({ name, logo, align = "left" }: { name: string; logo: string; align?: "left" | "right" }) {
  return <div className={`flex min-w-0 flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>{logo ? <img src={logo} alt="" loading="lazy" className="size-7 shrink-0 rounded-full border border-border object-cover" /> : null}<span className="truncate text-sm font-medium">{name}</span></div>;
}
function SectionTitle({ icon, title, action }: { icon: React.ReactNode; title: string; action?: { to: string; label: string } }) {
  return <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-crimson-bright">{icon}<h2 className="font-heading text-lg font-bold tracking-tight text-foreground">{title}</h2></div>{action ? <Link to={action.to} className="shrink-0 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-crimson-bright">{action.label} →</Link> : null}</div>;
}
