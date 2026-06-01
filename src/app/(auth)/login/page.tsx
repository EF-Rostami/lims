/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Building2 } from "lucide-react";
import Link from "next/link";

import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import {
  workspacesApi,
  TenantWorkspace,
} from "@/features/lims-auth/workspaces.api";

interface UserLogin {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();

  const login = useLimsAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [error, setError] = useState("");

  const [tenants, setTenants] = useState<TenantWorkspace[]>([]);
  const [selectedSchema, setSelectedSchema] = useState("");

  const [formData, setFormData] = useState<UserLogin>({
    email: "",
    password: "",
  });

  useEffect(() => {
    async function fetchTenants() {
      try {
        setLoadingTenants(true);
        setError("");

        const actualTenantsList = await workspacesApi.list();

        setTenants(actualTenantsList);

        if (actualTenantsList.length > 0) {
          setSelectedSchema(actualTenantsList[0].schema_name);
        }
      } catch (err) {
        console.error("Failed to load laboratory instances:", err);
        setError("Could not retrieve connection gateways. Backend might be offline.");
      } finally {
        setLoadingTenants(false);
      }
    }

    fetchTenants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (!selectedSchema) {
      setError("Please select a valid laboratory workspace.");
      setLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password, selectedSchema);

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-xl shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">LIMS Login</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access the portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Laboratory Workspace</label>
            <div className="relative">
              <Building2
                className="absolute left-3 top-2.5 text-muted-foreground"
                size={18}
              />

              <select
                required
                disabled={loadingTenants}
                className="w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer disabled:opacity-60"
                value={selectedSchema}
                onChange={(e) => setSelectedSchema(e.target.value)}
              >
                {loadingTenants ? (
                  <option value="">Loading workspaces...</option>
                ) : tenants.length === 0 ? (
                  <option value="">No active connections found</option>
                ) : (
                  tenants.map((t) => (
                    <option key={t.schema_name} value={t.schema_name}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-2.5 text-muted-foreground"
                size={18}
              />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-2.5 text-muted-foreground"
                size={18}
              />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || loadingTenants}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center text-sm">
            <Link href="/forgot-password" className="text-indigo-600">
              Forgot your password?
            </Link>
          </div>

          <p className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}