"use client";

import React, { useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { intakeApi, type IntakeStagedData, type DeptRow, type PosRow, type EmpRow, type InstrRow, type MethodRow, type ClientRow } from "@/features/consultant/intake.api";
import { toast } from "sonner";
import {
  Building2, Users, Wrench, FlaskConical, UserCheck, Plus, Trash2,
  CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight, Send,
} from "lucide-react";

// ─── Empty row factories ────────────────────────────────────────────────────

const emptyDept = (): DeptRow => ({ code: "", name: "", parent_code: "" });
const emptyPos = (): PosRow => ({ title: "", department_code: "", supervisor_title: "" });
const emptyEmp = (): EmpRow => ({ employee_id_number: "", first_name: "", last_name: "", email: "" });
const emptyInstr = (): InstrRow => ({ code: "", name: "", manufacturer: "", model_number: "", serial_number: "", location: "", description: "" });
const emptyMethod = (): MethodRow => ({ code: "", name: "", unit: "", version: "", description: "" });
const emptyClient = (): ClientRow => ({ code: "", name: "", client_type: "", contact_name: "", contact_email: "", contact_phone: "", city: "", country: "" });

// ─── Generic row editor ─────────────────────────────────────────────────────

type FieldDef<T> = { key: keyof T; label: string; required?: boolean; placeholder?: string };

function RowTable<T extends Record<string, string | undefined>>({
  title,
  icon: Icon,
  rows,
  fields,
  emptyRow,
  onChange,
  accentColor,
}: {
  title: string;
  icon: React.ElementType;
  rows: T[];
  fields: FieldDef<T>[];
  emptyRow: () => T;
  onChange: (rows: T[]) => void;
  accentColor: string;
}) {
  const [open, setOpen] = useState(true);

  const update = (i: number, key: keyof T, val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  const addRow = () => onChange([...rows, emptyRow()]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  const requiredKeys = fields.filter((f) => f.required).map((f) => f.key);
  const rowValid = (r: T) => requiredKeys.every((k) => r[k as string]);

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${accentColor} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {fields.map((f) => (
                    <th key={String(f.key)} className="text-left px-3 py-2 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {f.label}
                      {f.required && <span className="text-red-500 ml-0.5">*</span>}
                    </th>
                  ))}
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className={rowValid(row) ? "" : "bg-red-50/30"}>
                    {fields.map((f) => (
                      <td key={String(f.key)} className="px-2 py-1.5">
                        <input
                          type="text"
                          value={(row[f.key as string] as string) ?? ""}
                          onChange={(e) => update(i, f.key, e.target.value)}
                          placeholder={f.placeholder ?? ""}
                          className={`w-full px-2 py-1 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                            f.required && !row[f.key as string]
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Add row
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function IntakeFormPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const schema = searchParams.get("schema") ?? undefined;

  const [departments, setDepartments] = useState<DeptRow[]>([emptyDept()]);
  const [positions, setPositions] = useState<PosRow[]>([emptyPos()]);
  const [employees, setEmployees] = useState<EmpRow[]>([emptyEmp()]);
  const [instruments, setInstruments] = useState<InstrRow[]>([emptyInstr()]);
  const [methods, setMethods] = useState<MethodRow[]>([emptyMethod()]);
  const [clients, setClients] = useState<ClientRow[]>([emptyClient()]);
  const [submitted, setSubmitted] = useState(false);

  const { data: info, isLoading, error } = useQuery({
    queryKey: ["intake-public", token],
    queryFn: () => intakeApi.getPublicInfo(token, schema),
    retry: false,
  });

  const submit = useMutation({
    mutationFn: (data: IntakeStagedData) => intakeApi.submitPublicData(token, data, schema),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Data submitted successfully. The consultant will review and import it.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stripEmpty = <T extends Record<string, string | undefined>>(
    rows: T[],
    requiredKeys: (keyof T)[]
  ): T[] => rows.filter((r) => requiredKeys.some((k) => r[k as string]?.trim()));

  const handleSubmit = () => {
    const depts = stripEmpty(departments, ["code", "name"]);
    const pos = stripEmpty(positions, ["title", "department_code"]);
    const emps = stripEmpty(employees, ["employee_id_number", "first_name", "last_name", "email"]);
    const instrs = stripEmpty(instruments, ["code", "name"]);
    const meths = stripEmpty(methods, ["code", "name"]);
    const cls = stripEmpty(clients, ["code", "name"]);

    submit.mutate({
      departments: depts,
      positions: pos,
      employees: emps,
      instruments: instrs,
      methods: meths,
      clients: cls,
    });
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-gray-500">Loading intake session…</p>
      </div>
    );
  }

  // ── Error / not found ──
  if (error || !info) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Session Not Found</h2>
        <p className="text-gray-500 max-w-sm">
          This intake link is invalid, has expired, or has already been used. Please contact your consultant for a new link.
        </p>
      </div>
    );
  }

  // ── Expired ──
  if (info.is_expired) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Link Expired</h2>
        <p className="text-gray-500 max-w-sm">
          This intake link expired on {new Date(info.expires_at).toLocaleDateString()}. Please contact your consultant for a new link.
        </p>
      </div>
    );
  }

  // ── Already confirmed / submitted ──
  if (info.is_confirmed || submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {info.is_confirmed ? "Already Imported" : "Submitted!"}
        </h2>
        <p className="text-gray-500 max-w-sm">
          {info.is_confirmed
            ? "This data has already been reviewed and imported into the laboratory system."
            : "Your data has been submitted and is waiting for the consultant to review and import."}
        </p>
      </div>
    );
  }

  // ── Already has data waiting ──
  if (info.has_data && !submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Data Already Submitted</h2>
        <p className="text-gray-500 max-w-sm">
          Data has already been submitted for this session and is awaiting review by the consultant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laboratory Data Intake</h1>
        {info.label && <p className="text-gray-500 mt-1">{info.label}</p>}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Expires {new Date(info.expires_at).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        Fill in the tables below with your laboratory data. Only rows with at least one required field filled will be submitted.
        Fields marked with <span className="text-red-500 font-medium">*</span> are required within each row.
      </p>

      {/* Departments */}
      <RowTable<DeptRow>
        title="Departments"
        icon={Building2}
        rows={departments}
        emptyRow={emptyDept}
        onChange={setDepartments}
        accentColor="bg-blue-600"
        fields={[
          { key: "code", label: "Code", required: true, placeholder: "e.g. CHEM" },
          { key: "name", label: "Name", required: true, placeholder: "e.g. Chemistry Lab" },
          { key: "parent_code", label: "Parent Code", placeholder: "e.g. LAB (optional)" },
        ]}
      />

      {/* Positions */}
      <RowTable<PosRow>
        title="Positions"
        icon={UserCheck}
        rows={positions}
        emptyRow={emptyPos}
        onChange={setPositions}
        accentColor="bg-violet-600"
        fields={[
          { key: "title", label: "Title", required: true, placeholder: "e.g. Lab Analyst" },
          { key: "department_code", label: "Department Code", required: true, placeholder: "e.g. CHEM" },
          { key: "supervisor_title", label: "Supervisor Title", placeholder: "e.g. Lab Manager" },
        ]}
      />

      {/* Employees */}
      <RowTable<EmpRow>
        title="Employees"
        icon={Users}
        rows={employees}
        emptyRow={emptyEmp}
        onChange={setEmployees}
        accentColor="bg-emerald-600"
        fields={[
          { key: "employee_id_number", label: "Employee ID", required: true, placeholder: "e.g. EMP001" },
          { key: "first_name", label: "First Name", required: true, placeholder: "e.g. Ali" },
          { key: "last_name", label: "Last Name", required: true, placeholder: "e.g. Hosseini" },
          { key: "email", label: "Email", required: true, placeholder: "e.g. ali@lab.com" },
        ]}
      />

      {/* Instruments */}
      <RowTable<InstrRow>
        title="Instruments & Equipment"
        icon={Wrench}
        rows={instruments}
        emptyRow={emptyInstr}
        onChange={setInstruments}
        accentColor="bg-orange-600"
        fields={[
          { key: "code", label: "Code", required: true, placeholder: "e.g. HPLC-01" },
          { key: "name", label: "Name", required: true, placeholder: "e.g. HPLC System" },
          { key: "manufacturer", label: "Manufacturer", placeholder: "e.g. Agilent" },
          { key: "model_number", label: "Model", placeholder: "e.g. 1260 Infinity" },
          { key: "serial_number", label: "Serial No.", placeholder: "" },
          { key: "location", label: "Location", placeholder: "e.g. Room 204" },
        ]}
      />

      {/* Methods */}
      <RowTable<MethodRow>
        title="Test Methods"
        icon={FlaskConical}
        rows={methods}
        emptyRow={emptyMethod}
        onChange={setMethods}
        accentColor="bg-cyan-600"
        fields={[
          { key: "code", label: "Code", required: true, placeholder: "e.g. TM-001" },
          { key: "name", label: "Name", required: true, placeholder: "e.g. pH Measurement" },
          { key: "unit", label: "Unit", placeholder: "e.g. pH" },
          { key: "version", label: "Version", placeholder: "e.g. 1.0" },
          { key: "description", label: "Description", placeholder: "" },
        ]}
      />

      {/* Clients */}
      <RowTable<ClientRow>
        title="Clients"
        icon={Building2}
        rows={clients}
        emptyRow={emptyClient}
        onChange={setClients}
        accentColor="bg-rose-600"
        fields={[
          { key: "code", label: "Code", required: true, placeholder: "e.g. CLT001" },
          { key: "name", label: "Name", required: true, placeholder: "e.g. Acme Corp" },
          { key: "client_type", label: "Type", placeholder: "e.g. Industrial" },
          { key: "contact_name", label: "Contact", placeholder: "" },
          { key: "contact_email", label: "Email", placeholder: "" },
          { key: "contact_phone", label: "Phone", placeholder: "" },
          { key: "city", label: "City", placeholder: "" },
          { key: "country", label: "Country", placeholder: "" },
        ]}
      />

      {/* Submit */}
      <div className="sticky bottom-0 bg-white border-t shadow-lg rounded-t-xl px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Review your data above, then submit for consultant review.
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submit.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium transition-colors"
        >
          {submit.isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit Data
        </button>
      </div>
    </div>
  );
}
