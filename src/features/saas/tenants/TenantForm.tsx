"use client";

import { useState } from "react";
import type { Organization } from "@/generated/saas/models";
import type { CreateTenantPayload, Tenant, TenantEnvironment, UpdateTenantPayload } from "./tenants.api";

type TenantFormProps = {
  tenant?: Tenant | null;
  organizations: Organization[];
  isSubmitting?: boolean;
  onSubmit: (payload: CreateTenantPayload | UpdateTenantPayload) => Promise<void>;
  onCancel: () => void;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function TenantForm({ tenant, organizations, isSubmitting = false, onSubmit, onCancel }: TenantFormProps) {
  const isEdit = Boolean(tenant);

  const [organizationId, setOrganizationId] = useState(tenant?.organization_id ?? organizations[0]?.id ?? "");
  const [name, setName] = useState(tenant?.name ?? "");
  const [slug, setSlug] = useState(tenant?.slug ?? "");
  const [environment, setEnvironment] = useState<TenantEnvironment>(tenant?.environment ?? "PRODUCTION");

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanSlug = slugify(slug);
    if (!cleanName || !cleanSlug) return;

    if (isEdit) {
      await onSubmit({ name: cleanName } satisfies UpdateTenantPayload);
    } else {
      await onSubmit({ organization_id: organizationId, name: cleanName, slug: cleanSlug, environment } satisfies CreateTenantPayload);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Organization</label>
          <select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            disabled={isEdit}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="">Select organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Environment</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as TenantEnvironment)}
            disabled={isEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="PRODUCTION">Production</option>
            <option value="STAGING">Staging</option>
            <option value="TEST">Test</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Alpha Main Lab"
            required
            minLength={2}
            maxLength={255}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="alpha-main-lab"
            required
            minLength={2}
            maxLength={100}
            disabled={isEdit}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono disabled:bg-slate-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !organizationId || !name.trim() || !slug.trim()}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update Tenant" : "Create Tenant"}
        </button>
      </div>
    </form>
  );
}
