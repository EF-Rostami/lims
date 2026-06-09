"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useBrandingData } from "./branding.queries";
import type { BrandingRead } from "./branding.api";

// ── Contrast helper ───────────────────────────────────────────────────────────

function contrastHex(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#000000" : "#ffffff";
}

// ── Context ───────────────────────────────────────────────────────────────────

interface BrandingContextValue {
  companyName: string;
  logoUrl: string | null;
  sidebarBgHex: string | null;
}

const BrandingContext = createContext<BrandingContextValue>({
  companyName: "LIMS Portal",
  logoUrl: null,
  sidebarBgHex: null,
});

export function useBranding(): BrandingContextValue {
  return useContext(BrandingContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

function applyBranding(branding: BrandingRead | undefined) {
  const root = document.documentElement;
  if (branding?.primary_hex) {
    root.style.setProperty("--primary", branding.primary_hex);
    root.style.setProperty("--primary-foreground", contrastHex(branding.primary_hex));
    root.style.setProperty("--ring", branding.primary_hex);
  } else {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    root.style.removeProperty("--ring");
  }
  if (branding?.accent_hex) {
    root.style.setProperty("--accent", branding.accent_hex);
    root.style.setProperty("--accent-foreground", contrastHex(branding.accent_hex));
  } else {
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { data: branding } = useBrandingData();

  useEffect(() => {
    applyBranding(branding);
    return () => {
      // Restore defaults when provider unmounts (e.g. logout)
      const root = document.documentElement;
      ["--primary", "--primary-foreground", "--ring", "--accent", "--accent-foreground"].forEach(
        (v) => root.style.removeProperty(v),
      );
    };
  }, [branding]);

  const value: BrandingContextValue = {
    companyName: branding?.company_name || "LIMS Portal",
    logoUrl: branding?.logo_url ?? null,
    sidebarBgHex: branding?.sidebar_bg_hex ?? null,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}
