"use client";

import { useState } from "react";
import {
  Users, Pencil, Trash2, Plus, X, Check, ChevronDown, ChevronRight,
  Briefcase, ArrowRightLeft, Loader2, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ExcelButtons } from "@/components/ExcelButtons";
import { limsApi } from "@/lib/lims-api";
import {
  useEmployees, useUpdateEmployee, useDeleteEmployee,
  useAssignPosition, useRemovePosition,
  useDelegations, useCreateDelegation, useActivateDelegation, useRevokeDelegation, useDeleteDelegation,
} from "@/features/lims/employees/employees.queries";
import { usePositions } from "@/features/lims/positions/positions.queries";
import type {
  EmployeeRead, EmployeeUpdate, EmployeePositionCreate,
  DelegationRead, DelegationCreate, ActivationType,
} from "@/features/lims/employees/employees.api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString();
}

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  planned:  { label: "Planned",  bg: "bg-slate-100",  text: "text-slate-600" },
  active:   { label: "Active",   bg: "bg-green-100",  text: "text-green-700" },
  expired:  { label: "Expired",  bg: "bg-red-100",    text: "text-red-700" },
  revoked:  { label: "Revoked",  bg: "bg-orange-100", text: "text-orange-700" },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, bg: "bg-slate-100", text: "text-slate-600" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>{m.label}</span>
  );
}

function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>;
}

// ── Edit employee dialog ──────────────────────────────────────────────────────

