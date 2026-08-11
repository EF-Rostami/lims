"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, PauseCircle, PlayCircle, Users } from "lucide-react";
import {
  useConsultants,
  useCreateConsultant,
  useDeleteConsultant,
  useUpdateConsultant,
} from "@/features/saas/consultancy/consultancy-assignments.queries";
import type { Consultant, ConsultantStatus } from "@/features/saas/consultancy/consultancy-assignments.api";

const STATUS_STYLES: Record<ConsultantStatus, string> = {
  ACTIVE:    "bg-green-100 text-green-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
  WITHDRAWN: "bg-red-100 text-red-700",
};

type FormState = { email: string; full_name: string; company: string; phone: string };
const EMPTY: FormState = { email: "", full_name: "", company: "", phone: "" };

export default function ConsultantsPage() {
  const { data: consultants = [], isLoading } = useConsultants();
  const createConsultant = useCreateConsultant();
  const updateConsultant = useUpdateConsultant();
  const deleteConsultant = useDeleteConsultant();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setFormError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (c: Consultant) => {
    setEditId(c.id);
    setForm({
      email: c.email,
      full_name: c.full_name,
      company: c.company ?? "",
      phone: c.phone ?? "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.email || !form.full_name) {
      setFormError("Email and full name are required.");
      return;
    }
    try {
      const payload = {
        email: form.email,
        full_name: form.full_name,
        company: form.company || undefined,
        phone: form.phone || undefined,
      };
      if (editId !== null) {
        await updateConsultant.mutateAsync({ id: editId, payload });
      } else {
        await createConsultant.mutateAsync(payload);
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditId(null);
    } catch {
      setFormError(editId ? "Failed to update consultant." : "Failed to create — email may already exist.");
    }
  };

  const handleToggleStatus = (c: Consultant) => {
    const newStatus: ConsultantStatus = c.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateConsultant.mutate({ id: c.id, payload: { status: newStatus } });
  };

  const handleWithdraw = (c: Consultant) => {
    if (!confirm(`Mark ${c.full_name} as withdrawn? They can be reactivated later.`)) return;
    updateConsultant.mutate({ id: c.id, payload: { status: "WITHDRAWN" } });
  };

  const handleDelete = (c: Consultant) => {
    if (!confirm(`Permanently delete ${c.full_name}? This also removes all their assignments.`)) return;
    deleteConsultant.mutate(c.id);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Consultants</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registry of all QMS consultants. Add a consultant here before assigning them to a lab.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{consultants.length} total</span>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Consultant
          </button>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            {editId !== null ? "Edit Consultant" : "New Consultant"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Email *"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                disabled={editId !== null}
                placeholder="consultant@example.com"
              />
              <Field
                label="Full Name *"
                value={form.full_name}
                onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
                placeholder="Jane Smith"
              />
              <Field
                label="Company"
                value={form.company}
                onChange={(v) => setForm((f) => ({ ...f, company: v }))}
                placeholder="QMS Consulting Ltd."
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                placeholder="+49 89 123456"
              />
            </div>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createConsultant.isPending || updateConsultant.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {createConsultant.isPending || updateConsultant.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400 animate-pulse">Loading…</div>
        ) : consultants.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            No consultants yet. Click &quot;Add Consultant&quot; to register the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultants.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.company ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        {c.status === "ACTIVE" && (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> Suspend
                          </button>
                        )}
                        {c.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50 transition-colors"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Reactivate
                          </button>
                        )}
                        {c.status !== "WITHDRAWN" && (
                          <button
                            onClick={() => handleWithdraw(c)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> Withdraw
                          </button>
                        )}
                        {c.status === "WITHDRAWN" && (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50 transition-colors"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}
