"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saasAuthApi } from "@/features/saas/auth/saas-auth.api";
import { useSaasAuthStore } from "@/features/saas/auth/saas-auth.store";

export default function SaasLoginPage() {
  const router = useRouter();
  const setAuth = useSaasAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginData = await saasAuthApi.login({
        email,
        password,
      });

      useSaasAuthStore.getState().setAuth(loginData.access_token, loginData.user);

      const me = await saasAuthApi.me();

      setAuth(loginData.access_token, me);

      router.push("/saas/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-semibold">BLIMS SaaS Login</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to the SaaS control plane.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6">
          <label className="text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Password</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}