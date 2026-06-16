"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Loader2, ShieldCheck } from "lucide-react";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";

const DEMO_SCHEMA = "tenant_dairy_demo";
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    // Guard: run exactly once regardless of re-renders or Zustand updates
    if (calledRef.current) return;
    calledRef.current = true;

    const { fetchMe } = useLimsAuthStore.getState();

    async function startDemo() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/lims/auth/demo`, {
          method: "GET",
          credentials: "include",
          headers: { "X-Tenant-Schema": DEMO_SCHEMA },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail || "Demo login failed. Please try again.");
        }

        const data = await res.json();

        sessionStorage.setItem("lims_tenant_schema", DEMO_SCHEMA);
        useLimsAuthStore.setState({ accessToken: data.access_token, tenantSchema: DEMO_SCHEMA });
        await fetchMe();

        router.replace("/demo/welcome");
      } catch (err: unknown) {
        calledRef.current = false; // allow retry on error
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }

    startDemo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <FlaskConical className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">BLIMS Live Demo</h1>
        <p className="text-gray-500 text-sm mb-8">
          Connecting you to the Dairy Testing Lab demo workspace…
        </p>

        {!error ? (
          <>
            <div className="flex items-center justify-center gap-3 text-blue-600 mb-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Signing in as demo user</span>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                Read-only access — no data can be modified
              </div>
              <div className="flex items-center gap-2 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                Pre-populated with a complete dairy laboratory dataset
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 border border-red-100">
              {error}
            </p>
            <button
              onClick={() => { setError(null); window.location.reload(); }}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Back to home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
