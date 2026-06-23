"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, BookOpen, Shield, Link2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import {
  useResponsibilities, useCreateResponsibility, useUpdateResponsibility, useDeleteResponsibility,
  useFunctionalRoles, useCreateFunctionalRole, useDeleteFunctionalRole,
  usePositionResponsibilities, useAssignPositionResponsibility, useRemovePositionResponsibility,
} from "@/features/lims/responsibilities/responsibilities.queries";
import { usePositions } from "@/features/lims/positions/positions.queries";
import type {
  ResponsibilityCategory,
  ResponsibilityRead,
  ResponsibilityCreate,
} from "@/features/lims/responsibilities/responsibilities.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<ResponsibilityCategory, { label: string; bg: string; text: string }> = {
  general:    { label: "General",    bg: "bg-slate-100",  text: "text-slate-700" },
  management: { label: "Management", bg: "bg-blue-100",   text: "text-blue-700" },
  technical:  { label: "Technical",  bg: "bg-violet-100", text: "text-violet-700" },
  support:    { label: "Support",    bg: "bg-teal-100",   text: "text-teal-700" },
  quality:    { label: "Quality",    bg: "bg-amber-100",  text: "text-amber-700" },
};

function CategoryBadge({ category }: { category: string }) {
  const m = CATEGORY_META[category as ResponsibilityCategory] ??
    { label: category, bg: "bg-slate-100", text: "text-slate-700" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>;
}

// ── Responsibility Library tab ─────────────────────────────────────────────────

const EMPTY_FORM: ResponsibilityCreate = {
  statement: "",
  category: "general",
  iso_clause_reference: null,
  is_an_authorization: false,
};

function LibraryTab() {
  const { data: responsibilities = [], isLoading } = useResponsibilities();
  const create = useCreateResponsibility();
  const update = useUpdateResponsibility();
  const remove = useDeleteResponsibility();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ResponsibilityCreate>(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ResponsibilityCreate>>({});
  const [filterCat, setFilterCat] = useState<ResponsibilityCategory | "">("");

  const filtered = filterCat
    ? responsibilities.filter(r => r.category === filterCat)
    : responsibilities;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.statement.trim()) return;
    await create.mutateAsync(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const startEdit = (r: ResponsibilityRead) => {
    setEditId(r.id);
    setEditForm({
      statement: r.statement,
      category: r.category,
      iso_clause_reference: r.iso_clause_reference,
      is_an_authorization: r.is_an_authorization,
    });
  };

  const saveEdit = async () => {
    if (!editId) return;
    await update.mutateAsync({ id: editId, data: editForm });
    setEditId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value as ResponsibilityCategory | "")}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All categories</option>
            {(Object.keys(CATEGORY_META) as ResponsibilityCategory[]).map(k => (
              <option key={k} value={k}>{CATEGORY_META[k].label}</option>
            ))}
          </select>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Responsibility
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border rounded-xl p-4 bg-slate-50 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">New Responsibility Statement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 space-y-1">
              <Label>Statement *</Label>
              <Input
                required
                value={form.statement}
                onChange={e => setForm(f => ({ ...f, statement: e.target.value }))}
                placeholder="e.g. Review and approve all test results prior to reporting"
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ResponsibilityCategory }))}
              >
                {(Object.keys(CATEGORY_META) as ResponsibilityCategory[]).map(k => (
                  <option key={k} value={k}>{CATEGORY_META[k].label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>ISO Clause Reference</Label>
              <Input
                value={form.iso_clause_reference ?? ""}
                onChange={e => setForm(f => ({ ...f, iso_clause_reference: e.target.value || null }))}
                placeholder="e.g. §6.2.6, §7.7.1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_auth"
                checked={form.is_an_authorization}
                onChange={e => setForm(f => ({ ...f, is_an_authorization: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="is_auth" className="font-normal cursor-pointer">
                This is a formal authorization (signing authority, approval right)
              </Label>
            </div>
          </div>
          <div className="flex gap-2 justify-end border-t pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Statement</th>
                <th className="px-4 py-3 w-32">Category</th>
                <th className="px-4 py-3 w-28">ISO Clause</th>
                <th className="px-4 py-3 w-24">Auth</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => {
                const isEditing = editId === r.id;
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-300">#{r.id}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={editForm.statement ?? ""}
                          onChange={e => setEditForm(f => ({ ...f, statement: e.target.value }))}
                          className="text-sm h-8"
                        />
                      ) : (
                        <span className="text-slate-800">{r.statement}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          className="border rounded px-2 py-1 text-xs"
                          value={editForm.category ?? r.category}
                          onChange={e => setEditForm(f => ({ ...f, category: e.target.value as ResponsibilityCategory }))}
                        >
                          {(Object.keys(CATEGORY_META) as ResponsibilityCategory[]).map(k => (
                            <option key={k} value={k}>{CATEGORY_META[k].label}</option>
                          ))}
                        </select>
                      ) : (
                        <CategoryBadge category={r.category} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {isEditing ? (
                        <Input
                          value={editForm.iso_clause_reference ?? ""}
                          onChange={e => setEditForm(f => ({ ...f, iso_clause_reference: e.target.value || null }))}
                          className="text-xs h-7 w-24"
                          placeholder="§x.x"
                        />
                      ) : (
                        r.iso_clause_reference ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.is_an_authorization ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700">
                          <Shield size={11} /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={saveEdit} className="p-1 rounded hover:bg-green-50 text-green-600">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(r)} className="p-1 rounded hover:bg-slate-100 text-slate-400 text-xs">
                              Edit
                            </button>
                            <button
                              onClick={() => remove.mutate(r.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    No responsibility statements found.{" "}
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Add the first one.
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Functional Roles tab ───────────────────────────────────────────────────────

function RolesTab() {
  const { data: roles = [], isLoading } = useFunctionalRoles();
  const create = useCreateFunctionalRole();
  const remove = useDeleteFunctionalRole();
  const [name, setName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync({ name });
    setName("");
  };

  const SYSTEM_KEY_LABELS: Record<string, string> = {
    QM: "Quality Manager",
    TM: "Technical Manager",
    TRM: "Training Manager",
    GM: "General Manager",
  };

  return (
    <div className="space-y-4 max-w-xl">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Functional role name, e.g. Quality Manager"
          className="flex-1"
        />
        <Button type="submit" disabled={create.isPending || !name.trim()}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
        </Button>
      </form>

      {isLoading ? <Spinner /> : (
        <div className="rounded-xl border bg-white overflow-hidden">
          {roles.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-sm">No functional roles defined.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Role Name</th>
                  <th className="px-4 py-3">System Key</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {roles.map(role => (
                  <tr key={role.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{role.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">
                      {role.system_key
                        ? <span title={SYSTEM_KEY_LABELS[role.system_key]}>{role.system_key}</span>
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => remove.mutate(role.id)}
                        className="p-1 rounded hover:bg-red-50 text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Position Assignments tab ───────────────────────────────────────────────────

function AssignmentsTab() {
  const { data: positions = [], isLoading: posLoading } = usePositions();
  const { data: responsibilities = [] } = useResponsibilities();
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  const { data: assigned = [], isLoading: assignLoading } =
    usePositionResponsibilities(selectedPositionId);
  const assign = useAssignPositionResponsibility();
  const remove = useRemovePositionResponsibility();

  const [addingId, setAddingId] = useState<number | "">("");

  const assignedIds = new Set(assigned.map(a => a.responsibility_id));
  const available = responsibilities.filter(r => !assignedIds.has(r.id));

  const handleAssign = async () => {
    if (!selectedPositionId || !addingId) return;
    await assign.mutateAsync({
      positionId: selectedPositionId,
      data: { responsibility_id: Number(addingId) },
    });
    setAddingId("");
  };

  const selectedPosition = positions.find(p => p.id === selectedPositionId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label>Select Position</Label>
          {posLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : (
            <select
              className="border rounded-lg px-3 py-2 text-sm min-w-64"
              value={selectedPositionId ?? ""}
              onChange={e => setSelectedPositionId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— choose a position —</option>
              {positions.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedPositionId && selectedPosition && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-slate-800">{selectedPosition.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {assigned.length} responsibility statement{assigned.length !== 1 ? "s" : ""} assigned
              </p>
            </div>
            {available.length > 0 && (
              <div className="flex gap-2 items-center">
                <select
                  className="border rounded-lg px-2 py-1.5 text-sm"
                  value={addingId}
                  onChange={e => setAddingId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Add responsibility…</option>
                  {available.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.category}] {r.statement.slice(0, 60)}{r.statement.length > 60 ? "…" : ""}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!addingId || assign.isPending}
                  onClick={handleAssign}
                >
                  <Link2 className="h-3.5 w-3.5 mr-1.5" /> Assign
                </Button>
              </div>
            )}
          </div>

          {assignLoading ? (
            <Spinner />
          ) : assigned.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-sm">
              No responsibilities assigned to this position yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2">Statement</th>
                  <th className="px-4 py-2 w-28">Category</th>
                  <th className="px-4 py-2 w-24">ISO Ref</th>
                  <th className="px-4 py-2 w-24">Auth</th>
                  <th className="px-4 py-2 w-16">Duty</th>
                  <th className="px-4 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assigned.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <span className="text-slate-800">
                        {a.override_statement ?? a.responsibility_statement ?? "—"}
                      </span>
                      {a.override_statement && (
                        <span className="ml-2 text-xs text-amber-600">(overridden)</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <CategoryBadge category={a.responsibility_category ?? "general"} />
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500">
                      {a.iso_clause_reference ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {responsibilities.find(r => r.id === a.responsibility_id)?.is_an_authorization ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700">
                          <Shield size={11} /> Auth
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs ${a.is_primary_duty ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                        {a.is_primary_duty ? "Primary" : "Secondary"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() =>
                          remove.mutate({ positionId: selectedPositionId, linkId: a.id })
                        }
                        className="p-1 rounded hover:bg-red-50 text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selectedPositionId && (
        <div className="rounded-xl border bg-slate-50 p-10 text-center text-slate-400">
          <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Select a position above to view and manage its responsibilities.</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResponsibilitiesPage() {
  return (
    <LimsPageLayout
      title="Responsibilities & Roles"
      description="ISO 17025 §6.2 — Define responsibility statements, functional roles, and assign them to positions"
    >
      <Tabs defaultValue="library">
        <TabsList className="mb-4">
          <TabsTrigger value="library">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Responsibility Library
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Link2 className="h-3.5 w-3.5 mr-1.5" /> Position Assignments
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-3.5 w-3.5 mr-1.5" /> Functional Roles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="library"><LibraryTab /></TabsContent>
        <TabsContent value="assignments"><AssignmentsTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
      </Tabs>
    </LimsPageLayout>
  );
}
