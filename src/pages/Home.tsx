import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Images,
  MapPin,
  Newspaper,
  ShieldCheck,
  Trophy,
  UserCog,
} from "lucide-react";
import AppShell, { Crest } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { Fixture, PublicSummary } from "@/lib/types";

function fmtEvent(dateIso: string, tz: string) {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz || undefined,
  });
}

function fmtDay(value: string) {
  const d = new Date(value.length <= 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * Reveals children as they scroll into view; respects prefers-reduced-motion via CSS.
 *
 * `deps` must change whenever new `.scroll-animate` nodes mount. Several sections only
 * render once the club API responds, and an observer created on mount alone would never
 * see them — leaving those sections permanently invisible.
 */
function useReveal<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".scroll-animate"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      // Reveal well before the section reaches the fold, so a fast scroll never lands on
      // a blank region waiting to animate in.
      { rootMargin: "300px 0px 300px 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export default function Home() {
  const { user } = useSession();
  const { data, isError, isLoading } = useQuery<PublicSummary>({
    queryKey: ["public", "summary"],
    queryFn: () => apiGet<PublicSummary>("/public/summary"),
  });
  const revealRef = useReveal<HTMLDivElement>([isLoading, isError, data]);

  const live = !isError && data ? data : null;
  const portalHref = user ? (user.role === "admin" ? "/admin" : "/portal") : "/login";
  const sponsors = (live?.sponsors ?? []).filter((s) => s.active !== false);
  const jersey = sponsors.find((s) => s.tier === "jersey") ?? null;
  const otherSponsors = sponsors.filter((s) => s.tier !== "jersey");
  const gallery = (live?.gallery ?? []).filter((g) => g.resource_type !== "video").slice(0, 6);
  const news = (live?.news ?? []).slice(0, 3);
  const topOfTable = [...(live?.standings ?? [])].sort((a, b) => b.points - a.points).slice(0, 5);

  return (
    <AppShell>
      <div ref={revealRef}>
        {/* ============ Hero ============ */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border bg-navy stadium-glow"
          data-testid="home-hero"
        >
          <div aria-hidden className="pitch-grid absolute inset-0" />
          <div className="relative grid items-center gap-10 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:p-14">
            <div className="animate-pearl-rise">
              <Badge
                className="border-gold/40 bg-gold-soft font-semibold tracking-wide text-gold"
                data-testid="home-hero-badge"
              >
                Season 2026 · Toronto &amp; Chicago
              </Badge>

              <h1 className="hero-title mt-5 font-heading text-[2.75rem] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-white md:text-[4.25rem]">
                Ooty Black
                <br />
                Pearl <span className="gold-text">FC</span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                A guardian-first football academy. Build your player's profile, book academy
                classes and follow every league fixture from one portal.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={portalHref}
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-crimson px-6 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(210,38,48,0.8)] transition-colors duration-150 hover:bg-crimson-bright"
                  data-testid="home-portal-cta"
                >
                  {user ? "Go to my portal" : "Create or manage my profile"}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/programs"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-gold/45 px-6 text-sm font-bold text-gold transition-colors duration-150 hover:bg-gold-soft"
                  data-testid="home-programs-cta"
                >
                  Browse programs
                </Link>
                <Link
                  to="/standings"
                  className="inline-flex h-12 items-center rounded-md border border-border px-6 text-sm font-semibold text-white transition-colors duration-150 hover:border-white/25"
                  data-testid="home-standings-cta"
                >
                  League table
                </Link>
              </div>

              {/* Club numbers */}
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-7">
                <Stat label="Players registered" value={live?.players_registered} loading={isLoading} />
                <Stat label="Vetted coaches" value={live?.coaches_vetted} loading={isLoading} />
                <Stat label="Club locations" value={2} loading={false} />
              </dl>
            </div>

            <div className="justify-self-center md:justify-self-end">
              <Crest className="h-40 w-auto crest-shadow md:h-64" />
            </div>
          </div>
        </section>

        {/* ============ Classes + fixtures ============ */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <section className="scroll-animate" data-testid="home-classes">
            <SectionTitle
              icon={<CalendarDays className="size-4" />}
              title="Upcoming academy classes"
              action={{ to: "/events", label: "Full schedule" }}
            />
            <div className="mt-5 space-y-3">
              {isLoading ? (
                <SkeletonRows />
              ) : live && live.upcoming_events.length > 0 ? (
                live.upcoming_events.slice(0, 4).map((e) => (
                  <Card
                    key={e.id}
                    className="border-border transition-colors duration-200 hover:border-gold/40"
                  >
                    <CardContent className="flex items-start justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p
                          className="truncate font-heading text-sm font-bold text-white"
                          data-testid={`home-event-title-${e.id}`}
                        >
                          {e.title}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">
                            {e.location} · {e.org_name}
                          </span>
                        </p>
                        <p className="mt-2.5 font-mono text-xs font-medium text-gold">
                          {fmtEvent(e.starts_at, e.venue_timezone)}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 uppercase">
                        {e.kind}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyNote testId="home-classes-empty">
                  The next block of academy classes will be published here.
                </EmptyNote>
              )}
            </div>
          </section>

          <section className="scroll-animate scroll-animate-delay-1" data-testid="home-fixtures">
            <SectionTitle
              icon={<Trophy className="size-4" />}
              title="League game details"
              action={{ to: "/standings", label: "Standings" }}
            />
            <div className="mt-5 space-y-3">
              {isLoading ? (
                <SkeletonRows />
              ) : live && live.fixtures.length > 0 ? (
                live.fixtures.slice(0, 4).map((f) => <FixtureCard key={f.id} fixture={f} />)
              ) : (
                <EmptyNote testId="home-fixtures-empty">
                  Fixtures will appear here once the league schedule is confirmed.
                </EmptyNote>
              )}
            </div>
          </section>
        </div>

        {/* ============ Profile CTA ============ */}
        <section className="mt-14 scroll-animate" data-testid="home-profile-cta">
          <Card className="overflow-hidden border-gold/25 bg-navy-card">
            <div aria-hidden className="club-stripe h-[3px] w-full" />
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
                  <UserCog className="size-5" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-extrabold tracking-tight text-white">
                    Your player profile, in three steps
                  </h2>
                  <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <Step n={1}>Sign in with a 6-digit code — no password to remember</Step>
                    <Step n={2}>
                      Complete the profile: bio, position, waiver, emergency &amp; medical details
                    </Step>
                    <Step n={3}>RSVP to classes and upload match photos for coach approval</Step>
                  </ol>
                </div>
              </div>
              <Link
                to={portalHref}
                className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-md bg-crimson px-6 text-sm font-bold text-white transition-colors duration-150 hover:bg-crimson-bright md:self-auto"
                data-testid="home-profile-cta-link"
              >
                {user ? "Manage profile" : "Get started"}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* ============ Programs ============ */}
        <section className="mt-14 scroll-animate" data-testid="home-programs">
          <SectionTitle
            icon={<ShieldCheck className="size-4" />}
            title="Training programs"
            action={{ to: "/programs", label: "All programs" }}
          />
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (live?.programs ?? []).length > 0 ? (
              (live?.programs ?? []).slice(0, 3).map((p) => (
                <Card
                  key={p.id}
                  className="flex flex-col overflow-hidden border-border transition-colors duration-200 hover:border-gold/40"
                  data-testid={`home-program-${p.id}`}
                >
                  <div className="flex h-36 items-center justify-center border-b border-border bg-navy-deep/70">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        className="h-24 w-auto object-contain"
                      />
                    ) : (
                      <ShieldCheck className="size-10 text-gold/50" />
                    )}
                  </div>
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-base font-bold text-white">{p.name}</h3>
                      <Badge className="shrink-0 border-gold/40 bg-gold-soft text-gold">
                        {p.age_range}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.summary}</p>
                    <ul className="mt-4 mb-6 space-y-2">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ChevronRight className="mt-0.5 size-3 shrink-0 text-gold" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/programs/${p.id}/signup`}
                      className="mt-auto inline-flex h-11 items-center justify-center rounded-md border border-gold/45 pt-px text-sm font-bold text-gold transition-colors duration-150 hover:bg-gold-soft"
                      data-testid={`home-program-register-${p.id}`}
                    >
                      Register &amp; pay
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyNote testId="home-programs-empty" className="md:col-span-3">
                Training programs will be published here shortly.
              </EmptyNote>
            )}
          </div>
        </section>

        {/* ============ Top of the table ============ */}
        {topOfTable.length > 0 ? (
          <section className="mt-14 scroll-animate" data-testid="home-table">
            <SectionTitle
              icon={<Trophy className="size-4" />}
              title="Top of the table"
              action={{ to: "/standings", label: "Full table" }}
            />
            <Card className="mt-5 overflow-hidden border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-navy-soft/60 text-left">
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        #
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Team
                      </th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        P
                      </th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        W
                      </th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        D
                      </th>
                      <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        L
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gold">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topOfTable.map((row, i) => (
                      <tr
                        key={row.id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-navy-soft/40"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="flex min-w-0 items-center gap-2.5">
                            {row.logo_url ? (
                              <img
                                src={row.logo_url}
                                alt=""
                                loading="lazy"
                                className="size-6 shrink-0 rounded-full border border-border object-cover"
                              />
                            ) : null}
                            <span className="truncate font-medium text-white">{row.team_name}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">
                          {row.played}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-xs text-pitch">
                          {row.wins}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">
                          {row.draws}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-xs text-crimson-bright">
                          {row.losses}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-bold text-gold">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        ) : null}

        {/* ============ News ============ */}
        {news.length > 0 ? (
          <section className="mt-14 scroll-animate" data-testid="home-news">
            <SectionTitle icon={<Newspaper className="size-4" />} title="Club news" />
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {news.map((n) => (
                <Card
                  key={n.id}
                  className="flex flex-col overflow-hidden border-border transition-colors hover:border-gold/40"
                  data-testid={`home-news-${n.id}`}
                >
                  {n.image_url ? (
                    <img
                      src={n.image_url}
                      alt=""
                      loading="lazy"
                      className="h-40 w-full border-b border-border object-cover"
                    />
                  ) : null}
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      {n.category ? (
                        <Badge variant="outline" className="uppercase">
                          {n.category}
                        </Badge>
                      ) : null}
                      {n.published_on ? (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {fmtDay(n.published_on)}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 font-heading text-base font-bold leading-snug text-white">
                      {n.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                      {n.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {/* ============ Academy gallery ============ */}
        {gallery.length > 0 ? (
          <section className="mt-14 scroll-animate" data-testid="home-gallery">
            <SectionTitle icon={<Images className="size-4" />} title="Academy gallery" />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {gallery.map((g) => (
                <figure
                  key={g.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-navy-card"
                >
                  <img
                    src={g.url}
                    alt={g.caption || g.player_name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {g.caption ? (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent p-2.5 text-[10px] font-medium leading-snug text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {g.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* ============ Sponsors ============ */}
        {jersey || otherSponsors.length > 0 ? (
          <section className="mt-14 scroll-animate" data-testid="home-sponsors">
            <SectionTitle icon={<ShieldCheck className="size-4" />} title="Club partners" />
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
              {jersey ? (
                <Card className="overflow-hidden border-gold/30 bg-navy-card" data-testid="home-sponsor-jersey">
                  <div aria-hidden className="club-stripe h-[3px] w-full" />
                  <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
                      Official jersey partner
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <LogoImage
                        src={jersey.logo_url}
                        name={jersey.name}
                        className="h-14 w-auto max-w-[160px] object-contain"
                        fallbackClassName="sr-only"
                      />
                      <h3 className="font-heading text-xl font-extrabold text-white">
                        {jersey.name}
                      </h3>
                    </div>
                    {jersey.published_text ? (
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {jersey.published_text}
                      </p>
                    ) : null}
                    {jersey.website ? (
                      <a
                        href={jersey.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:underline"
                      >
                        Visit {jersey.name} <ArrowRight className="size-3.5" />
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              {otherSponsors.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 self-start sm:grid-cols-3">
                  {otherSponsors.map((s) => (
                    <a
                      key={s.id}
                      href={s.website || undefined}
                      target={s.website ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-navy-card px-3 text-center transition-colors hover:border-gold/40"
                      data-testid={`home-sponsor-${s.id}`}
                    >
                      <LogoImage
                        src={s.logo_url}
                        name={s.name}
                        className="max-h-10 w-auto max-w-full object-contain"
                        fallbackClassName="font-heading text-xs font-bold leading-snug text-white"
                      />
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {s.tier}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ============ Connection notice ============ */}
        {isError ? (
          <Card className="mt-14 border-crimson/40 bg-crimson-soft" data-testid="home-offline-note">
            <CardContent className="p-5 text-sm text-white">
              <p className="font-heading font-bold">Live club data is unavailable right now</p>
              <p className="mt-1.5 text-muted-foreground">
                Fixtures, classes and programs will appear as soon as the club API responds again.
                Portal sign-in is unaffected.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}

/* ============ Small building blocks ============ */

function Stat({
  label,
  value,
  loading,
}: {
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-heading text-3xl font-extrabold tracking-tight gold-text">
          {loading ? "—" : (value ?? 0)}
        </span>
        <span className="mt-1.5 block text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </dd>
    </div>
  );
}

/**
 * A remote logo that falls back to the partner's name. Several sponsor `logo_url` values
 * point at assets that no longer resolve, and a broken <img> with alt text is worse than
 * clean type.
 */
function LogoImage({
  src,
  name,
  className,
  fallbackClassName,
}: {
  src: string;
  name: string;
  className: string;
  fallbackClassName: string;
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <span className={fallbackClassName}>{name}</span>;
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className={className}
      onError={() => setBroken(true)}
    />
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-soft font-mono text-[10px] font-bold text-gold">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function FixtureCard({ fixture: f }: { fixture: Fixture }) {
  return (
    <Card className="border-border transition-colors hover:border-gold/40" data-testid={`home-fixture-${f.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="truncate">{f.league_name}</span>
          <span className="shrink-0 font-mono">{fmtDay(f.kickoff)}</span>
        </div>
        <div className="mt-3.5 flex items-center justify-between gap-3">
          <TeamBadge name={f.home_team} logo={f.home_logo} />
          <span className="shrink-0 font-heading text-[11px] font-extrabold uppercase tracking-wider text-gold">
            vs
          </span>
          <TeamBadge name={f.away_team} logo={f.away_logo} align="right" />
        </div>
        {f.venue ? (
          <p className="mt-3.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{f.venue}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TeamBadge({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          loading="lazy"
          className="size-7 shrink-0 rounded-full border border-border object-cover"
        />
      ) : null}
      <span className="truncate text-sm font-medium text-white">{name}</span>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-center gap-2.5 text-gold">
        {icon}
        <h2 className="font-heading text-lg font-extrabold uppercase tracking-tight text-white md:text-xl">
          {title}
        </h2>
      </div>
      {action ? (
        <Link
          to={action.to}
          className="shrink-0 text-xs font-semibold text-muted-foreground transition-colors duration-150 hover:text-gold"
        >
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}

function EmptyNote({
  children,
  testId,
  className,
}: {
  children: React.ReactNode;
  testId?: string;
  className?: string;
}) {
  return (
    <p
      className={`rounded-xl border border-dashed border-border bg-navy-card/50 px-4 py-6 text-sm text-muted-foreground ${className ?? ""}`}
      data-testid={testId}
    >
      {children}
    </p>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[92px] animate-pulse rounded-xl border border-border bg-navy-card" />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-[380px] animate-pulse rounded-xl border border-border bg-navy-card" />;
}
