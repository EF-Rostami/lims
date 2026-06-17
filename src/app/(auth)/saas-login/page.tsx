"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { useSaasAuthStore } from "@/features/saas/auth/saas-auth.store";

export default function SaasLoginPage() {
  const router = useRouter();

  const login = useSaasAuthStore((s) => s.login);
  const verifyMfa = useSaasAuthStore((s) => s.verifyMfa);
  const status = useSaasAuthStore((s) => s.status);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // MFA step
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/saas/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const code = useBackupCode ? backupCode : totpCode;
    setLoading(true);
    try {
      await verifyMfa(code);
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── MFA step ──────────────────────────────────────────────────────────────
  if (status === "mfa_required") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow space-y-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <ShieldCheck className="text-white h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold">Two-Factor Verification</h1>
          </div>
          <p className="text-sm text-slate-500">
            {useBackupCode
              ? "Enter one of your 8-character backup codes."
              : "Enter the 6-digit code from your authenticator app."}
          </p>

          <form onSubmit={handleMFASubmit} className="space-y-4">
            {useBackupCode ? (
              <input
                type="text"
                required
                autoFocus
                placeholder="ABCD-EFGH"
                value={backupCode}
                onChange={(e) =>
                  setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))
                }
                className="w-full rounded-md border px-3 py-2 text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            ) : (
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                maxLength={6}
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-md border px-3 py-2 text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                (!useBackupCode && totpCode.length !== 6) ||
                (useBackupCode && backupCode.length !== 8)
              }
              className="w-full flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
            </button>

            <button
              type="button"
              className="w-full text-sm text-slate-500 hover:text-slate-700"
              onClick={() => { setUseBackupCode((v) => !v); setError(null); }}
            >
              {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ── Credentials step ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow space-y-5"
      >
        <div>
          <h1 className="text-2xl font-semibold">BLIMS SaaS Login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to the SaaS control plane.</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Sign in"}
        </button>
      </form>
    </main>
  );
}
