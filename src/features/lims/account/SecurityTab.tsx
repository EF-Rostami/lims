"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Shield, ShieldCheck, ShieldOff, Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useMFAStatus,
  useBeginMFASetup,
  useConfirmMFASetup,
  useDisableMFA,
  useRegenerateBackupCodes,
} from "./mfa.queries";
import type { MFASetup, MFAConfirm } from "./mfa.api";

// ── Backup code grid ──────────────────────────────────────────────────────────

function BackupCodesDisplay({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        Save these backup codes somewhere safe. Each code can only be used once. They cannot be shown again.
      </div>
      <div className="grid grid-cols-2 gap-2">
        {codes.map((c, i) => (
          <div key={i} className="font-mono text-sm bg-muted px-3 py-1.5 rounded border text-center tracking-widest">
            {c.slice(0, 4)}-{c.slice(4)}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyAll} className="flex-1">
          <Copy className="h-3.5 w-3.5 mr-1" />
          {copied ? "Copied!" : "Copy all"}
        </Button>
        <Button size="sm" onClick={onDone} className="flex-1">
          I've saved these codes
        </Button>
      </div>
    </div>
  );
}

// ── Setup wizard ──────────────────────────────────────────────────────────────

function SetupWizard({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState<"qr" | "verify" | "done">("qr");
  const [setupData, setSetupData] = useState<MFASetup | null>(null);
  const [confirmData, setConfirmData] = useState<MFAConfirm | null>(null);
  const [code, setCode] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");

  const beginSetup = useBeginMFASetup();
  const confirmSetup = useConfirmMFASetup();

  const handleBegin = () => {
    beginSetup.mutate(undefined, {
      onSuccess: (data) => { setSetupData(data); setStep("qr"); },
      onError: (e: unknown) => setError((e as Error).message),
    });
  };

  const handleConfirm = () => {
    if (!code.trim()) return;
    setError("");
    confirmSetup.mutate(code.trim(), {
      onSuccess: (data) => { setConfirmData(data); setStep("done"); },
      onError: () => setError("Invalid code. Please try again."),
    });
  };

  if (step === "qr" && !setupData) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You'll need an authenticator app such as Google Authenticator, Authy, or 1Password.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleBegin} disabled={beginSetup.isPending}>
            {beginSetup.isPending ? "Generating…" : "Begin Setup"}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (step === "qr" && setupData) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium mb-3">1. Scan this QR code with your authenticator app</p>
          <div className="inline-block p-3 bg-white border rounded-lg">
            <QRCodeSVG value={setupData.uri} size={180} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Or enter the key manually</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1.5 rounded font-mono tracking-widest flex-1">
              {showSecret ? setupData.secret : "••••••••••••••••••••••••••••••••"}
            </code>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowSecret((v) => !v)}>
              {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="sm" variant="ghost" className="h-8 w-8 p-0"
              onClick={() => navigator.clipboard.writeText(setupData.secret)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <Button size="sm" onClick={() => setStep("verify")}>Next — Verify code</Button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium">2. Enter the 6-digit code from your authenticator app</p>
        <div className="space-y-2">
          <Label>Verification code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="font-mono text-center text-lg tracking-widest w-40"
            maxLength={6}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && code.length === 6) handleConfirm(); }}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleConfirm} disabled={code.length !== 6 || confirmSetup.isPending}>
            {confirmSetup.isPending ? "Verifying…" : "Enable 2FA"}
          </Button>
          <Button variant="outline" onClick={() => setStep("qr")}>Back</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <ShieldCheck className="h-5 w-5" />
        Two-factor authentication enabled!
      </div>
      <BackupCodesDisplay codes={confirmData!.backup_codes} onDone={onCancel} />
    </div>
  );
}

// ── Disable dialog ────────────────────────────────────────────────────────────

function DisableForm({ onCancel }: { onCancel: () => void }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const disableMFA = useDisableMFA();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    disableMFA.mutate({ password, code }, {
      onSuccess: onCancel,
      onError: (e: unknown) => setError((e as Error).message || "Failed to disable MFA"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your password and a current TOTP code (or backup code) to disable 2FA.
      </p>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Authenticator code</Label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\s/g, "").slice(0, 8))}
          placeholder="000000"
          className="font-mono tracking-widest w-40"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={disableMFA.isPending}>
          {disableMFA.isPending ? "Disabling…" : "Disable 2FA"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ── Regenerate backup codes ───────────────────────────────────────────────────

function RegenerateForm({ onCancel }: { onCancel: () => void }) {
  const [code, setCode] = useState("");
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const regen = useRegenerateBackupCodes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    regen.mutate(code, {
      onSuccess: (data) => setNewCodes(data.backup_codes),
      onError: () => setError("Invalid TOTP code"),
    });
  };

  if (newCodes) {
    return <BackupCodesDisplay codes={newCodes} onDone={onCancel} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your current TOTP code to generate a new set of backup codes. All existing backup codes will be invalidated.
      </p>
      <div className="space-y-2">
        <Label>Authenticator code</Label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="font-mono tracking-widest w-40"
          required
          maxLength={6}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={code.length !== 6 || regen.isPending}>
          {regen.isPending ? "Generating…" : "Regenerate codes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

type Panel = "idle" | "setup" | "disable" | "regenerate";

export function SecurityTab() {
  const { data: status, isLoading } = useMFAStatus();
  const [panel, setPanel] = useState<Panel>("idle");

  if (isLoading) {
    return <div className="text-sm text-muted-foreground animate-pulse p-2">Loading…</div>;
  }

  const mfaEnabled = status?.mfa_enabled ?? false;

  return (
    <div className="max-w-lg space-y-6">
      {/* Status card */}
      <div className="border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {mfaEnabled ? (
            <ShieldCheck className="h-6 w-6 text-green-600" />
          ) : (
            <Shield className="h-6 w-6 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">
              {mfaEnabled
                ? "Your account is protected with TOTP-based 2FA."
                : "Add an extra layer of security to your account."}
            </p>
          </div>
        </div>
        <Badge variant={mfaEnabled ? "default" : "secondary"}>
          {mfaEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      {/* Action panels */}
      {panel === "idle" && (
        <div className="space-y-3">
          {!mfaEnabled ? (
            <Button onClick={() => setPanel("setup")}>
              <Shield className="h-4 w-4 mr-2" />
              Enable Two-Factor Authentication
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setPanel("regenerate")}>
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Regenerate backup codes
              </Button>
              <Button variant="destructive" onClick={() => setPanel("disable")}>
                <ShieldOff className="h-3.5 w-3.5 mr-2" />
                Disable 2FA
              </Button>
            </div>
          )}
        </div>
      )}

      {panel === "setup" && (
        <div className="border rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold">Set up Two-Factor Authentication</p>
          <SetupWizard onCancel={() => setPanel("idle")} />
        </div>
      )}

      {panel === "disable" && (
        <div className="border border-destructive/30 rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold text-destructive">Disable Two-Factor Authentication</p>
          <DisableForm onCancel={() => setPanel("idle")} />
        </div>
      )}

      {panel === "regenerate" && (
        <div className="border rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold">Regenerate Backup Codes</p>
          <RegenerateForm onCancel={() => setPanel("idle")} />
        </div>
      )}
    </div>
  );
}
