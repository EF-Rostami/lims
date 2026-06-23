"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, Building2, User, CheckCircle, ArrowRight, FlaskConical, MessageSquare } from "lucide-react";

type Plan = "starter" | "professional" | "enterprise";

const plans: { id: Plan; name: string; desc: string; highlight: boolean }[] = [
  { id: "starter", name: "Starter", desc: "Up to 10 users", highlight: false },
  { id: "professional", name: "Professional", desc: "Up to 50 users", highlight: true },
  { id: "enterprise", name: "Enterprise", desc: "Unlimited / multi-site", highlight: false },
];

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    labName: "",
    plan: "professional" as Plan,
    notes: "",
  });

  const field = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/global/trial-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          lab_name: form.labName,
          plan: form.plan,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Something went wrong.");
      }
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-xl shadow-lg text-center">
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">We&apos;ll be in touch!</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Thanks, <span className="font-semibold text-gray-700">{form.fullName.split(" ")[0]}</span>.
              We&apos;ve received your request for{" "}
              <span className="font-semibold text-gray-700">{form.labName}</span> and will contact you
              at <span className="font-semibold text-gray-700">{form.email}</span> within one business day.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">What happens next</p>
            {[
              "Our team reviews your request",
              "We set up your dedicated lab workspace",
              "You receive login credentials by email",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-blue-700">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                {item}
              </div>
            ))}
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/demo"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Explore the live demo while you wait <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12">
      <div className="w-full max-w-md px-4">
        <div className="bg-card border rounded-xl shadow-lg p-8 space-y-5">

          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FlaskConical className="text-white h-4 w-4" />
              </div>
              <span className="font-bold text-gray-900 text-lg">BLIMS</span>
            </div>
            <h1 className="text-2xl font-bold">Request a free trial</h1>
            <p className="text-muted-foreground text-sm">
              Fill in your details and we&apos;ll set up your lab workspace within one business day.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Plan */}
            <div className="grid grid-cols-3 gap-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, plan: p.id }))}
                  className={`relative rounded-lg border px-2 py-2.5 text-center text-xs font-medium transition-all ${
                    form.plan === p.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Popular
                    </span>
                  )}
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                  placeholder="Dr. Jane Smith"
                  value={form.fullName}
                  onChange={field("fullName")}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input
                  type="email"
                  required
                  className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                  placeholder="jane@lab.com"
                  value={form.email}
                  onChange={field("email")}
                />
              </div>
            </div>

            {/* Lab name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Laboratory / Organisation Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input
                  type="text"
                  required
                  className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                  placeholder="AryaTest Institute"
                  value={form.labName}
                  onChange={field("labName")}
                />
              </div>
            </div>

            {/* Notes (optional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MessageSquare size={13} className="text-muted-foreground" />
                Anything you&apos;d like us to know?
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm resize-none"
                placeholder="e.g. number of users, accreditation body, specific modules needed…"
                value={form.notes}
                onChange={field("notes")}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>Send request <ArrowRight size={15} /></>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        </div>

        {/* Trust strip */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          {["ISO 17025 Ready", "GDPR Compliant", "No credit card needed", "Setup within 1 business day"].map((b) => (
            <div key={b} className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {b}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