function EditDialog({
  employee,
  onClose,
}: {
  employee: EmployeeRead;
  onClose: () => void;
}) {
  const update = useUpdateEmployee();
  const [form, setForm] = useState<EmployeeUpdate>({
    first_name: employee.first_name,
    last_name: employee.last_name,
    employee_id_number: employee.employee_id_number,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({ id: employee.id, data: form });
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name</Label>
              <Input value={form.first_name ?? ""} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input value={form.last_name ?? ""} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Employee ID</Label>
            <Input value={form.employee_id_number ?? ""} onChange={e => setForm(f => ({ ...f, employee_id_number: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={update.isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign position dialog ────────────────────────────────────────────────────

function AssignPositionDialog({
  employee,
  onClose,
}: {
  employee: EmployeeRead;
  onClose: () => void;
}) {
  const assign = useAssignPosition();
  const { data: positions = [] } = usePositions();
  const [form, setForm] = useState<EmployeePositionCreate>({ position_id: 0, is_primary: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.position_id) return;
    await assign.mutateAsync({ employeeId: employee.id, data: form });
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Assign Position — {employee.first_name} {employee.last_name}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <div className="space-y-1">
            <Label>Position *</Label>
            <select
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.position_id || ""}
              onChange={e => setForm(f => ({ ...f, position_id: Number(e.target.value) }))}
            >
              <option value="">Select position…</option>
              {positions.filter(p => p.is_active).map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date ?? ""} onChange={e => setForm(f => ({ ...f, start_date: e.target.value || null }))} />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input type="date" value={form.end_date ?? ""} onChange={e => setForm(f => ({ ...f, end_date: e.target.value || null }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_primary} onChange={e => setForm(f => ({ ...f, is_primary: e.target.checked }))} />
            Primary position
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={assign.isPending || !form.position_id}>Assign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Employee row ──────────────────────────────────────────────────────────────

function EmployeeRow({ emp }: { emp: EmployeeRead }) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const remove = useDeleteEmployee();
  const removePos = useRemovePosition();

  const primary = emp.positions.find(p => p.is_primary) ?? emp.positions[0];

  return (
    <>
      <tr className="hover:bg-slate-50 border-b last:border-0">
        <td className="px-4 py-3">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-600"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-slate-800">{emp.first_name} {emp.last_name}</p>
          <p className="text-xs text-slate-400 font-mono">{emp.employee_id_number}</p>
        </td>
        <td className="px-4 py-3 text-sm text-slate-500">{emp.email ?? "–"}</td>
        <td className="px-4 py-3">
          {primary ? (
            <div>
              <p className="text-sm font-medium text-slate-700">{primary.position_title}</p>
              <p className="text-xs text-slate-400">{primary.department_name}</p>
            </div>
          ) : (
            <span className="text-slate-300 text-xs">No position</span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-slate-400">{emp.positions.length} position{emp.positions.length !== 1 ? "s" : ""}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1 justify-end">
            <button onClick={() => setAssignOpen(true)} className="p-1 rounded hover:bg-blue-50 text-blue-400" title="Assign position">
              <Briefcase size={14} />
            </button>
            <button onClick={() => setEditOpen(true)} className="p-1 rounded hover:bg-slate-100 text-slate-400" title="Edit">
              <Pencil size={14} />
            </button>
            <button onClick={() => setDeleteConfirm(true)} className="p-1 rounded hover:bg-red-50 text-red-400" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50 border-b">
          <td />
          <td colSpan={5} className="px-4 py-3">
            {emp.positions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No positions assigned.</p>
            ) : (
              <div className="space-y-1.5">
                {emp.positions.map(pos => (
                  <div key={pos.id} className="flex items-center gap-3 text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${pos.is_primary ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {pos.is_primary ? "Primary" : "Secondary"}
                    </span>
                    <span className="font-medium text-slate-700">{pos.position_title}</span>
                    <span className="text-slate-400">{pos.department_name}</span>
                    {pos.start_date && <span className="text-slate-400">{fmtDate(pos.start_date)} →</span>}
                    {pos.end_date && <span className="text-slate-400">{fmtDate(pos.end_date)}</span>}
                    <button
                      onClick={() => removePos.mutate({ employeeId: emp.id, linkId: pos.id })}
                      className="ml-auto p-0.5 rounded hover:bg-red-50 text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}

      {editOpen && <EditDialog employee={emp} onClose={() => setEditOpen(false)} />}
      {assignOpen && <AssignPositionDialog employee={emp} onClose={() => setAssignOpen(false)} />}

      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Employee</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{emp.first_name} {emp.last_name}</strong>? This will remove the employee profile but not the user account.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => { remove.mutate(emp.id); setDeleteConfirm(false); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Delegations panel ─────────────────────────────────────────────────────────

function DelegationsPanel({ employees }: { employees: EmployeeRead[] }) {
  const { data: delegations = [], isLoading } = useDelegations();
  const createDelegation = useCreateDelegation();
  const activate = useActivateDelegation();
  const revoke = useRevokeDelegation();
  const remove = useDeleteDelegation();

  const [showForm, setShowForm] = useState(false);
  const { data: positions = [] } = usePositions();

  const emptyForm = (): DelegationCreate => ({
    primary_employee_id: 0,
    deputy_employee_id: 0,
    position_id: 0,
    scope: null,
    start_date: "",
    end_date: "",
    activation_type: "admin",
  });
  const [form, setForm] = useState<DelegationCreate>(emptyForm());

  function sf<K extends keyof DelegationCreate>(k: K, v: DelegationCreate[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.primary_employee_id || !form.deputy_employee_id || !form.position_id) return;
    await createDelegation.mutateAsync(form);
    setForm(emptyForm());
    setShowForm(false);
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Authority delegations between employees</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <Plus size={14} /> New Delegation
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-slate-700 text-sm">New Authority Delegation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Primary Employee *</label>
              <select required className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.primary_employee_id || ""} onChange={e => sf("primary_employee_id", Number(e.target.value))}>
                <option value="">Select…</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Deputy *</label>
              <select required className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.deputy_employee_id || ""} onChange={e => sf("deputy_employee_id", Number(e.target.value))}>
                <option value="">Select…</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Position *</label>
              <select required className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.position_id || ""} onChange={e => sf("position_id", Number(e.target.value))}>
                <option value="">Select…</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Start *</label>
              <Input type="datetime-local" required value={form.start_date} onChange={e => sf("start_date", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">End *</label>
              <Input type="datetime-local" required value={form.end_date} onChange={e => sf("end_date", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Activation</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.activation_type} onChange={e => sf("activation_type", e.target.value as ActivationType)}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="self">Self</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="block text-xs text-slate-500 mb-1">Scope / Notes</label>
              <Input value={form.scope ?? ""} onChange={e => sf("scope", e.target.value || null)} placeholder="Authority scope description…" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={createDelegation.isPending}>Create Delegation</Button>
          </div>
        </form>
      )}

      {delegations.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">No delegations yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Primary</th>
                <th className="px-4 py-3">Deputy</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {delegations.map((d: DelegationRead) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.primary_employee_name ?? `#${d.primary_employee_id}`}</td>
                  <td className="px-4 py-3 text-slate-600">{d.deputy_employee_name ?? `#${d.deputy_employee_id}`}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{d.position_title ?? `#${d.position_id}`}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {fmtDate(d.start_date)} – {fmtDate(d.end_date)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{d.scope ?? "–"}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      {d.status === "planned" && (
                        <button onClick={() => activate.mutate(d.id)} className="p-1 rounded hover:bg-green-50 text-green-600" title="Activate">
                          <Check size={14} />
                        </button>
                      )}
                      {d.status === "active" && (
                        <button onClick={() => revoke.mutate(d.id)} className="p-1 rounded hover:bg-orange-50 text-orange-500" title="Revoke">
                          <X size={14} />
                        </button>
                      )}
                      <button onClick={() => remove.mutate(d.id)} className="p-1 rounded hover:bg-red-50 text-red-400" title="Delete">
                        <Trash2 size={14} />
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
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "employees" | "delegations";

export default function EmployeesPage() {
  const [tab, setTab] = useState<Tab>("employees");
  const { data: employees = [], isLoading } = useEmployees();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={22} /> Employees
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Employee profiles, position assignments, and authority delegations
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <ExcelButtons
            exportFilename="employees"
            onExport={async () => {
              const res = await limsApi.get<unknown[]>("/employees/");
              const rows = Array.isArray(res.data) ? res.data : [];
              return (rows as Record<string, unknown>[]).map((e) => ({
                employee_id_number: e.employee_id_number,
                first_name: e.first_name,
                last_name: e.last_name,
                email: e.email ?? "",
              }));
            }}
            onImport={async (rows) => {
              const result = await limsApi.post<{ imported: number; errors: { row: number; message: string }[] }>(
                "/employees/import",
                rows,
              );
              return result.data;
            }}
          />
        </div>
      </div>

      <div className="border-b flex gap-1">
        {(["employees", "delegations"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === "employees" ? <Users size={13} /> : <ArrowRightLeft size={13} />}
            {t === "employees" ? `Employees (${employees.length})` : "Delegations"}
          </button>
        ))}
      </div>

      {tab === "employees" && (
        isLoading ? <Spinner /> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3 w-8"></th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Primary Position</th>
                  <th className="px-4 py-3">Positions</th>
                  <th className="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => <EmployeeRow key={emp.id} emp={emp} />)}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                      No employees yet. Create users via the Users page to add employee profiles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "delegations" && <DelegationsPanel employees={employees} />}
    </div>
  );
}
