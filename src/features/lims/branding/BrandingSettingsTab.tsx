"use client";

import { useState, useRef, useEffect } from "react";
import { RotateCcw, Save, ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrandingData, useUpdateBranding } from "./branding.queries";
import type { BrandingUpdate } from "./branding.api";

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS = [
  {
    name: "Professional Blue",
    description: "Corporate blue with deep navy sidebar",
    primary_hex: "#2563EB",
    sidebar_bg_hex: "#1E3A5F",
    accent_hex: "#0891B2",
  },
  {
    name: "Emerald Lab",
    description: "Fresh green with dark teal sidebar",
    primary_hex: "#059669",
    sidebar_bg_hex: "#064E3B",
    accent_hex: "#D97706",
  },
  {
    name: "Modern Dark",
    description: "Purple accent with near-black sidebar",
    primary_hex: "#8B5CF6",
    sidebar_bg_hex: "#111827",
    accent_hex: "#F59E0B",
  },
];

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULTS = {
  primary_hex: "#3B82F6",
  sidebar_bg_hex: "#0F172A",
  accent_hex: "#8B5CF6",
};

// ── Color field ───────────────────────────────────────────────────────────────

function ColorField({
  label,
  description,
  value,
  onChange,
  onReset,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (hex: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-8 h-8 rounded border border-border shadow-inner"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded border border-border cursor-pointer p-0.5 bg-background"
          title={value}
        />
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          className="w-24 h-8 font-mono text-xs"
          maxLength={7}
        />
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onReset} title="Reset to default">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Preview strip ─────────────────────────────────────────────────────────────

function BrandingPreview({
  companyName,
  logoUrl,
  primaryHex,
  sidebarBgHex,
  accentHex,
}: {
  companyName: string;
  logoUrl: string | null;
  primaryHex: string;
  sidebarBgHex: string;
  accentHex: string;
}) {
  const textColor = (bg: string) => {
    const r = parseInt(bg.slice(1, 3), 16);
    const g = parseInt(bg.slice(3, 5), 16);
    const b = parseInt(bg.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#000000" : "#ffffff";
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm" style={{ height: 160 }}>
      <div className="flex h-full">
        <div
          className="w-32 p-2 flex flex-col gap-1.5 shrink-0"
          style={{ backgroundColor: sidebarBgHex }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-5 w-5 rounded object-contain" />
            ) : (
              <div className="h-5 w-5 rounded" style={{ backgroundColor: primaryHex }} />
            )}
            <span className="text-[9px] font-bold truncate" style={{ color: textColor(sidebarBgHex) }}>
              {companyName}
            </span>
          </div>
          {["Dashboard", "Samples", "Orders", "Reports"].map((item, i) => (
            <div
              key={item}
              className="px-1.5 py-0.5 rounded text-[8px] font-medium"
              style={
                i === 0
                  ? { backgroundColor: primaryHex, color: textColor(primaryHex) }
                  : { color: textColor(sidebarBgHex), opacity: 0.7 }
              }
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex-1 p-3 bg-background flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="h-2 w-20 rounded bg-foreground/20" />
            <div
              className="h-5 w-14 rounded text-[8px] font-semibold flex items-center justify-center"
              style={{ backgroundColor: primaryHex, color: textColor(primaryHex) }}
            >
              + New
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-16 rounded bg-foreground/10" />
            <div className="h-1.5 w-24 rounded" style={{ backgroundColor: accentHex, opacity: 0.4 }} />
          </div>
          <div className="border rounded p-2 space-y-1">
            {[70, 50, 85].map((w, i) => (
              <div key={i} className="h-1.5 rounded bg-foreground/10" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-auto flex gap-1.5">
            <div
              className="h-5 px-2 rounded text-[8px] flex items-center"
              style={{ backgroundColor: primaryHex, color: textColor(primaryHex) }}
            >
              Save
            </div>
            <div className="h-5 px-2 rounded text-[8px] flex items-center border border-border text-foreground/60">
              Cancel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── File → base64 ─────────────────────────────────────────────────────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Main tab component ────────────────────────────────────────────────────────

export function BrandingSettingsTab() {
  const { data: branding, isLoading } = useBrandingData();
  const updateBranding = useUpdateBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState("");
  const [primaryHex, setPrimaryHex] = useState(DEFAULTS.primary_hex);
  const [sidebarBgHex, setSidebarBgHex] = useState(DEFAULTS.sidebar_bg_hex);
  const [accentHex, setAccentHex] = useState(DEFAULTS.accent_hex);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!branding) return;
    setCompanyName(branding.company_name ?? "");
    setPrimaryHex(branding.primary_hex ?? DEFAULTS.primary_hex);
    setSidebarBgHex(branding.sidebar_bg_hex ?? DEFAULTS.sidebar_bg_hex);
    setAccentHex(branding.accent_hex ?? DEFAULTS.accent_hex);
    setLogoDataUrl(branding.logo_data_url ?? null);
    setDirty(false);
  }, [branding]);

  const mark = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setPrimaryHex(preset.primary_hex);
    setSidebarBgHex(preset.sidebar_bg_hex);
    setAccentHex(preset.accent_hex);
    setDirty(true);
  };

  const handleLogoFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    setLogoDataUrl(dataUrl);
    setDirty(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  };

  const handleSave = () => {
    const payload: BrandingUpdate = {
      company_name: companyName || null,
      logo_data_url: logoDataUrl,
      primary_hex: /^#[0-9A-Fa-f]{6}$/.test(primaryHex) ? primaryHex : null,
      sidebar_bg_hex: /^#[0-9A-Fa-f]{6}$/.test(sidebarBgHex) ? sidebarBgHex : null,
      accent_hex: /^#[0-9A-Fa-f]{6}$/.test(accentHex) ? accentHex : null,
    };
    updateBranding.mutate(payload, {
      onSuccess: () => setDirty(false),
    });
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading branding settings…</div>;
  }

  const previewName = companyName || "LIMS Portal";
  const safePrimary = /^#[0-9A-Fa-f]{6}$/.test(primaryHex) ? primaryHex : DEFAULTS.primary_hex;
  const safeSidebar = /^#[0-9A-Fa-f]{6}$/.test(sidebarBgHex) ? sidebarBgHex : DEFAULTS.sidebar_bg_hex;
  const safeAccent = /^#[0-9A-Fa-f]{6}$/.test(accentHex) ? accentHex : DEFAULTS.accent_hex;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
      {/* ── Left: controls ── */}
      <div className="space-y-6">
        {/* Company name */}
        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input
            placeholder="LIMS Portal"
            value={companyName}
            onChange={(e) => { setCompanyName(e.target.value); setDirty(true); }}
          />
          <p className="text-xs text-muted-foreground">Shown in the sidebar header</p>
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <Label>Logo</Label>
          <div
            className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {logoDataUrl ? (
              <div className="relative">
                <img
                  src={logoDataUrl}
                  alt="Logo"
                  className="h-16 max-w-full object-contain rounded"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); setLogoDataUrl(null); setDirty(true); }}
                  title="Remove logo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <ImageOff className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">Click or drag to upload</p>
              <p className="text-xs text-muted-foreground">PNG, SVG, JPG — shown in sidebar</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleLogoFile(f); e.target.value = ""; } }}
          />
        </div>

        {/* Color presets */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Color Presets</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="border rounded-lg p-2 text-left hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className="flex gap-1 mb-2">
                  <div className="h-4 flex-1 rounded-sm" style={{ backgroundColor: preset.sidebar_bg_hex }} />
                  <div className="h-4 flex-1 rounded-sm" style={{ backgroundColor: preset.primary_hex }} />
                  <div className="h-4 flex-1 rounded-sm" style={{ backgroundColor: preset.accent_hex }} />
                </div>
                <p className="text-[11px] font-medium leading-tight">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <p className="text-sm font-semibold">Custom Colors</p>
          <ColorField
            label="Primary Color"
            description="Buttons, active navigation, highlights"
            value={primaryHex}
            onChange={mark(setPrimaryHex)}
            onReset={() => { setPrimaryHex(DEFAULTS.primary_hex); setDirty(true); }}
          />
          <ColorField
            label="Sidebar Background"
            description="Navigation sidebar background"
            value={sidebarBgHex}
            onChange={mark(setSidebarBgHex)}
            onReset={() => { setSidebarBgHex(DEFAULTS.sidebar_bg_hex); setDirty(true); }}
          />
          <ColorField
            label="Accent Color"
            description="Secondary highlights and badges"
            value={accentHex}
            onChange={mark(setAccentHex)}
            onReset={() => { setAccentHex(DEFAULTS.accent_hex); setDirty(true); }}
          />
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={!dirty || updateBranding.isPending}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateBranding.isPending ? "Saving…" : "Save Branding"}
        </Button>
      </div>

      {/* ── Right: preview ── */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Live Preview</p>
        <BrandingPreview
          companyName={previewName}
          logoUrl={logoDataUrl}
          primaryHex={safePrimary}
          sidebarBgHex={safeSidebar}
          accentHex={safeAccent}
        />
        <div className="border rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Color Palette</p>
          <div className="flex gap-2">
            {[
              { label: "Primary", hex: safePrimary },
              { label: "Sidebar", hex: safeSidebar },
              { label: "Accent", hex: safeAccent },
            ].map(({ label, hex }) => (
              <div key={label} className="flex-1 text-center">
                <div className="h-8 rounded border border-border mb-1" style={{ backgroundColor: hex }} />
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-[10px] font-mono">{hex}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
