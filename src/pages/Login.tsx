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

function errText(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as { detail?: string } | null;
    if (body?.detail) return body.detail;
  }
  return fallback;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState<OtpRequestResult | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const requestOtp = useMutation({
    mutationFn: (value: string) => apiPost<OtpRequestResult>("/auth/request-otp", { email: value }),
    onSuccess: (result) => {
      setSent(result);
      toast.success(`Code sent to ${result.email}`);
    },
    onError: (err) => toast.error(errText(err, "Could not send a code")),
  });

  const verify = useMutation({
    mutationFn: (payload: { email: string; code: string }) =>
      apiPost<MeResponse>("/auth/verify-otp", payload),
    onSuccess: async (me) => {
      await beginSession(qc);
      toast.success(`Welcome back, ${me.name}`);
      navigate(me.role === "admin" ? "/admin" : "/portal");
    },
    onError: (err) => toast.error(errText(err, "Verification failed")),
  });

  return (
    <AppShell>
      <div className="grid gap-8 py-6 md:grid-cols-2 md:gap-16 md:py-14">
        <div className="animate-pearl-rise">
          <Crest className="size-12 text-base" />
          <h1 className="mt-6 font-heading text-3xl font-black uppercase tracking-tighter md:text-5xl">
            Portal access
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Sign in with your registered club email. You'll receive a one-time 6-digit
            code — no password needed.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            New coach?{" "}
            <Link to="/coach-signup" className="text-crimson-bright hover:underline" data-testid="login-coach-signup-link">
              Apply to coach
            </Link>{" "}
            — an admin approves you and assigns your locations.
          </p>
        </div>

        <Card className="self-start border-border">
          <CardContent className="p-6">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!sent) requestOtp.mutate(email.trim().toLowerCase());
                else verify.mutate({ email: sent.email, code: code.trim() });
              }}
              data-testid="login-form"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email on your club record</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    className="h-12 pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSent(null);
                    }}
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              {sent ? (
                <div className="space-y-2 animate-pearl-rise">
                  <Label htmlFor="code">6-digit code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="code"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      className="h-12 pl-10 font-mono text-lg tracking-[0.4em]"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      data-testid="login-code-input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check your inbox for the 6-digit code. It expires in 10 minutes and is
                    single use. After 5 wrong tries the code is locked.
                  </p>
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright"
                disabled={requestOtp.isPending || verify.isPending}
                data-testid="login-submit-button"
              >
                {sent
                  ? verify.isPending
                    ? "Verifying…"
                    : "Verify and enter portal"
                  : requestOtp.isPending
                    ? "Sending…"
                    : "Send me a code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
