import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { toast } from "sonner";
import AppShell, { RequireAuth } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet, apiPost } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { CheckoutResponse, Payment, PaymentStatusResponse, Player, PriceOption } from "@/lib/types";
export function PaymentsPage() {
  const { user, isLoading } = useSession();
  const [lookupKey, setLookupKey] = useState(""); const [playerId, setPlayerId] = useState("");
  const prices = useQuery<PriceOption[]>({ queryKey: ["prices"], queryFn: () => apiGet<PriceOption[]>("/prices") });
  const players = useQuery<Player[]>({ queryKey: ["players"], enabled: !!user, queryFn: () => apiGet<Player[]>("/players") });
  const payments = useQuery<Payment[]>({ queryKey: ["payments"], enabled: !!user, queryFn: () => apiGet<Payment[]>("/payments") });
  const checkout = useMutation({ mutationFn: () => apiPost<CheckoutResponse>("/payments/checkout", { lookup_key: lookupKey, origin_url: window.location.origin, player_id: playerId || null }), onSuccess: (res) => { window.location.href = res.checkout_url; }, onError: () => toast.error("Could not start checkout") });
  const priceList = prices.data ?? []; const playerList = players.data ?? [];
  const priceLabels = Object.fromEntries(priceList.map((p) => [p.lookup_key, `${p.label} — ${p.currency.toUpperCase()} $${p.amount.toFixed(2)}`]));
  const playerLabels = Object.fromEntries(playerList.map((p) => [p.id, `#${p.jersey_no} ${p.full_name}`]));
  return (<AppShell><RequireAuth user={user} isLoading={isLoading}>
    <h1 className="font-heading text-3xl font-black uppercase tracking-tighter">Payments</h1>
    <p className="mt-2 text-sm text-muted-foreground">Fees are charged in the venue's own currency — CAD in Toronto, USD in Chicago.</p>
    {user?.role !== "coach" ? (<Card className="mt-6 border-gold/30" data-testid="checkout-panel"><CardContent className="space-y-4 p-5">
      <p className="font-heading text-sm font-semibold">Pay a club fee</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={lookupKey} onValueChange={(v: string) => setLookupKey(v)}><SelectTrigger className="h-12" data-testid="checkout-fee-select"><SelectValue placeholder="Choose a fee">{(v) => priceLabels[v as string] ?? "Choose a fee"}</SelectValue></SelectTrigger><SelectContent>{priceList.map((p) => <SelectItem key={p.lookup_key} value={p.lookup_key}>{priceLabels[p.lookup_key]}</SelectItem>)}</SelectContent></Select>
        <Select value={playerId} onValueChange={(v: string) => setPlayerId(v)}><SelectTrigger className="h-12"><SelectValue placeholder="For which player?">{(v) => playerLabels[v as string] ?? "For which player?"}</SelectValue></SelectTrigger><SelectContent>{playerList.map((p) => <SelectItem key={p.id} value={p.id}>{playerLabels[p.id]}</SelectItem>)}</SelectContent></Select>
      </div>
      <Button className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright sm:w-auto" disabled={!lookupKey || checkout.isPending} onClick={() => checkout.mutate()} data-testid="checkout-submit-button"><CreditCard className="mr-2 size-4" />{checkout.isPending ? "Opening Stripe…" : "Pay securely with Stripe"}</Button>
      <p className="text-xs text-muted-foreground">Stripe payment — coming soon.</p>
    </CardContent></Card>) : null}
    <h2 className="mt-10 font-heading text-lg font-bold tracking-tight">Payment history</h2>
    <div className="mt-3 overflow-hidden rounded-xl border border-border" data-testid="payments-table"><Table><TableHeader><TableRow><TableHead>Fee</TableHead><TableHead>Player</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{payments.isLoading ? <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">Loading…</TableCell></TableRow> : (payments.data ?? []).length === 0 ? <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground" data-testid="payments-empty">No payments recorded yet.</TableCell></TableRow> : (payments.data ?? []).map((p) => (<TableRow key={p.id}><TableCell className="text-sm">{p.label}</TableCell><TableCell className="text-sm">{p.player_name || "—"}</TableCell><TableCell className="font-mono text-sm">{p.currency.toUpperCase()} ${p.amount.toFixed(2)}</TableCell><TableCell><Badge variant={p.payment_status === "paid" ? "default" : "secondary"}>{p.payment_status}</Badge></TableCell></TableRow>))}</TableBody></Table></div>
  </RequireAuth></AppShell>);
}
export function PaymentSuccessPage() {
  const [params] = useSearchParams(); const sessionId = params.get("session_id") ?? ""; const [state, setState] = useState<"polling"|"paid"|"unresolved">("polling"); const qc = useQueryClient();
  useEffect(() => { if (!sessionId) { setState("unresolved"); return; } let attempts = 0; let cancelled = false; const tick = async () => { if (cancelled) return; attempts += 1; try { const res = await apiGet<PaymentStatusResponse>(`/payments/status/${sessionId}`); if (res.payment_status === "paid") { setState("paid"); qc.invalidateQueries(); return; } } catch { /* keep polling */ } if (attempts >= 8) setState("unresolved"); else setTimeout(tick, 2000); }; void tick(); return () => { cancelled = true; }; }, [sessionId, qc]);
  return (<AppShell><div className="py-20 text-center" data-testid="payment-success-page">{state === "paid" ? <CheckCircle2 className="mx-auto size-10 text-pitch" /> : <CreditCard className="mx-auto size-10 text-gold" />}<h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tighter">{state === "paid" ? "Payment confirmed" : state === "polling" ? "Confirming payment…" : "Still processing"}</h1><Link to="/payments" className="mt-8 inline-flex h-12 items-center rounded-md bg-crimson px-6 text-sm font-semibold text-white">Back to payments</Link></div></AppShell>);
}
export function PaymentCancelPage() {
  return (<AppShell><div className="py-20 text-center" data-testid="payment-cancel-page"><XCircle className="mx-auto size-10 text-destructive" /><h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tighter">Checkout cancelled</h1><p className="mt-3 text-sm text-muted-foreground">Nothing was charged.</p><Link to="/payments" className="mt-8 inline-flex h-12 items-center rounded-md bg-crimson px-6 text-sm font-semibold text-white">Back to payments</Link></div></AppShell>);
}
