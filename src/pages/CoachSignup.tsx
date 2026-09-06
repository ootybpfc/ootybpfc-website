import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, MapPin } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { Coach, Organization } from "@/lib/types";
function errText(err: unknown, fallback: string) { if (err instanceof ApiError) { const body = err.body as { detail?: unknown } | null; if (typeof body?.detail === "string") return body.detail; } return fallback; }
export default function CoachSignup() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", experience: "" });
  const [orgIds, setOrgIds] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const orgs = useQuery<Organization[]>({ queryKey: ["organizations"], queryFn: () => apiGet<Organization[]>("/organizations") });
  const apply = useMutation({ mutationFn: () => apiPost<Coach>("/coach-applications", { ...form, preferred_org_ids: orgIds }), onSuccess: () => { setDone(true); toast.success("Application received"); }, onError: (e) => toast.error(errText(e, "Could not send your application")) });
  function toggleOrg(id: string) { setOrgIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])); }
  if (done) return (<AppShell><div className="py-20 text-center" data-testid="coach-signup-done"><CheckCircle2 className="mx-auto size-10" /><h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tighter">Application sent</h1><p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">A club admin reviews applications. You can sign in once approved.</p><Link to="/" className="mt-8 inline-flex h-12 items-center rounded-md bg-crimson px-6 text-sm font-semibold text-white" data-testid="coach-signup-home-link">Back to the club</Link></div></AppShell>);
  return (<AppShell><div className="grid gap-8 py-6 md:grid-cols-2 md:gap-14"><div className="animate-pearl-rise"><ClipboardCheck className="size-10 text-crimson-bright" /><h1 className="mt-5 font-heading text-3xl font-black uppercase tracking-tighter md:text-5xl">Coach with us</h1><p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">Apply once. A club admin reviews and assigns you to locations.</p></div><Card className="self-start border-border"><CardContent className="p-6"><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); apply.mutate(); }} data-testid="coach-signup-form"><div className="space-y-2"><Label htmlFor="coach-name">Full name</Label><Input id="coach-name" className="h-12" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="coach-signup-name" /></div><div className="space-y-2"><Label htmlFor="coach-email">Email</Label><Input id="coach-email" type="email" className="h-12" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="coach-signup-email" /></div><div className="space-y-2"><Label>Locations</Label><div className="space-y-2">{(orgs.data ?? []).map((o) => { const on = orgIds.includes(o.id); return (<button key={o.id} type="button" onClick={() => toggleOrg(o.id)} className={`flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors duration-150 ${on ? "border-crimson bg-crimson-soft" : "border-border hover:border-crimson/50"}`}><span className="flex items-center gap-2 text-sm"><MapPin className="size-4 shrink-0 text-crimson-bright" />{o.name}</span>{on ? <CheckCircle2 className="size-5 shrink-0 text-crimson-bright" /> : null}</button>); })}</div></div><div className="space-y-2"><Label htmlFor="coach-exp">Experience</Label><Textarea id="coach-exp" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} data-testid="coach-signup-experience" /></div><Button type="submit" className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright" disabled={apply.isPending || !form.name || !form.email} data-testid="coach-signup-submit">{apply.isPending ? "Sending…" : "Send application"}</Button></form></CardContent></Card></div></AppShell>);
}
