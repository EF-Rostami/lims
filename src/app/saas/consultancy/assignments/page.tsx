"use client";

import { useState } from "react";
import { Trash2, UserCheck, PauseCircle, XCircle, PlayCircle, Copy, Check, KeyRound } from "lucide-react";
import {
  useAssignments,
  useConsultants,
  useCreateAssignment,
  useDeleteAssignment,
  useLabOptions,
  useUpdateAssignmentStatus,
} from "@/features/saas/consultancy/consultancy-assignments.queries";
import type { AssignmentStatus } from "@/features/saas/consultancy/consultancy-assignments.api";

const STATUS_STYLES: Record<AssignmentStatus, string> = {
  ACTIVE:    "bg-green-100 text-green-700",
  SUSPENDED: "bg-amber-100 text-amber-700",
  WITHDRAWN: "bg-red-100 text-red-700",
};

export default function ConsultancyAssignmentsPage() {
  const { data: assignments = [], isLoading } = useAssignments();
  const { data: consultants = [] } = useConsultants();
  const { data: labs = [] } = useLabOptions();

  const createAssignment = useCreateAssignment();
  const updateStatus = useUpdateAssignmentStatus();
  const deleteAssignment = useDeleteAssignment();

  const [consultantEmail, setConsultantEmail] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{ password: string; labName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const activeConsultants = consultants.filter((c) => c.status === "ACTIVE");

  const selectedLabOption = labs.find((l) => l.tenant_schema === selectedLab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!consultantEmail || !selectedLab) {
      setFormError("Please select both a consultant and a lab.");
      return;
    }
    const lab = labs.find((l) => l.tenant_schema === selectedLab);
    if (!lab) return;
    try {
      const result = await createAssignment.mutateAsync({
        consultant_email: consultantEmail,
        tenant_schema: lab.tenant_schema,
        tenant_name: lab.tenant_name,
        org_name: lab.org_name,
      });
      setConsultantEmail("");
      setSelectedLab("");
      if (result.temp_password) {
        setTempPassword({ password: result.temp_password, labName: lab.tenant_name });
        setCopied(false);
      }
    } catch {
      setFormError("Failed to create assignment. This combination may already exist.");
    }
  };

  const handleCopy = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (id: number, newStatus: AssignmentStatus) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this assignment?")) return;
    deleteAssignment.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Consultant Assignments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign consultants to labs. Only active assignments appear in the consultant&apos;s My Labs view.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <UserCheck className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Create form */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">New Assignment</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Consultant dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Consultant</label>
              <select
                value={consultantEmail}
                onChange={(e) => setConsultantEmail(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select consultant —</option>
                {activeConsultants.map((c) => (
                  <option key={c.id} value={c.email}>
                    {c.full_name} ({c.email}){c.company ? ` · ${c.company}` : ""}
                  </option>
                ))}
              </select>
              {activeConsultants.length === 0 && (
                <p className="text-xs text-amber-600">
                  No active consultants. Add them on the{" "}
                  <a href="/saas/consultancy/consultants" className="underline">Consultants</a> page first.
                </p>
              )}
            </div>

            {/* Lab dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Laboratory</label>
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select lab —</option>
                {labs.map((l) => (
                  <option key={l.tenant_schema} value={l.tenant_schema}>
                    {l.tenant_name} · {l.org_name}
                  </option>
                ))}
              </select>
              {selectedLabOption && (
                <p className="text-xs text-slate-400 font-mono">{selectedLabOption.tenant_schema}</p>
              )}
            </div>
          </div>

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createAssignment.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {createAssignment.isPending ? "Saving…" : "Assign"}
            </button>
          </div>
        </form>
      </div>

      {/* Assignments table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400 animate-pulse">Loading…</div>
        ) : assignments.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            No assignments yet. Use the form above to link a consultant to a lab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Consultant</th>
                  <th className="px-4 py-3 text-left">Organisation</th>
                  <th className="px-4 py-3 text-left">Lab</th>
                  <th className="px-4 py-3 text-left">Assigned</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {consultants.find((c) => c.email === a.consultant_email)?.full_name ?? a.consultant_email}
                      </div>
                      <div className="text-xs text-slate-400">{a.consultant_email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{a.org_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">{a.tenant_name}</div>
                      <div className="text-xs font-mono text-slate-400">{a.tenant_schema}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(a.assigned_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {a.status === "ACTIVE" && (
                          <>
                            <ActionBtn
                              icon={<PauseCircle className="h-3.5 w-3.5" />}
                              label="Suspend"
                              color="amber"
                              onClick={() => handleStatusChange(a.id, "SUSPENDED")}
                              disabled={updateStatus.isPending}
                            />
                            <ActionBtn
                              icon={<XCircle className="h-3.5 w-3.5" />}
                              label="Withdraw"
                              color="red"
                              onClick={() => handleStatusChange(a.id, "WITHDRAWN")}
                              disabled={updateStatus.isPending}
                            />
                          </>
                        )}
                        {(a.status === "SUSPENDED" || a.status === "WITHDRAWN") && (
                          <ActionBtn
                            icon={<PlayCircle className="h-3.5 w-3.5" />}
                            label="Reactivate"
                            color="green"
                            onClick={() => handleStatusChange(a.id, "ACTIVE")}
                            disabled={updateStatus.isPending}
                          />
                        )}
                        <ActionBtn
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          label="Delete"
                          color="red"
                          onClick={() => handleDelete(a.id)}
                          disabled={deleteAssignment.isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        <strong>Suspend</strong> — temporarily hides the lab from the consultant&apos;s view. Can be reactivated.{" "}
        <strong>Withdraw</strong> — marks the relationship as ended. Can be reactivated if needed.{" "}
        <strong>Delete</strong> — permanently removes the record.
      </p>

      {/* Temp password modal */}
      {tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Consultant Account Created</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  A new account was provisioned in{" "}
                  <span className="font-medium text-slate-700">{tempPassword.labName}</span>.
                  Share this temporary password with the consultant.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
              <span className="font-mono text-base font-semibold text-slate-800 tracking-wider select-all">
                {tempPassword.password}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors shrink-0"
              >
                {copied
                  ? <><Check className="h-3.5 w-3.5 text-green-600" /> Copied</>
                  : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            </div>

            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This password will not be shown again. The consultant can change it after their first login.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setTempPassword(null)}
                className="px-5 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                I have noted this password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon, label, color, onClick, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  color: "amber" | "red" | "green";
  onClick: () => void;
  disabled?: boolean;
}) {
  const colors = {
    amber: "text-amber-600 hover:bg-amber-50",
    red:   "text-red-600 hover:bg-red-50",
    green: "text-green-700 hover:bg-green-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${colors[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}
