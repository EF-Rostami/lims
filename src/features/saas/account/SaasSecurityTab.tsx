/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Shield, ShieldCheck, ShieldOff, Copy, Check, Loader2 } from "lucide-react";
import {
  useSaaSMFAStatus,
  useSaaSBeginMFASetup,
  useSaaSConfirmMFASetup,
  useSaaSDisableMFA,
  useSaaSRegenerateBackupCodes,
} from "./saas-mfa.queries";

// ── Backup codes display ───────────────────────────────────────────────────

function BackupCodesDisplay({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = codes.map((c) => `${c.slice(0, 4)}-${c.slice(4)}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Save these backup codes somewhere safe. Each can only be used once.
      </p>
      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-slate-50 p-4 font-mono text-sm">
        {codes.map((c) => (
          <span key={c} className="text-slate-800 tracking-widest">
            {c.slice(0, 4)}-{c.slice(4)}
          </span>
        ))}
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
        {copied ? "Copied!" : "Copy all codes"}
      </button>
    </div>
  );
}

// ── Setup wizard ────────────────────────────────────────────────────────────

function SetupWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"start" | "scan" | "verify" | "codes">("start");
  const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const beginSetup = useSaaSBeginMFASetup();
  const confirmSetup = useSaaSConfirmMFASetup();

  const handleBegin = async () => {
    try {
      const data = await beginSetup.mutateAsync();
      setSetupData(data);
      setStep("scan");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to start MFA setup");
    }
  };

  const handleConfirm = async () => {
    setError("");
    try {
      const data = await confirmSetup.mutateAsync(code);
      setBackupCodes(data.backup_codes);
      setStep("codes");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Invalid code");
    }
  };

  if (step === "start") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Add an extra layer of security to your platform admin account using a TOTP authenticator app
          (Google Authenticator, Authy, 1Password, etc.).
        </p>
        <button
          onClick={handleBegin}
          disabled={beginSetup.isPending}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {beginSetup.isPending ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
          Set up 2FA
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (step === "scan" && setupData) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Scan this QR code with your authenticator app, or enter the secret manually.
        </p>
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <div className="rounded-lg border bg-white p-3 shadow-sm">
            <QRCodeSVG value={setupData.uri} size={160} />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Manual entry key</p>
            <p className="break-all rounded border bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
              {setupData.secret}
            </p>
          </div>
        </div>
        <button
          onClick={() => setStep("verify")}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Next: Verify code
        </button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Enter the 6-digit code from your authenticator app to confirm setup.
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-40 rounded-md border px-3 py-2 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleConfirm}
          disabled={code.length !== 6 || confirmSetup.isPending}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {confirmSetup.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          Confirm
        </button>
      </div>
    );
  }

  if (step === "codes") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-700">
          <ShieldCheck size={18} />
          <span className="font-medium text-sm">2FA enabled successfully!</span>
        </div>
        <BackupCodesDisplay codes={backupCodes} />
        <button
          onClick={onDone}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Done
        </button>
      </div>
    );
  }

  return null;
}

// ── Disable form ────────────────────────────────────────────────────────────

function DisableForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const disableMFA = useSaaSDisableMFA();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await disableMFA.mutateAsync({ password, code });
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to disable MFA");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <p className="text-sm text-slate-600">Enter your password and current authenticator code to disable 2FA.</p>
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      <input
        type="text"
        inputMode="numeric"
        required
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="w-full rounded-md border px-3 py-2 text-center font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={disableMFA.isPending || code.length !== 6 || !password}
        className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {disableMFA.isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
        Disable 2FA
      </button>
    </form>
  );
}

// ── Regenerate backup codes ─────────────────────────────────────────────────

function RegenerateForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const regenerate = useSaaSRegenerateBackupCodes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await regenerate.mutateAsync(code);
      setNewCodes(data.backup_codes);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to regenerate codes");
    }
  };

  if (newCodes) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-green-700">New backup codes generated:</p>
        <BackupCodesDisplay codes={newCodes} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <p className="text-sm text-slate-600">Enter your current authenticator code to generate new backup codes.</p>
      <input
        type="text"
        inputMode="numeric"
        required
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="w-full rounded-md border px-3 py-2 text-center font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={regenerate.isPending || code.length !== 6}
        className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {regenerate.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
        Regenerate backup codes
      </button>
    </form>
  );
}

// ── Main security tab ────────────────────────────────────────────────────────

export function SaasSecurityTab() {
  const { data: mfaStatus, isLoading, refetch } = useSaaSMFAStatus();
  const [showDisable, setShowDisable] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm py-8">
        <Loader2 size={16} className="animate-spin" />
        Loading security settings...
      </div>
    );
  }

  const enabled = mfaStatus?.enabled ?? false;

  return (
    <div className="space-y-8 max-w-xl">
      {/* MFA status header */}
      <div className="flex items-start gap-4 rounded-lg border p-5 bg-white">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${enabled ? "bg-green-100" : "bg-slate-100"}`}>
          {enabled ? (
            <ShieldCheck className="text-green-600" size={20} />
          ) : (
            <Shield className="text-slate-400" size={20} />
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            Two-Factor Authentication
            <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${enabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {enabled
              ? "Your account is protected with two-factor authentication."
              : "Add an extra layer of security to your platform admin account."}
          </p>
        </div>
      </div>

      {/* Setup (when disabled) */}
      {!enabled && (
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Enable 2FA</h3>
          <div className="rounded-lg border p-5 bg-white">
            <SetupWizard onDone={() => refetch()} />
          </div>
        </section>
      )}

      {/* Manage (when enabled) */}
      {enabled && (
        <>
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Backup codes</h3>
            <div className="rounded-lg border p-5 bg-white">
              {showRegenerate ? (
                <RegenerateForm />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Backup codes let you access your account if you lose your authenticator device.
                  </p>
                  <button
                    onClick={() => setShowRegenerate(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Regenerate backup codes
                  </button>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Disable 2FA</h3>
            <div className="rounded-lg border border-red-100 p-5 bg-white">
              {showDisable ? (
                <DisableForm onDone={() => { setShowDisable(false); refetch(); }} />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Removing 2FA will make your account less secure.
                  </p>
                  <button
                    onClick={() => setShowDisable(true)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Disable two-factor authentication
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
