import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, Check, ClipboardCheck, TrendingDown, X } from "lucide-react";
import { toast } from "sonner";
import AppShell, { RequireAuth } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { ClassRoster, ClassSession, Coach } from "@/lib/types";
function errText(err: unknown, fallback: string) { if (err instanceof ApiError) { const body = err.body as { detail?: string } | null; if (typeof body?.detail === "string") return body.detail; } return fallback; }
function prettyDate(iso: string) { const d = new Date(`${iso}T00:00:00Z`); return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }); }
export default function Attendance() {
  const { user, isLoading } = useSession(); const qc = useQueryClient(); const [sessionId, setSessionId] = useState(""); const [classDate, setClassDate] = useState("");
  const staff = user?.role === "coach" || user?.role === "admin";
  const sessions = useQuery<ClassSession[]>({ queryKey: ["class-sessions"], enabled: !!staff, queryFn: () => apiGet<ClassSession[]>("/class-sessions") });
  const myCoach = useQuery<Coach[]>({ queryKey: ["coaches"], enabled: user?.role === "coach", queryFn: () => apiGet<Coach[]>("/coaches") });
  const mySlots = useMemo(() => { const all = sessions.data ?? []; if (user?.role === "admin") return all; const record = myCoach.data?.[0]; const orgs = record?.org_ids && record.org_ids.length > 0 ? record.org_ids : [record?.org_id ?? user?.org_id ?? ""]; return all.filter((s) => orgs.includes(s.org_id)); }, [sessions.data, myCoach.data, user]);
  const activeId = sessionId || mySlots[0]?.id || "";
  const roster = useQuery<ClassRoster>({ queryKey: ["roster", activeId, classDate], enabled: !!staff && !!activeId, queryFn: () => apiGet<ClassRoster>(`/class-sessions/${activeId}/roster${classDate ? `?class_date=${classDate}` : ""}`) });
  const mark = useMutation({ mutationFn: (payload: { player_id: string; present: boolean }) => apiPost<ClassRoster>(`/class-sessions/${activeId}/attendance`, { class_date: roster.data?.class_date ?? classDate, ...payload }), onSuccess: (data) => { qc.setQueryData(["roster", activeId, classDate], data); qc.invalidateQueries({ queryKey: ["roster", activeId] }); }, onError: (e) => toast.error(errText(e, "Could not save attendance")) });
  const data = roster.data;
  const atRisk = (data?.rows ?? []).filter((r) => r.at_risk);
  const slotLabels = Object.fromEntries(mySlots.map((s) => [s.id, `${s.program_name} · ${s.weekday} ${s.start_time}`]));
  return (
    <AppShell><RequireAuth user={user} isLoading={isLoading}>
      {!staff ? <p className="py-20 text-center text-sm text-muted-foreground" data-testid="attendance-forbidden">Class registers are for coaches and club admins.</p> : (
        <><h1 className="font-heading text-3xl font-black uppercase tracking-tighter">Class register</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Select value={activeId} onValueChange={(v: string) => { setSessionId(v); setClassDate(""); }}><SelectTrigger className="h-12 w-full" data-testid="attendance-class-select"><SelectValue placeholder="Choose a class">{(v) => slotLabels[v as string] ?? "Choose a class"}</SelectValue></SelectTrigger><SelectContent>{mySlots.map((s) => <SelectItem key={s.id} value={s.id}>{slotLabels[s.id]}</SelectItem>)}</SelectContent></Select>
          <Select value={data?.class_date ?? ""} onValueChange={(v: string) => setClassDate(v)}><SelectTrigger className="h-12 w-full" data-testid="attendance-date-select"><SelectValue placeholder="Choose a week">{(v) => v ? prettyDate(String(v)) : "Choose a week"}</SelectValue></SelectTrigger><SelectContent>{(data?.recent_dates ?? []).map((d, i) => <SelectItem key={d} value={d}>{prettyDate(d)}{i === 0 ? " · this week" : ""}</SelectItem>)}</SelectContent></Select>
        </div>
        {data ? (<>
          <Card className="mt-4 border-border" data-testid="attendance-summary"><CardContent className="flex flex-wrap items-center gap-6 p-5"><CalendarClock className="size-4 text-crimson-bright" /><span className="text-sm font-medium">{data.session.weekday} {data.session.start_time}–{data.session.end_time}</span><span className="text-xs text-muted-foreground">{data.session.venue} · {data.session.org_name}</span><div className="ml-auto flex gap-5 font-mono text-sm"><span className="text-pitch" data-testid="attendance-present-count">{data.present_count} in</span><span className="text-crimson-bright" data-testid="attendance-absent-count">{data.absent_count} out</span><span className="text-muted-foreground">{data.unmarked_count} to mark</span></div></CardContent></Card>
          {atRisk.length > 0 ? <Card className="mt-3 border-crimson/40 bg-crimson-soft" data-testid="attendance-dropoff-alert"><CardContent className="flex items-start gap-3 p-5"><TrendingDown className="mt-0.5 size-4 shrink-0 text-crimson-bright" /><div className="text-sm"><p className="font-semibold">Possible drop-offs</p><p className="mt-1 text-muted-foreground">{atRisk.map((r) => `${r.player_name} (${Math.round(r.attendance_rate * 100)}%)`).join(" · ")}</p></div></CardContent></Card> : null}
          <div className="mt-4 space-y-3" data-testid="attendance-roster">{data.rows.length === 0 ? <p className="text-sm text-muted-foreground">Nobody enrolled yet.</p> : data.rows.map((r) => (<Card key={r.player_id} className={`border-border ${r.at_risk ? "border-crimson/40" : ""}`} data-testid={`attendance-row-${r.player_id}`}><CardContent className="flex flex-wrap items-center gap-4 p-4"><div className="min-w-0 flex-1"><p className="font-heading text-sm font-semibold">{r.player_name}{r.at_risk ? <AlertTriangle className="inline ml-2 size-3.5 text-crimson-bright" /> : null}</p><p className="text-xs text-muted-foreground">{r.sessions_marked === 0 ? "No history" : `${r.attended}/${r.sessions_marked} classes · ${Math.round(r.attendance_rate * 100)}%`}</p></div><div className="flex gap-2"><Button size="sm" className={`h-11 min-w-[72px] ${r.present === true ? "bg-pitch text-white" : "bg-secondary text-secondary-foreground"}`} onClick={() => mark.mutate({ player_id: r.player_id, present: true })} disabled={mark.isPending} data-testid={`attendance-present-${r.player_id}`}><Check className="mr-1 size-4" /> In</Button><Button size="sm" variant={r.present === false ? "default" : "outline"} className={`h-11 min-w-[72px] ${r.present === false ? "bg-crimson text-white" : ""}`} onClick={() => mark.mutate({ player_id: r.player_id, present: false })} disabled={mark.isPending} data-testid={`attendance-absent-${r.player_id}`}><X className="mr-1 size-4" /> Out</Button></div></CardContent></Card>))}</div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ClipboardCheck className="size-3.5" />Marks saved instantly with your name and timestamp.</p>
        </>) : roster.isLoading ? <p className="mt-6 text-sm text-muted-foreground">Loading the register…</p> : null}
        </>
      )}
    </RequireAuth></AppShell>
  );
}
