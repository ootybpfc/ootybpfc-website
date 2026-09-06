import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Image, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import AppShell, { RequireAuth } from "@/components/AppShell";
import AdminCreate from "@/components/AdminCreate";
import AdminContent from "@/components/AdminContent";
import AdminClasses from "@/components/AdminClasses";
import CoachApplications from "@/components/CoachApplications";
import AdminDashboardPanel from "@/components/AdminDashboardPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { AdminStats, Coach, CoachPayout, MediaPost, OkResponse } from "@/lib/types";
export default function Admin() {
  const { user, isLoading } = useSession(); const qc = useQueryClient(); const isAdmin = user?.role === "admin";
  const stats = useQuery<AdminStats>({ queryKey: ["admin", "stats"], enabled: isAdmin, queryFn: () => apiGet<AdminStats>("/admin/stats") });
  const coaches = useQuery<Coach[]>({ queryKey: ["coaches"], enabled: isAdmin, queryFn: () => apiGet<Coach[]>("/coaches") });
  const payouts = useQuery<CoachPayout[]>({ queryKey: ["payouts"], enabled: isAdmin, queryFn: () => apiGet<CoachPayout[]>("/payouts") });
  const media = useQuery<MediaPost[]>({ queryKey: ["media"], enabled: isAdmin, queryFn: () => apiGet<MediaPost[]>("/media") });
  const moderate = useMutation({ mutationFn: (payload: { id: string; status: "approved" | "rejected" }) => apiPatch<MediaPost>(`/media/${payload.id}`, { status: payload.status }), onSuccess: (post) => { qc.invalidateQueries({ queryKey: ["media"] }); toast.success(`Media ${post.status}`); }, onError: () => toast.error("Moderation failed") });
  const removeMedia = useMutation({ mutationFn: (id: string) => apiDelete<OkResponse>(`/media/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ["media"] }); toast.success("Deleted"); }, onError: () => toast.error("Delete failed") });
  const setPercentage = useMutation({ mutationFn: (payload: { id: string; pct: number }) => apiPatch<Coach>(`/coaches/${payload.id}`, { payout_percentage: payload.pct }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["coaches", "payouts"] }); toast.success("Updated"); }, onError: () => toast.error("Could not update") });
  const pending = (media.data ?? []).filter((m) => m.status === "pending");
  const revenue = Object.entries(stats.data?.revenue_by_currency ?? {});
  return (<AppShell><RequireAuth user={user} isLoading={isLoading}>
    {!isAdmin ? <p className="py-20 text-center text-sm text-muted-foreground" data-testid="admin-forbidden">This console is limited to club admins.</p> : (<>
      <h1 className="font-heading text-3xl font-black uppercase tracking-tighter">Club console</h1>
      <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border"><CardContent className="p-5"><div className="text-gold"><Users className="size-4" /></div><p className="mt-3 font-mono text-3xl font-bold" data-testid="admin-kpi-players">{stats.data?.players ?? 0}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Players</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-5"><div className="text-gold"><ShieldCheck className="size-4" /></div><p className="mt-3 font-mono text-3xl font-bold" data-testid="admin-kpi-coaches">{stats.data?.coaches ?? 0}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Coaches</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-5"><div className="text-gold"><Image className="size-4" /></div><p className="mt-3 font-mono text-3xl font-bold" data-testid="admin-kpi-media">{stats.data?.pending_media ?? 0}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Media pending</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-5"><div className="text-gold"><AlertTriangle className="size-4" /></div><p className="mt-3 font-mono text-3xl font-bold" data-testid="admin-kpi-checks">{stats.data?.background_checks_due ?? 0}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Checks due</p></CardContent></Card>
      </div>
      {revenue.length > 0 ? <Card className="mt-3 border-border"><CardContent className="flex flex-wrap gap-8 p-5">{revenue.map(([cur, amount]) => <div key={cur}><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Collected ({cur})</p><p className="font-mono text-2xl font-bold text-gold">${amount.toFixed(2)}</p></div>)}</CardContent></Card> : null}
      <Tabs defaultValue="dashboard" className="mt-8">
        <TabsList><TabsTrigger value="dashboard">Dashboard</TabsTrigger><TabsTrigger value="classes">Classes</TabsTrigger><TabsTrigger value="create">Create</TabsTrigger><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="moderation">Moderation ({pending.length})</TabsTrigger><TabsTrigger value="coaches">Coaches</TabsTrigger><TabsTrigger value="payouts">Payouts</TabsTrigger></TabsList>
        <TabsContent value="dashboard" className="mt-4"><AdminDashboardPanel /></TabsContent>
        <TabsContent value="classes" className="mt-4"><AdminClasses /></TabsContent>
        <TabsContent value="create" className="mt-4"><AdminCreate /></TabsContent>
        <TabsContent value="content" className="mt-4"><AdminContent /></TabsContent>
        <TabsContent value="moderation" className="mt-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{pending.length === 0 ? <p className="text-sm text-muted-foreground">Queue clear.</p> : pending.map((m) => (<Card key={m.id} className="overflow-hidden border-border"><img src={m.url} alt={m.caption} loading="lazy" className="h-36 w-full object-cover" /><CardContent className="p-4"><p className="text-sm font-medium">{m.caption}</p><p className="mt-1 text-xs text-muted-foreground">{m.player_name} · by {m.submitted_by}</p><div className="mt-3 flex gap-2"><Button size="sm" className="h-11 flex-1 bg-pitch text-white" onClick={() => moderate.mutate({ id: m.id, status: "approved" })}>Approve</Button><Button size="sm" variant="outline" className="h-11 flex-1" onClick={() => moderate.mutate({ id: m.id, status: "rejected" })}>Reject</Button><Button size="sm" variant="ghost" className="h-11" onClick={() => removeMedia.mutate(m.id)}><Trash2 className="size-4" /></Button></div></CardContent></Card>))}</div></TabsContent>
        <TabsContent value="coaches" className="mt-4"><CoachApplications /><p className="mt-8 font-heading text-lg font-bold tracking-tight">Approved coaches</p><div className="mt-3 overflow-hidden rounded-xl border border-border"><Table><TableHeader><TableRow><TableHead>Coach</TableHead><TableHead>Team</TableHead><TableHead>Background check</TableHead><TableHead>Payout %</TableHead></TableRow></TableHeader><TableBody>{(coaches.data ?? []).map((c) => (<TableRow key={c.id}><TableCell className="text-sm">{c.name}</TableCell><TableCell className="text-sm">{c.team_name}</TableCell><TableCell><Badge variant={c.background_check_status === "clear" ? "secondary" : "destructive"}>{c.background_check_status}</Badge></TableCell><TableCell><div className="flex items-center gap-2"><span className="font-mono text-sm">{c.payout_percentage}%</span><Button size="sm" variant="outline" className="h-11" onClick={() => setPercentage.mutate({ id: c.id, pct: Math.min(100, c.payout_percentage + 5) })}>+5%</Button></div></TableCell></TableRow>))}</TableBody></Table></div></TabsContent>
        <TabsContent value="payouts" className="mt-4"><div className="overflow-hidden rounded-xl border border-border"><Table><TableHeader><TableRow><TableHead>Coach</TableHead><TableHead>Period</TableHead><TableHead>Gross</TableHead><TableHead>Rate</TableHead><TableHead>Owed</TableHead></TableRow></TableHeader><TableBody>{(payouts.data ?? []).map((p) => (<TableRow key={p.coach_id}><TableCell className="text-sm">{p.coach_name}</TableCell><TableCell className="font-mono text-sm">{p.period}</TableCell><TableCell className="font-mono text-sm">{p.currency.toUpperCase()} ${p.gross_revenue.toFixed(2)}</TableCell><TableCell className="font-mono text-sm">{p.percentage}%</TableCell><TableCell className="font-mono text-sm font-bold text-gold">{p.currency.toUpperCase()} ${p.calculated_amount.toFixed(2)}</TableCell></TableRow>))}</TableBody></Table></div></TabsContent>
      </Tabs>
    </>)}
  </RequireAuth></AppShell>);
}
