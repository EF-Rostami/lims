/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Building2, PenLine, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { workspacesApi, TenantWorkspace } from "@/features/lims-auth/workspaces.api";

export default function LoginPage() {
  const router = useRouter();
  const login = useLimsAuthStore((s) => s.login);
  const verifyMfa = useLimsAuthStore((s) => s.verifyMfa);
  const status = useLimsAuthStore((s) => s.status);

  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [error, setError] = useState("");

  const [tenants, setTenants] = useState<TenantWorkspace[]>([]);
  const [selectedSchema, setSelectedSchema] = useState("");
  const [manualSchema, setManualSchema] = useState("");
  const [useManual, setUseManual] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  // MFA step
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  useEffect(() => {
    workspacesApi
      .list()
      .then((list) => {
        setTenants(list);
        if (list.length > 0) setSelectedSchema(list[0].schema_name);
        else setUseManual(true);
      })
      .catch(() => setUseManual(true))
      .finally(() => setLoadingTenants(false));
  }, []);

  // Redirect on successful auth
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
      router.refresh();
    }
  }, [status, router]);

  const activeSchema = useManual ? manualSchema.trim() : selectedSchema;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!activeSchema) {
      setError("Please select or enter a laboratory workspace schema.");
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password, activeSchema);
      // If MFA required, status becomes "mfa_required" and the UI switches below
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = useBackupCode ? backupCode : totpCode;
    setLoading(true);
    try {
      await verifyMfa(code);
    } catch (err: any) {
      setError(err?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── MFA step ──────────────────────────────────────────────────────────────
  if (status === "mfa_required") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-xl shadow-lg">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="text-white h-4 w-4" />
              </div>
              <span className="font-bold text-gray-900 text-lg">BLIMS</span>
            </div>
            <h1 className="text-2xl font-bold">Two-Factor Verification</h1>
            <p className="text-muted-foreground text-sm">
              {useBackupCode
                ? "Enter one of your 8-character backup codes."
                : "Enter the 6-digit code from your authenticator app."}
            </p>
          </div>

          <form onSubmit={handleMFASubmit} className="space-y-4">
            {useBackupCode ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Backup Code</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-mono tracking-widest text-center"
                  placeholder="ABCD-EFGH"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Authenticator Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  autoFocus
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm font-mono tracking-widest text-center"
                  placeholder="000000"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || (!useBackupCode && totpCode.length !== 6) || (useBackupCode && backupCode.length !== 8)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Verify"}
            </button>

            <div className="text-center space-y-1">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => { setUseBackupCode((v) => !v); setError(""); }}
              >
                {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Credentials step ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-xl shadow-lg">
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">BLIMS</span>
          </div>
          <h1 className="text-2xl font-bold">Sign in to your lab</h1>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to access the portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Workspace selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Laboratory Workspace</label>
              {!loadingTenants && (
                <button
                  type="button"
                  onClick={() => setUseManual((v) => !v)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <PenLine size={11} />
                  {useManual ? "Pick from list" : "Enter manually"}
                </button>
              )}
            </div>

            {loadingTenants ? (
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/30 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                Loading workspaces…
              </div>
            ) : useManual ? (
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                  placeholder="e.g. demo_lab"
                  value={manualSchema}
                  onChange={(e) => setManualSchema(e.target.value)}
                />
              </div>
            ) : (
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <select
                  required
                  className="w-full pl-9 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none appearance-none cursor-pointer text-sm"
                  value={selectedSchema}
                  onChange={(e) => setSelectedSchema(e.target.value)}
                >
                  {tenants.map((t) => (
                    <option key={t.schema_name} value={t.schema_name}>
                      {t.name} ({t.schema_name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!loadingTenants && !useManual && (
              <p className="text-xs text-muted-foreground">
                Active schema: <span className="font-mono text-blue-600">{selectedSchema || "—"}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <input
                type="email"
                required
                className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                placeholder="name@lab.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <input
                type="password"
                required
                className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign In"}
          </button>

          <div className="text-center text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
