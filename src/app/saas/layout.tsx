"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Server,
  CreditCard,
  Zap,
  FileText,
  Users,
  UserCog,
  Receipt,
  LogOut,
} from "lucide-react";
import { useSaasAuthStore } from "@/features/saas/auth/saas-auth.store";
import { SaasAuthBootstrap } from "@/features/saas/auth/SaasAuthBootstrap";

const navItems = [
  { label: "Dashboard", href: "/saas/dashboard", icon: LayoutDashboard },
  { label: "Organizations", href: "/saas/organizations", icon: Building2 },
  { label: "Tenants", href: "/saas/tenants", icon: Server },
  { label: "Subscriptions", href: "/saas/subscriptions", icon: CreditCard },
  { label: "Provisioning", href: "/saas/provisioning", icon: Zap },
  { label: "Audit Logs", href: "/saas/audit-logs", icon: FileText },
  { label: "Customers", href: "/saas/customers", icon: Users },
  { label: "Platform Users", href: "/saas/users", icon: UserCog },
  { label: "Billing", href: "/saas/billing", icon: Receipt },
];

function SaasLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, logout, clearAuth } = useSaasAuthStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/saas-login");
    }
  }, [status, router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
          <p className="text-sm text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) return null;

  const handleLogout = async () => {
    if (logout) await logout();
    else clearAuth();
    router.replace("/saas-login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 flex h-full w-64 flex-col bg-slate-950 text-white">
        {/* Brand */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold tracking-tight">BLIMS</h2>
          <p className="mt-0.5 text-xs text-slate-400">Platform Console</p>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-0.5 px-3 text-sm">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-800 px-4 py-4">
          <p className="truncate text-xs font-medium text-white">{user.email}</p>
          <p className="mt-0.5 text-xs text-slate-500">Platform Admin</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen p-8">{children}</main>
    </div>
  );
}

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <SaasAuthBootstrap>
      <SaasLayoutContent>{children}</SaasLayoutContent>
    </SaasAuthBootstrap>
  );
}
