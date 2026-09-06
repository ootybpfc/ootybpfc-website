import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
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
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** True when the backend says this email has no portal record at all. */
function isUnknownAccount(err: unknown) {
  return err instanceof ApiError && err.status === 404;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState<OtpRequestResult | null>(null);
  const [problem, setProblem] = useState<{ message: string; unknownAccount: boolean } | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Move focus to the code field the moment a code is issued. The Input primitive is a
  // plain React 18 function component, so it cannot take a ref — query the DOM instead.
  useEffect(() => {
    if (!sent) return;
    document.getElementById("code")?.focus();
  }, [sent]);

  const requestOtp = useMutation({
    mutationFn: (value: string) => apiPost<OtpRequestResult>("/auth/request-otp", { email: value }),
    onSuccess: (result) => {
      setSent(result);
      setProblem(null);
      setCode(result.demo_code ?? "");
      toast.success(
        result.demo_code ? "Demo code issued below" : `Code sent to ${result.email}`,
      );
    },
    onError: (err) => {
      const message = errText(err, "Could not send a code");
      setProblem({ message, unknownAccount: isUnknownAccount(err) });
      toast.error(message);
    },
  });

  const verify = useMutation({
    mutationFn: (payload: { email: string; code: string }) =>
      apiPost<MeResponse>("/auth/verify-otp", payload),
    onSuccess: async (me) => {
      await beginSession(qc);
      toast.success(`Welcome back, ${me.name}`);
      navigate(me.role === "admin" ? "/admin" : "/portal");
    },
    onError: (err) => {
      const message = errText(err, "Verification failed");
      setProblem({ message, unknownAccount: false });
      toast.error(message);
    },
  });

  const minutes = sent ? Math.max(1, Math.round((sent.expires_in_seconds ?? 600) / 60)) : 10;

  function resetToEmail() {
    setSent(null);
    setCode("");
    setProblem(null);
  }

  return (
    <AppShell>
      <div className="grid gap-10 py-6 md:grid-cols-2 md:gap-16 md:py-14">
        <div className="animate-pearl-rise">
          <Crest className="size-16 crest-shadow" />
          <h1 className="mt-7 font-heading text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white md:text-5xl">
            Portal <span className="gold-text">access</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Sign in with your registered club email. You'll receive a one-time 6-digit code — no
            password needed.
          </p>

          <ul className="mt-8 space-y-3.5 border-t border-border pt-7">
            {[
              "Guardians manage player profiles, waivers and class RSVPs",
              "Coaches mark attendance and review uploaded media",
              "Admins handle registrations, payouts and club content",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            New coach?{" "}
            <Link
              to="/coach-signup"
              className="font-semibold text-gold hover:underline"
              data-testid="login-coach-signup-link"
            >
              Apply to coach
            </Link>{" "}
            — an admin approves you and assigns your locations.
          </p>
        </div>

        <Card className="self-start overflow-hidden border-border">
          <div aria-hidden className="club-stripe h-[3px] w-full" />
          <CardContent className="p-6 md:p-8">
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
                    readOnly={!!sent}
                    className="h-12 pl-10 read-only:opacity-70"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSent(null);
                      setProblem(null);
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
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      className="h-12 pl-10 font-mono text-lg tracking-[0.4em]"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      data-testid="login-code-input"
                    />
                  </div>

                  {sent.demo_code ? (
                    <div
                      className="rounded-lg border border-gold/40 bg-gold-soft p-3.5"
                      data-testid="login-demo-code"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                        Demo mode — email sending is not configured
                      </p>
                      <p className="mt-2 font-mono text-2xl font-bold tracking-[0.3em] text-white">
                        {sent.demo_code}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        We've filled this in for you. Once club SMTP credentials are set on the
                        server, codes are emailed instead of shown here.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Check the inbox for <span className="text-white">{sent.email}</span>. The code
                      expires in {minutes} minutes and is single use. After 5 wrong tries it locks.
                    </p>
                  )}
                </div>
              ) : null}

              {problem ? (
                <div
                  className="flex items-start gap-3 rounded-lg border border-crimson/45 bg-crimson-soft p-3.5"
                  data-testid="login-error"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-crimson-bright" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-white">{problem.message}</p>
                    {problem.unknownAccount ? (
                      <p className="mt-1.5 text-muted-foreground">
                        The portal only recognises emails already on a club record. Ask a club admin
                        to add you, or{" "}
                        <Link to="/coach-signup" className="font-semibold text-gold hover:underline">
                          apply to coach
                        </Link>
                        .
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full bg-crimson font-bold text-white hover:bg-crimson-bright"
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

              {sent ? (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={resetToEmail}
                    className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground transition-colors hover:text-white"
                    data-testid="login-change-email"
                  >
                    <ArrowLeft className="size-3.5" /> Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={() => requestOtp.mutate(sent.email)}
                    disabled={requestOtp.isPending}
                    className="font-semibold text-gold transition-opacity hover:underline disabled:opacity-50"
                    data-testid="login-resend-code"
                  >
                    {requestOtp.isPending ? "Resending…" : "Resend code"}
                  </button>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
