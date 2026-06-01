/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";

interface UserLogin {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useLimsAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  // 1. Initialize workspace state dynamically from the URL immediately (No useEffect needed!)
  const [workspaceSlug] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    
    const hostname = window.location.hostname;
    const rootDomain = "my-lims.com";
    const domainToMatch = process.env.NODE_ENV === "development" ? "localhost" : rootDomain;
    
    if (hostname === domainToMatch || hostname === `www.${domainToMatch}`) {
      return "";
    }
    return hostname.replace(`.${domainToMatch}`, "");
  });

  // 2. Initialize error state based on whether a valid workspace slug was found
  const [error, setError] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    
    const hostname = window.location.hostname;
    const rootDomain = "my-lims.com";
    const domainToMatch = process.env.NODE_ENV === "development" ? "localhost" : rootDomain;

    if (hostname === domainToMatch || hostname === `www.${domainToMatch}`) {
      return "Please access this portal using your company's dedicated URL (e.g., company.my-lims.com)";
    }
    return "";
  });

  const [formData, setFormData] = useState<UserLogin>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!workspaceSlug) {
      setLoading(false);
      return;
    }
    setError("");

    try {
      await login(formData.email, formData.password, workspaceSlug);
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
          <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">
            {workspaceSlug ? `${workspaceSlug} Workspace` : "Configuration Error"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
              <input
                type="email"
                required
                disabled={!workspaceSlug}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
              <input
                type="password"
                required
                disabled={!workspaceSlug}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !workspaceSlug}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
          </button>

          <div className="text-center text-sm pt-2">
            <Link href="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}