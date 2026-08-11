"use client";

import { useState } from "react";
import { User, Lock, Mail, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { limsAuthApi } from "@/features/lims-auth/lims-auth.api";

function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  const isSuccess = type === "success";
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm border ${
        isSuccess
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-100"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
    </div>
  );
}

function ProfileSection() {
  const { user, accessToken, tenantSchema, setUser } = useLimsAuthStore();

  const [firstName, setFirstName] = useState(() => {
    const name = user?.display_name ?? "";
    return name.split(" ")[0] ?? "";
  });
  const [lastName, setLastName] = useState(() => {
    const name = user?.display_name ?? "";
    return name.split(" ").slice(1).join(" ") ?? "";
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !tenantSchema) return;
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await limsAuthApi.updateProfile(accessToken, tenantSchema, firstName.trim(), lastName.trim());
      setUser(updated);
      setFeedback({ type: "success", msg: "Profile updated successfully." });
    } catch (err: unknown) {
      setFeedback({ type: "error", msg: err instanceof Error ? err.message : "Update failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border rounded-xl p-6 bg-card">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b">
        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
          <User className="w-4 h-4 text-sky-600" />
        </div>
        <div>
          <h2 className="font-semibold">Profile Information</h2>
          <p className="text-xs text-muted-foreground">Update your name as it appears in reports and meetings.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            Email address
          </label>
          <input
            value={user?.email ?? ""}
            disabled
            className="w-full border rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed. Contact your administrator.</p>
        </div>

        {user?.roles && user.roles.length > 0 && (
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium capitalize"
                >
                  {role.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {feedback && <Alert type={feedback.type} message={feedback.msg} />}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordSection() {
  const { accessToken, tenantSchema } = useLimsAuthStore();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !tenantSchema) return;
    if (next !== confirm) {
      setFeedback({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (next.length < 8) {
      setFeedback({ type: "error", msg: "New password must be at least 8 characters." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await limsAuthApi.changePassword(accessToken, tenantSchema, current, next);
      setFeedback({ type: "success", msg: "Password changed successfully." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: unknown) {
      setFeedback({ type: "error", msg: err instanceof Error ? err.message : "Password change failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border rounded-xl p-6 bg-card">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <Lock className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <h2 className="font-semibold">Change Password</h2>
          <p className="text-xs text-muted-foreground">Use a strong password of at least 8 characters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Current password</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">New password</label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            autoComplete="new-password"
            required
          />
        </div>

        {feedback && <Alert type={feedback.type} message={feedback.msg} />}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ConsultantProfilePage() {
  const user = useLimsAuthStore((s) => s.user);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.display_name ?? "Manage your account details and credentials."}
        </p>
      </div>

      <ProfileSection />
      <PasswordSection />
    </div>
  );
}
