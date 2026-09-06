import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";
import AppShell, { Crest } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, ApiError } from "@/lib/api";
import { beginSession } from "@/lib/session";
import type { MeResponse, OtpRequestResult } from "@/lib/types";

const DEMO_ACCOUNTS = [{ role: "Club Admin", email: "admin@ootybpfc.com" }, { role: "Coach", email: "coach.daniel@ootybpfc.com" }, { role: "Guardian", email: "priya.raman@example.com" }];
function errText(err: unknown, fallback: string) { if (err instanceof ApiError) { const body = err.body as { detail?: string } | null; if (body?.detail) return body.detail; } return fallback; }

export default function Login() {
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [sent, setSent] = useState<OtpRequestResult | null>(null); const navigate = useNavigate(); const qc = useQueryClient();
  const requestOtp = useMutation({ mutationFn: (value: string) => apiPost<OtpRequestResult>("/auth/request-otp", { email: value }), onSuccess: (result) => { setSent(result); setCode(result.demo_code); toast.success(`Code sent to ${result.email}`); }, onError: (err) => toast.error(errText(err, "Could not send a code")) });
  const verify = useMutation({ mutationFn: (payload: { email: string; code: string }) => apiPost<MeResponse>("/auth/verify-otp", payload), onSuccess: async (me) => { await beginSession(qc); toast.success(`Welcome back, ${me.name}`); navigate(me.role === "admin" ? "/admin" : "/portal"); }, onError: (err) => toast.error(errText(err, "Verification failed")) });
  return (
    <AppShell>
      <div className="grid gap-8 py-6 md:grid-cols-2 md:gap-16 md:py-14">
        <div className="animate-pearl-rise">
          <Crest className="size-12" />
          <h1 className="mt-6 font-heading text-3xl font-black uppercase tracking-tighter md:text-5xl">Portal access</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">No passwords. Confirm your email, receive a single-use 6-digit code, and your session stays on this device until you sign out.</p>
          <div className="mt-8 space-y-2" data-testid="demo-accounts">
            <p className="text-[11px] uppercase tracking-[0.18em] text-crimson-bright">Demo accounts</p>
            {DEMO_ACCOUNTS.map((a) => (<button key={a.email} type="button" onClick={() => { setEmail(a.email); setSent(null); setCode(""); }} className="flex h-11 w-full items-center justify-between rounded-md border border-border px-4 text-left text-sm transition-colors duration-150 hover:border-crimson/50"><span className="font-medium">{a.role}</span><span className="font-mono text-xs text-muted-foreground">{a.email}</span></button>))}
          </div>
        </div>
        <Card className="self-start border-border"><CardContent className="p-6"><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (!sent) requestOtp.mutate(email.trim().toLowerCase()); else verify.mutate({ email: sent.email, code: code.trim() }); }} data-testid="login-form">
          <div className="space-y-2"><Label htmlFor="email">Email on your club record</Label><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" inputMode="email" autoComplete="email" required className="h-12 pl-10" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setSent(null); }} data-testid="login-email-input" /></div></div>
          {sent ? (<div className="space-y-2 animate-pearl-rise"><Label htmlFor="code">6-digit code</Label><div className="relative"><KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="code" inputMode="numeric" maxLength={6} required className="h-12 pl-10 font-mono text-lg tracking-[0.4em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} data-testid="login-code-input" /></div><p className="text-xs text-muted-foreground" data-testid="login-demo-hint">Demo code: <span className="font-mono text-crimson-bright">{sent.demo_code}</span></p></div>) : null}
          <Button type="submit" className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright" disabled={requestOtp.isPending || verify.isPending} data-testid="login-submit-button">{sent ? verify.isPending ? "Verifying…" : "Verify and enter portal" : requestOtp.isPending ? "Sending…" : "Send me a code"}</Button>
        </form></CardContent></Card>
      </div>
    </AppShell>
  );
}
