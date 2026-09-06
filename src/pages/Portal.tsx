import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarDays, CreditCard, Percent, Users } from "lucide-react";
import AppShell, { RequireAuth } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import { ROLE_LABEL, useSession } from "@/lib/session";
import type { ClubEvent, CoachPayout, Enrollment, Payment, Player } from "@/lib/types";
export default function Portal() {
  const { user, isLoading } = useSession();
  const players = useQuery<Player[]>({ queryKey: ["players"], enabled: !!user, queryFn: () => apiGet<Player[]>("/players") });
  const events = useQuery<ClubEvent[]>({ queryKey: ["events"], enabled: !!user, queryFn: () => apiGet<ClubEvent[]>("/events") });
  const payments = useQuery<Payment[]>({ queryKey: ["payments"], enabled: !!user, queryFn: () => apiGet<Payment[]>("/payments") });
  const enrollments = useQuery<Enrollment[]>({ queryKey: ["enrollments"], enabled: !!user, queryFn: () => apiGet<Enrollment[]>("/enrollments") });
  const payouts = useQuery<CoachPayout[]>({ queryKey: ["payouts"], enabled: !!user && (user.role === "coach" || user.role === "admin"), queryFn: () => apiGet<CoachPayout[]>("/payouts") });
  const upcoming = (events.data ?? []).filter((e) => new Date(e.starts_at) >= new Date()).slice(0, 3);
  const unpaid = (players.data ?? []).filter((p) => !p.registration_paid);
  const outstandingWaivers = (players.data ?? []).filter((p) => !p.waiver_signed_at);
  return (
    <AppShell><RequireAuth user={user} isLoading={isLoading}>
      <div className="animate-pearl-rise"><p className="text-[11px] uppercase tracking-[0.2em] text-gold">{user ? ROLE_LABEL[user.role] : ""} · {user?.org_name}</p><h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tighter md:text-4xl">{user?.name}</h1></div>
      {(unpaid.length > 0 || outstandingWaivers.length > 0) && user?.role === "guardian" ? <Card className="mt-6 border-gold/40 bg-gold-soft" data-testid="portal-action-required"><CardContent className="flex items-start gap-3 p-5"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" /><div className="text-sm"><p className="font-semibold">Action required</p><p className="mt-1 text-muted-foreground">{unpaid.length > 0 ? `${unpaid.length} fee(s) outstanding. ` : ""}{outstandingWaivers.length > 0 ? `${outstandingWaivers.length} waiver(s) pending.` : ""}</p><Link to="/payments" className="mt-3 inline-flex h-11 items-center rounded-md bg-crimson px-4 text-sm font-semibold text-white">Resolve now</Link></div></CardContent></Card> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card className="border-border"><CardContent className="p-5"><div className="text-gold"><Users className="size-4" /></div><p className="mt-3 font-mono text-3xl font-bold" data-testid="portal-metric-players">{players.data?.length ?? 0}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Players</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-5"><div className="text-gold"><CalendarDays className="size-4" /></div><p className="mt-3 font-mono text-3xl font-bold" data-testid="portal-metric-events">{upcoming.length}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Upcoming events</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-5"><div className="text-gold"><CreditCard className="size-4" /></div><p className="mt-3 font-mono text-3xl font-bold" data-testid="portal-metric-payments">{payments.data?.length ?? 0}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Payments</p></CardContent></Card>
      </div>
      <h2 className="mt-10 font-heading text-lg font-bold tracking-tight">Manage profiles</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2" data-testid="portal-profiles">{(players.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No profiles linked yet.</p> : (players.data ?? []).map((p) => (<Link key={p.id} to={`/players/${p.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/40" data-testid={`portal-profile-${p.id}`}><span className="min-w-0"><span className="block truncate font-heading text-sm font-semibold">#{p.jersey_no} {p.full_name}</span><span className="mt-1 block text-xs text-muted-foreground">{p.position} · {p.portfolio_status}</span></span><span className="shrink-0 text-xs font-medium text-gold">Manage →</span></Link>))}</div>
      {user?.role === "coach" && payouts.data && payouts.data.length > 0 ? <><h2 className="mt-10 font-heading text-lg font-bold tracking-tight">Your payout</h2>{payouts.data.map((p) => (<Card key={p.coach_id} className="mt-3 border-border"><CardContent className="flex flex-wrap items-center gap-6 p-5"><div><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Period</p><p className="font-mono text-sm">{p.period}</p></div><div className="flex items-center gap-1"><Percent className="size-3 text-gold" /><span className="font-mono text-sm">{p.percentage}%</span></div><div className="ml-auto"><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Calculated</p><p className="font-mono text-xl font-bold text-gold">{p.currency.toUpperCase()} ${p.calculated_amount.toFixed(2)}</p></div></CardContent></Card>))}</> : null}
    </RequireAuth></AppShell>
  );
}
