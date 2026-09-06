import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { Coach, CoachInvite } from "@/lib/types";
function errText(err: unknown, fallback: string) { if (err instanceof ApiError) { const body = err.body as { detail?: string } | null; if (typeof body?.detail === "string") return body.detail; } return fallback; }
export default function CoachInvitePage() {
  const { token = "" } = useParams();
  const [form, setForm] = useState({ phone: "", experience: "" });
  const [done, setDone] = useState(false);
  const invite = useQuery<CoachInvite>({ queryKey: ["coach-invite", token], enabled: !!token, retry: false, queryFn: () => apiGet<CoachInvite>(`/coach-invites/token/${token}`) });
  const accept = useMutation({ mutationFn: () => apiPost<Coach>(`/coach-invites/token/${token}/accept`, form), onSuccess: () => { setDone(true); toast.success("You're all set"); }, onError: (e) => toast.error(errText(e, "Could not accept that invite")) });
  if (done) return (<AppShell><div className="py-20 text-center" data-testid="invite-accepted"><CheckCircle2 className="mx-auto size-10" /><h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tighter">Welcome to the club</h1><Link to="/login" className="mt-8 inline-flex h-12 items-center rounded-md bg-crimson px-6 text-sm font-semibold text-white" data-testid="invite-login-link">Sign in now</Link></div></AppShell>);
  if (invite.isError) return (<AppShell><div className="py-20 text-center" data-testid="invite-invalid"><h1 className="font-heading text-2xl font-bold">This invite can't be used</h1><Link to="/coach-signup" className="mt-8 inline-flex h-12 items-center rounded-md bg-crimson px-6 text-sm font-semibold text-white">Apply to coach instead</Link></div></AppShell>);
  const data = invite.data;
  return (<AppShell><div className="grid gap-8 py-6 md:grid-cols-2 md:gap-14"><div className="animate-pearl-rise"><Badge className="border-crimson/40 bg-crimson-soft text-crimson-bright">You've been invited</Badge><h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tighter md:text-5xl">{data ? `Hi ${data.name.split(" ")[0]}` : "Coach invite"}</h1>{data ? (<Card className="mt-6 border-border"><CardContent className="p-5"><p className="flex items-center gap-2 font-heading text-sm font-semibold"><ShieldCheck className="size-4 text-crimson-bright" /> Your assignment</p><ul className="mt-3 space-y-1.5">{data.org_names.map((n) => (<li key={n} className="flex items-center gap-2 text-sm"><MapPin className="size-3.5 shrink-0 text-crimson-bright" />{n}</li>))}</ul></CardContent></Card>) : null}</div><Card className="self-start border-border"><CardContent className="p-6"><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); accept.mutate(); }} data-testid="invite-form"><p className="font-heading text-sm font-semibold">Finish your profile</p><div className="space-y-2"><Label htmlFor="invite-phone">Phone</Label><Input id="invite-phone" type="tel" className="h-12" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="invite-exp">Experience</Label><Textarea id="invite-exp" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div><Button type="submit" className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright" disabled={accept.isPending || !data} data-testid="invite-accept-button">{accept.isPending ? "Setting up…" : "Accept and activate my account"}</Button></form></CardContent></Card></div></AppShell>);
}
