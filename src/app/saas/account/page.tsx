"use client";

import { useState } from "react";
import { SaasSecurityTab } from "@/features/saas/account/SaasSecurityTab";
import { useSaasAuthStore } from "@/features/saas/auth/saas-auth.store";

const TABS = [
  { id: "security", label: "Security" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function SaasAccountPage() {
  const user = useSaasAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>("security");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user?.email} &mdash; Platform Admin
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "security" && <SaasSecurityTab />}
      </div>
    </div>
  );
}
