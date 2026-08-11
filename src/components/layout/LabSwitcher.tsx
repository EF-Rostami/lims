"use client";

import { useState } from "react";
import { ChevronsUpDown, Check, Building2, Loader2, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { useBranding } from "@/features/lims/branding/BrandingProvider";
import { useMyLabsHealth } from "@/features/lims/consultancy/labs-overview.queries";

export function LabSwitcher() {
  const { companyName } = useBranding();
  const user = useLimsAuthStore((s) => s.user);
  const tenantSchema = useLimsAuthStore((s) => s.tenantSchema);
  const login = useLimsAuthStore((s) => s.login);

  const { data: labs = [] } = useMyLabsHealth();

  const [targetSchema, setTargetSchema] = useState<string | null>(null);
  const [targetName, setTargetName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only render when the consultant has more than one assigned lab
  if (labs.length <= 1) return null;

  const openModal = (schema: string, name: string) => {
    setTargetSchema(schema);
    setTargetName(name);
    setPassword("");
    setError(null);
  };

  const closeModal = () => {
    setTargetSchema(null);
    setPassword("");
    setError(null);
  };

  const handleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSchema || !user?.email) return;
    setLoading(true);
    setError(null);
    try {
      await login(user.email, password, targetSchema);
      // Full reload clears React Query caches populated with old tenant data
      window.location.href = "/consultant/home";
    } catch {
      setError("Incorrect password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition-colors max-w-[200px]">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">{companyName}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Your Assigned Laboratories
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {labs.map((lab) => {
            const isCurrent = lab.tenant_schema === tenantSchema;
            return (
              <DropdownMenuItem
                key={lab.tenant_schema}
                disabled={isCurrent}
                onClick={() => !isCurrent && openModal(lab.tenant_schema, lab.tenant_name)}
                className={isCurrent ? "opacity-60 cursor-default" : "cursor-pointer"}
              >
                <Check
                  className={`h-4 w-4 me-2 shrink-0 ${isCurrent ? "opacity-100 text-primary" : "opacity-0"}`}
                />
                <span className="truncate">{lab.tenant_name}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Password prompt modal */}
      {targetSchema && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <form
            onSubmit={handleSwitch}
            className="bg-background rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4"
          >
            <div>
              <h2 className="text-base font-semibold">Switch Laboratory</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your password for{" "}
                <span className="font-medium text-foreground">{targetName}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Enter Lab
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
