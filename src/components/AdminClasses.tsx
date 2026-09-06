import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";
import type { ClassSession, Organization, OkResponse, PriceOption, Program, Weekday } from "@/lib/types";

const WEEKDAYS: Weekday[] = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
interface Draft { program_id: string; org_id: string; weekday: Weekday; start_time: string; end_time: string; venue: string; capacity: string; fee_lookup_key: string; }
const BLANK: Draft = { program_id: "", org_id: "", weekday: "Tuesday", start_time: "17:30", end_time: "19:00", venue: "", capacity: "18", fee_lookup_key: "" };
function errText(err: unknown, fallback: string) { if (err instanceof ApiError) { const body = err.body as { detail?: unknown } | null; if (typeof body?.detail === "string") return body.detail; } return fallback; }

export default function AdminClasses() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const sessions = useQuery<ClassSession[]>({ queryKey: ["class-sessions"], queryFn: () => apiGet<ClassSession[]>("/class-sessions") });
  const programs = useQuery<Program[]>({ queryKey: ["programs"], queryFn: () => apiGet<Program[]>("/programs") });
  const orgs = useQuery<Organization[]>({ queryKey: ["organizations"], queryFn: () => apiGet<Organization[]>("/organizations") });
  const prices = useQuery<PriceOption[]>({ queryKey: ["prices"], queryFn: () => apiGet<PriceOption[]>("/prices") });
  const programLabels = Object.fromEntries((programs.data ?? []).map((p) => [p.id, p.name]));
  const orgLabels = Object.fromEntries((orgs.data ?? []).map((o) => [o.id, o.name]));
  const priceLabels = Object.fromEntries((prices.data ?? []).map((p) => [p.lookup_key, `${p.label} — ${p.currency.toUpperCase()} $${p.amount.toFixed(2)}`]));
  function done(message: string) { qc.invalidateQueries({ queryKey: ["class-sessions"] }); setDraft(null); setEditId(null); toast.success(message); }
  const save = useMutation({ mutationFn: () => { const body = { ...draft, capacity: Number(draft?.capacity ?? 18), fee_lookup_key: draft?.fee_lookup_key || null }; return editId ? apiPatch<ClassSession>(`/class-sessions/${editId}`, body) : apiPost<ClassSession>("/class-sessions", body); }, onSuccess: () => done(editId ? "Class updated" : "Class added"), onError: (e) => toast.error(errText(e, "Could not save")) });
  const remove = useMutation({ mutationFn: (id: string) => apiDelete<OkResponse>(`/class-sessions/${id}`), onSuccess: () => done("Class removed"), onError: (e) => toast.error(errText(e, "Could not remove")) });
  const rows = sessions.data ?? [];
  const grouped = rows.reduce<Record<string, ClassSession[]>>((acc, s) => { const key = `${s.program_name} · ${s.org_name}`; (acc[key] ??= []).push(s); return acc; }, {});
  return (
    <div data-testid="admin-classes">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{sessions.isLoading ? "Loading…" : `${rows.length} weekly class${rows.length === 1 ? "" : "es"}`}</p>
        <Button className="h-11 bg-crimson text-white hover:bg-crimson-bright" onClick={() => { setEditId(null); setDraft({ ...BLANK, program_id: programs.data?.[0]?.id ?? "", org_id: orgs.data?.[0]?.id ?? "" }); }} data-testid="class-add-button"><Plus className="mr-1.5 size-4" /> Add class</Button>
      </div>
      <div className="mt-4 space-y-6" data-testid="class-list">
        {!sessions.isLoading && rows.length === 0 ? <p className="text-sm text-muted-foreground" data-testid="class-empty">No classes scheduled yet.</p> : Object.entries(grouped).map(([group, slots]) => (
          <div key={group}>
            <p className="text-[11px] uppercase tracking-wider text-crimson-bright">{group}</p>
            <div className="mt-2 space-y-2">{slots.map((s) => (
              <Card key={s.id} className="border-border" data-testid={`class-row-${s.id}`}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <CalendarClock className="size-4 shrink-0 text-crimson-bright" />
                  <div className="min-w-0 flex-1"><p className="truncate font-heading text-sm font-semibold">{s.weekday} · {s.start_time}–{s.end_time}</p><p className="mt-0.5 text-xs text-muted-foreground">{s.venue} · {s.enrolled_count}/{s.capacity} enrolled</p></div>
                  <Badge variant="outline" className="shrink-0 font-mono">{s.amount > 0 ? `${s.currency.toUpperCase()} $${s.amount.toFixed(2)}` : "Free"}</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-11" onClick={() => { setEditId(s.id); setDraft({ program_id: s.program_id, org_id: s.org_id, weekday: s.weekday, start_time: s.start_time, end_time: s.end_time, venue: s.venue, capacity: String(s.capacity), fee_lookup_key: s.fee_lookup_key ?? "" }); }} data-testid={`class-edit-${s.id}`}><Pencil className="size-4" /></Button>
                    <Button size="sm" variant="ghost" className="h-11" onClick={() => remove.mutate(s.id)} data-testid={`class-delete-${s.id}`}><Trash2 className="size-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}</div>
          </div>
        ))}
      </div>
      <Dialog open={draft !== null} onOpenChange={(v) => { if (!v) { setDraft(null); setEditId(null); } }}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader><DialogTitle className="font-heading uppercase tracking-tight">{editId ? "Edit class" : "Add class"}</DialogTitle><DialogDescription>Guardians pick a location then choose weekly classes.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={(ev) => { ev.preventDefault(); save.mutate(); }} data-testid="class-form">
            <div className="space-y-2"><Label>Program</Label><Select value={draft?.program_id ?? ""} onValueChange={(v: string) => setDraft({ ...draft!, program_id: v })}><SelectTrigger className="h-12 w-full" data-testid="class-program-select"><SelectValue placeholder="Choose a program">{(v) => programLabels[v as string] ?? "Choose a program"}</SelectValue></SelectTrigger><SelectContent>{(programs.data ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Location</Label><Select value={draft?.org_id ?? ""} onValueChange={(v: string) => setDraft({ ...draft!, org_id: v })}><SelectTrigger className="h-12 w-full" data-testid="class-org-select"><SelectValue placeholder="Choose a location">{(v) => orgLabels[v as string] ?? "Choose a location"}</SelectValue></SelectTrigger><SelectContent>{(orgs.data ?? []).map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Day</Label><Select value={draft?.weekday ?? "Tuesday"} onValueChange={(v: string) => setDraft({ ...draft!, weekday: v as Weekday })}><SelectTrigger className="h-12 w-full"><SelectValue>{(v) => String(v ?? "Tuesday")}</SelectValue></SelectTrigger><SelectContent>{WEEKDAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Starts</Label><Input type="time" className="h-12" value={draft?.start_time ?? ""} onChange={(ev) => setDraft({ ...draft!, start_time: ev.target.value })} data-testid="class-start-input" /></div>
              <div className="space-y-2"><Label>Ends</Label><Input type="time" className="h-12" value={draft?.end_time ?? ""} onChange={(ev) => setDraft({ ...draft!, end_time: ev.target.value })} data-testid="class-end-input" /></div>
            </div>
            <div className="space-y-2"><Label>Venue</Label><Input className="h-12" placeholder="Downsview Park Turf 2" value={draft?.venue ?? ""} onChange={(ev) => setDraft({ ...draft!, venue: ev.target.value })} data-testid="class-venue-input" /></div>
            <div className="space-y-2"><Label>Capacity</Label><Input type="number" className="h-12" value={draft?.capacity ?? ""} onChange={(ev) => setDraft({ ...draft!, capacity: ev.target.value })} data-testid="class-capacity-input" /></div>
            <div className="space-y-2"><Label>Fee per class</Label><Select value={draft?.fee_lookup_key ?? ""} onValueChange={(v: string) => setDraft({ ...draft!, fee_lookup_key: v })}><SelectTrigger className="h-12 w-full" data-testid="class-fee-select"><SelectValue placeholder="Free to attend">{(v) => priceLabels[v as string] ?? "Free to attend"}</SelectValue></SelectTrigger><SelectContent>{(prices.data ?? []).map((p) => <SelectItem key={p.lookup_key} value={p.lookup_key}>{priceLabels[p.lookup_key]}</SelectItem>)}</SelectContent></Select></div>
            <Button type="submit" className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright" disabled={save.isPending || !draft?.program_id || !draft?.org_id} data-testid="class-submit">{save.isPending ? "Saving…" : editId ? "Save changes" : "Add class"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
