"use client";

import { useState } from "react";
import {
  useMUBudgets, useCreateMUBudget, useUpdateMUBudget, useDeleteMUBudget,
  useAddMUComponent, useUpdateMUComponent, useDeleteMUComponent,
  useMURules, useCreateMURule, useUpdateMURule, useDeleteMURule,
  useMUEntries, useCreateMUEntry, useUpdateMUEntry, useDeleteMUEntry,
  useMUBreakdown,
} from "@/features/lims/mu/mu.queries";
import type {
  MUBudgetRead, MUComponentRead, MUDecisionRuleRead, MUResultEntryRead,
  ComponentType, Distribution,
} from "@/features/lims/mu/mu.api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number | null | undefined, decimals = 4): string {
  if (v == null) return "—";
  return v.toFixed(decimals);
}

function verdictBadge(verdict: string | null | undefined) {
  if (!verdict) return null;
  const styles: Record<string, string> = {
    conforming: "bg-green-100 text-green-800",
    non_conforming: "bg-red-100 text-red-800",
    undecided: "bg-yellow-100 text-yellow-800",
    no_limits: "bg-slate-100 text-slate-600",
  };
  const labels: Record<string, string> = {
    conforming: "Conforming",
    non_conforming: "Non-Conforming",
    undecided: "Undecided (Guard Band)",
    no_limits: "No Limits Set",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[verdict] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[verdict] ?? verdict}
    </span>
  );
}

const DISTRIBUTIONS: Distribution[] = ["normal", "rectangular", "triangular"];
const DIVISORS: Record<Distribution, number> = {
  normal: 1,
  rectangular: Math.sqrt(3),
  triangular: Math.sqrt(6),
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "budgets" | "entries" | "rules";

// ── Budgets Tab ───────────────────────────────────────────────────────────────

function BudgetsTab() {
  const { data: budgets = [], isLoading } = useMUBudgets();
  const createBudget = useCreateMUBudget();
  const updateBudget = useUpdateMUBudget();
  const deleteBudget = useDeleteMUBudget();
  const addComponent = useAddMUComponent();
  const updateComponent = useUpdateMUComponent();
  const deleteComponent = useDeleteMUComponent();

  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    method_id: "", name: "", coverage_factor: "2", confidence_level: "95.45", description: "",
  });
  const [compForm, setCompForm] = useState({
    name: "", component_type: "type_b" as ComponentType,
    distribution: "normal" as Distribution, u_value: "", sensitivity_coefficient: "1", notes: "",
  });
  const [editingComp, setEditingComp] = useState<number | null>(null);

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId) ?? null;

  async function handleCreateBudget(e: React.FormEvent) {
    e.preventDefault();
    await createBudget.mutateAsync({
      method_id: Number(budgetForm.method_id),
      name: budgetForm.name,
      coverage_factor: Number(budgetForm.coverage_factor),
      confidence_level: Number(budgetForm.confidence_level),
      description: budgetForm.description || null,
    });
    setShowBudgetForm(false);
    setBudgetForm({ method_id: "", name: "", coverage_factor: "2", confidence_level: "95.45", description: "" });
  }

  async function handleAddComponent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBudgetId) return;
    await addComponent.mutateAsync({
      budgetId: selectedBudgetId,
      data: {
        name: compForm.name,
        component_type: compForm.component_type,
        distribution: compForm.distribution,
        u_value: compForm.u_value ? Number(compForm.u_value) : null,
        sensitivity_coefficient: Number(compForm.sensitivity_coefficient),
        notes: compForm.notes || null,
      },
    });
    setCompForm({ name: "", component_type: "type_b", distribution: "normal", u_value: "", sensitivity_coefficient: "1", notes: "" });
  }

  if (isLoading) return <div className="text-slate-500 py-8 text-center">Loading budgets…</div>;

  return (
    <div className="flex gap-6">
      {/* Budget list */}
      <div className="w-72 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700">Budgets</h3>
          <button
            onClick={() => setShowBudgetForm(v => !v)}
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
          >
            + New
          </button>
        </div>

        {showBudgetForm && (
          <form onSubmit={handleCreateBudget} className="mb-4 p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
            <input
              placeholder="Method ID" required value={budgetForm.method_id}
              onChange={e => setBudgetForm(f => ({ ...f, method_id: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
            />
            <input
              placeholder="Budget name" required value={budgetForm.name}
              onChange={e => setBudgetForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <input
                placeholder="k (coverage)" value={budgetForm.coverage_factor} type="number" step="any"
                onChange={e => setBudgetForm(f => ({ ...f, coverage_factor: e.target.value }))}
                className="w-1/2 border border-slate-300 rounded px-2 py-1 text-sm"
              />
              <input
                placeholder="Confidence %" value={budgetForm.confidence_level} type="number" step="any"
                onChange={e => setBudgetForm(f => ({ ...f, confidence_level: e.target.value }))}
                className="w-1/2 border border-slate-300 rounded px-2 py-1 text-sm"
              />
            </div>
            <textarea
              placeholder="Description (optional)" value={budgetForm.description} rows={2}
              onChange={e => setBudgetForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white text-sm py-1 rounded hover:bg-indigo-700">
                Create
              </button>
              <button type="button" onClick={() => setShowBudgetForm(false)} className="flex-1 text-sm py-1 rounded border border-slate-300 hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1">
          {budgets.map(b => (
            <div
              key={b.id}
              onClick={() => setSelectedBudgetId(b.id)}
              className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedBudgetId === b.id ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className="font-medium text-sm text-slate-800">{b.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {b.method_code ?? `Method #${b.method_id}`} · k={b.coverage_factor} · {b.components.length} sources
              </div>
              {!b.is_active && <span className="text-xs text-slate-400">Inactive</span>}
            </div>
          ))}
          {budgets.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No budgets yet</p>
          )}
        </div>
      </div>

      {/* Budget detail */}
      <div className="flex-1">
        {!selectedBudget ? (
          <div className="text-slate-400 text-sm text-center py-16">Select a budget to manage its components</div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{selectedBudget.name}</h3>
                <p className="text-sm text-slate-500">
                  {selectedBudget.method_name ?? `Method #${selectedBudget.method_id}`}
                  &nbsp;· Coverage factor k = {selectedBudget.coverage_factor}
                  &nbsp;· {selectedBudget.confidence_level}% confidence
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this budget?")) deleteBudget.mutate(selectedBudget.id);
                  setSelectedBudgetId(null);
                }}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1"
              >
                Delete
              </button>
            </div>

            {/* Components table */}
            <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Source</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Distribution</th>
                    <th className="px-3 py-2 text-right">Raw u</th>
                    <th className="px-3 py-2 text-right">÷ divisor</th>
                    <th className="px-3 py-2 text-right">Std u(x_i)</th>
                    <th className="px-3 py-2 text-right">c_i</th>
                    <th className="px-3 py-2 text-right">c_i·u(x_i)</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedBudget.components.map(comp => {
                    const divisor = DIVISORS[comp.distribution ?? "normal"];
                    const stdU = comp.u_value != null ? comp.u_value / divisor : null;
                    const contrib = stdU != null ? (comp.sensitivity_coefficient ?? 1) * stdU : null;
                    return (
                      <tr key={comp.id} className="bg-white hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-700">{comp.name}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${comp.component_type === "type_a" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {comp.component_type === "type_a" ? "Type A" : "Type B"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600 capitalize">{comp.distribution ?? "normal"}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">{fmt(comp.u_value)}</td>
                        <td className="px-3 py-2 text-right text-slate-500">{divisor.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">{fmt(stdU)}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{comp.sensitivity_coefficient ?? 1}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-slate-800">{fmt(contrib)}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => deleteComponent.mutate(comp.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {selectedBudget.components.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-6 text-center text-slate-400 text-sm">
                        No uncertainty sources. Add one below.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* RSS preview */}
            {selectedBudget.components.length > 0 && (() => {
              let variance = 0;
              for (const c of selectedBudget.components) {
                if (c.component_type === "type_a" || c.u_value == null) continue;
                const d = DIVISORS[c.distribution ?? "normal"];
                const std = c.u_value / d;
                const contrib = (c.sensitivity_coefficient ?? 1) * std;
                variance += contrib * contrib;
              }
              const uc = Math.sqrt(variance);
              const U = (selectedBudget.coverage_factor ?? 2) * uc;
              return (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-indigo-600 mb-1">Combined u_c (Type B only)</div>
                    <div className="font-mono font-bold text-indigo-800">{uc.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 mb-1">k (coverage factor)</div>
                    <div className="font-mono font-bold text-indigo-800">{selectedBudget.coverage_factor}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 mb-1">Expanded U = k × u_c</div>
                    <div className="font-mono font-bold text-indigo-800">{U.toFixed(6)}</div>
                  </div>
                </div>
              );
            })()}

            {/* Add component form */}
            <form onSubmit={handleAddComponent} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Add Uncertainty Source</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Source name (e.g. Calibration certificate)" required value={compForm.name}
                  onChange={e => setCompForm(f => ({ ...f, name: e.target.value }))}
                  className="col-span-2 border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
                />
                <select
                  value={compForm.component_type}
                  onChange={e => setCompForm(f => ({ ...f, component_type: e.target.value as ComponentType }))}
                  className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
                >
                  <option value="type_b">Type B (systematic)</option>
                  <option value="type_a">Type A (placeholder)</option>
                </select>
                <select
                  value={compForm.distribution}
                  onChange={e => setCompForm(f => ({ ...f, distribution: e.target.value as Distribution }))}
                  disabled={compForm.component_type === "type_a"}
                  className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white disabled:opacity-50"
                >
                  {DISTRIBUTIONS.map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)} (÷{DIVISORS[d].toFixed(3)})</option>
                  ))}
                </select>
                <input
                  placeholder="Half-width / limit value (a)" type="number" step="any"
                  value={compForm.u_value}
                  onChange={e => setCompForm(f => ({ ...f, u_value: e.target.value }))}
                  disabled={compForm.component_type === "type_a"}
                  className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white disabled:opacity-50"
                />
                <input
                  placeholder="Sensitivity coefficient (c_i)" type="number" step="any"
                  value={compForm.sensitivity_coefficient}
                  onChange={e => setCompForm(f => ({ ...f, sensitivity_coefficient: e.target.value }))}
                  className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
                />
                <input
                  placeholder="Notes (optional)" value={compForm.notes}
                  onChange={e => setCompForm(f => ({ ...f, notes: e.target.value }))}
                  className="col-span-2 border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
                />
              </div>
              {compForm.u_value && compForm.component_type === "type_b" && (
                <div className="mt-2 text-xs text-slate-500">
                  Standard u(x_i) = {(Number(compForm.u_value) / DIVISORS[compForm.distribution]).toFixed(6)}
                  &nbsp;· Contribution = {((Number(compForm.sensitivity_coefficient) || 1) * Number(compForm.u_value) / DIVISORS[compForm.distribution]).toFixed(6)}
                </div>
              )}
              <button type="submit" className="mt-3 bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700">
                Add Source
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Entries Tab ───────────────────────────────────────────────────────────────

function EntriesTab() {
  const { data: entries = [], isLoading } = useMUEntries();
  const { data: budgets = [] } = useMUBudgets();
  const { data: rules = [] } = useMURules();
  const createEntry = useCreateMUEntry();
  const updateEntry = useUpdateMUEntry();
  const deleteEntry = useDeleteMUEntry();

  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    result_id: "",
    budget_id: "",
    type_a_n: "",
    type_a_mean: "",
    type_a_sd: "",
    extra_type_b_u: "",
    spec_lower: "",
    spec_upper: "",
    decision_rule_id: "",
  });

  const { data: breakdown } = useMUBreakdown(selectedEntryId);
  const selectedEntry = entries.find(e => e.id === selectedEntryId) ?? null;

  async function handleCreate(ev: React.FormEvent) {
    ev.preventDefault();
    const entry = await createEntry.mutateAsync({
      result_id: Number(form.result_id),
      budget_id: form.budget_id ? Number(form.budget_id) : null,
      type_a_n: form.type_a_n ? Number(form.type_a_n) : null,
      type_a_mean: form.type_a_mean ? Number(form.type_a_mean) : null,
      type_a_sd: form.type_a_sd ? Number(form.type_a_sd) : null,
      extra_type_b_u: form.extra_type_b_u ? Number(form.extra_type_b_u) : null,
      spec_lower: form.spec_lower ? Number(form.spec_lower) : null,
      spec_upper: form.spec_upper ? Number(form.spec_upper) : null,
      decision_rule_id: form.decision_rule_id ? Number(form.decision_rule_id) : null,
    });
    setShowForm(false);
    setSelectedEntryId(entry.id);
    setForm({ result_id: "", budget_id: "", type_a_n: "", type_a_mean: "", type_a_sd: "", extra_type_b_u: "", spec_lower: "", spec_upper: "", decision_rule_id: "" });
  }

  if (isLoading) return <div className="text-slate-500 py-8 text-center">Loading…</div>;

  return (
    <div className="flex gap-6">
      {/* Entry list */}
      <div className="w-72 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700">Result Entries</h3>
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
          >
            + New
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-4 p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-1">New Uncertainty Entry</div>
            <input
              placeholder="Result ID" required type="number" value={form.result_id}
              onChange={e => setForm(f => ({ ...f, result_id: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
            />
            <select
              value={form.budget_id}
              onChange={e => setForm(f => ({ ...f, budget_id: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
            >
              <option value="">No budget</option>
              {budgets.map(b => (
                <option key={b.id} value={b.id}>{b.name} (k={b.coverage_factor})</option>
              ))}
            </select>

            <div className="border-t border-slate-200 pt-2">
              <div className="text-xs text-slate-500 mb-1">Type A (repeat measurements)</div>
              <div className="grid grid-cols-3 gap-1">
                <input placeholder="n" type="number" value={form.type_a_n}
                  onChange={e => setForm(f => ({ ...f, type_a_n: e.target.value }))}
                  className="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
                <input placeholder="mean" type="number" step="any" value={form.type_a_mean}
                  onChange={e => setForm(f => ({ ...f, type_a_mean: e.target.value }))}
                  className="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
                <input placeholder="SD (s)" type="number" step="any" value={form.type_a_sd}
                  onChange={e => setForm(f => ({ ...f, type_a_sd: e.target.value }))}
                  className="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
              </div>
            </div>

            <input placeholder="Extra Type B u (optional)" type="number" step="any"
              value={form.extra_type_b_u}
              onChange={e => setForm(f => ({ ...f, extra_type_b_u: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
            />

            <div className="border-t border-slate-200 pt-2">
              <div className="text-xs text-slate-500 mb-1">Specification limits (for decision rule)</div>
              <div className="flex gap-1">
                <input placeholder="Lower" type="number" step="any" value={form.spec_lower}
                  onChange={e => setForm(f => ({ ...f, spec_lower: e.target.value }))}
                  className="w-1/2 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
                <input placeholder="Upper" type="number" step="any" value={form.spec_upper}
                  onChange={e => setForm(f => ({ ...f, spec_upper: e.target.value }))}
                  className="w-1/2 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
              </div>
              <select
                value={form.decision_rule_id}
                onChange={e => setForm(f => ({ ...f, decision_rule_id: e.target.value }))}
                className="w-full mt-1 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
              >
                <option value="">No decision rule</option>
                {rules.filter(r => r.is_active).map(r => (
                  <option key={r.id} value={r.id}>{r.name} (w={r.guard_band_factor}×U)</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 bg-indigo-600 text-white text-sm py-1 rounded hover:bg-indigo-700">
                Calculate & Save
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 text-sm py-1 rounded border border-slate-300 hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1">
          {entries.map(e => (
            <div
              key={e.id}
              onClick={() => setSelectedEntryId(e.id)}
              className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedEntryId === e.id ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className="font-medium text-sm text-slate-800">{e.test_name ?? `Result #${e.result_id}`}</div>
              <div className="text-xs text-slate-500 mt-0.5">{e.test_code}</div>
              <div className="text-xs text-slate-600 mt-1 font-mono">{e.reported_value ?? "—"}</div>
              {e.verdict && <div className="mt-1">{verdictBadge(e.verdict)}</div>}
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No entries yet</p>
          )}
        </div>
      </div>

      {/* Entry detail */}
      <div className="flex-1">
        {!selectedEntry ? (
          <div className="text-slate-400 text-sm text-center py-16">Select an entry to view the uncertainty breakdown</div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedEntry.test_name ?? `Result #${selectedEntry.result_id}`}
                </h3>
                <p className="text-sm text-slate-500">{selectedEntry.test_code}</p>
              </div>
              <div className="flex items-center gap-2">
                {verdictBadge(selectedEntry.verdict)}
                <button
                  onClick={() => {
                    if (confirm("Delete this entry?")) {
                      deleteEntry.mutate(selectedEntry.id);
                      setSelectedEntryId(null);
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Result value + reported value */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-xs text-slate-500 mb-1">Raw Result Value</div>
                <div className="font-mono text-xl font-bold text-slate-800">
                  {selectedEntry.result_value ?? "—"}
                  {selectedEntry.result_unit && <span className="text-sm font-normal text-slate-500 ml-1">{selectedEntry.result_unit}</span>}
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-xs text-indigo-600 mb-1">Reported Value (Result ± U)</div>
                <div className="font-mono text-xl font-bold text-indigo-800">
                  {selectedEntry.reported_value ?? "—"}
                </div>
              </div>
            </div>

            {/* Uncertainty summary */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Type A  u_A", value: fmt(selectedEntry.type_a_u, 6) },
                { label: "Combined  u_c", value: fmt(selectedEntry.combined_u, 6) },
                { label: `k = ${selectedEntry.coverage_factor}`, value: `(${selectedEntry.budget?.confidence_level ?? "—"}% conf.)` },
                { label: "Expanded  U", value: fmt(selectedEntry.expanded_u, 6) },
              ].map(row => (
                <div key={row.label} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">{row.label}</div>
                  <div className="font-mono font-bold text-slate-800">{row.value}</div>
                </div>
              ))}
            </div>

            {/* Type A detail */}
            {selectedEntry.type_a_n != null && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <span className="font-semibold text-blue-700">Type A: </span>
                <span className="text-blue-800">
                  n={selectedEntry.type_a_n}, mean={fmt(selectedEntry.type_a_mean, 4)},
                  s={fmt(selectedEntry.type_a_sd, 6)},
                  u_A = s/√n = {fmt(selectedEntry.type_a_u, 6)}
                </span>
              </div>
            )}

            {/* Component breakdown */}
            {breakdown && breakdown.components.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Type B Uncertainty Sources</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                      <tr>
                        <th className="px-3 py-2 text-left">Source</th>
                        <th className="px-3 py-2 text-left">Distribution</th>
                        <th className="px-3 py-2 text-right">Raw u / a</th>
                        <th className="px-3 py-2 text-right">Divisor</th>
                        <th className="px-3 py-2 text-right">Std u(x_i)</th>
                        <th className="px-3 py-2 text-right">c_i</th>
                        <th className="px-3 py-2 text-right">c_i·u(x_i)</th>
                        <th className="px-3 py-2 text-right">[c_i·u(x_i)]²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {breakdown.components.map(comp => (
                        <tr key={comp.component_id} className="bg-white">
                          <td className="px-3 py-2 font-medium text-slate-700">{comp.name}</td>
                          <td className="px-3 py-2 text-slate-600 capitalize">{comp.distribution}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(comp.raw_u, 6)}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{DIVISORS[comp.distribution].toFixed(4)}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(comp.standard_u, 6)}</td>
                          <td className="px-3 py-2 text-right">{comp.sensitivity_coefficient}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold">{fmt(comp.contribution_u, 6)}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-500">{fmt(comp.contribution_variance, 8)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Decision rule detail */}
            {selectedEntry.spec_lower != null || selectedEntry.spec_upper != null ? (
              <div className="p-4 border rounded-lg bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Conformity Decision</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">LSL</div>
                    <div className="font-mono">{selectedEntry.spec_lower != null ? fmt(selectedEntry.spec_lower, 4) : "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">USL</div>
                    <div className="font-mono">{selectedEntry.spec_upper != null ? fmt(selectedEntry.spec_upper, 4) : "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Rule</div>
                    <div>{selectedEntry.decision_rule?.name ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Guard band w</div>
                    <div className="font-mono">
                      {selectedEntry.decision_rule
                        ? `${selectedEntry.decision_rule.guard_band_factor}×U = ${fmt((selectedEntry.decision_rule.guard_band_factor ?? 0) * (selectedEntry.expanded_u ?? 0), 4)}`
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-3">{verdictBadge(selectedEntry.verdict)}</div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rules Tab ─────────────────────────────────────────────────────────────────

function RulesTab() {
  const { data: rules = [], isLoading } = useMURules();
  const createRule = useCreateMURule();
  const updateRule = useUpdateMURule();
  const deleteRule = useDeleteMURule();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ method_id: "", name: "", guard_band_factor: "1", description: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createRule.mutateAsync({
      method_id: Number(form.method_id),
      name: form.name,
      guard_band_factor: Number(form.guard_band_factor),
      description: form.description || null,
    });
    setShowForm(false);
    setForm({ method_id: "", name: "", guard_band_factor: "1", description: "" });
  }

  if (isLoading) return <div className="text-slate-500 py-8 text-center">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-700">Decision Rules</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Guard-band conformity decisions per ILAC G8. w = guard_band_factor × U.
            w=0 → binary rule. w=1 → full expanded uncertainty guard band.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
        >
          + New Rule
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50 grid grid-cols-2 gap-3">
          <input
            placeholder="Method ID" required type="number" value={form.method_id}
            onChange={e => setForm(f => ({ ...f, method_id: e.target.value }))}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
          />
          <input
            placeholder="Rule name" required value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
          />
          <div>
            <input
              placeholder="Guard band factor (w)" type="number" step="any" value={form.guard_band_factor}
              onChange={e => setForm(f => ({ ...f, guard_band_factor: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
            />
            <div className="text-xs text-slate-400 mt-1">
              0 = binary · 0.5 = half-U · 1 = conservative (full U guard band)
            </div>
          </div>
          <input
            placeholder="Description" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
          />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">Cancel</button>
          </div>
        </form>
      )}

      {/* ILAC G8 reference */}
      <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
        <div className="font-semibold text-amber-800 mb-2">ILAC G8 Decision Zone Logic</div>
        <div className="grid grid-cols-3 gap-3 text-xs text-amber-700">
          <div className="bg-green-100 text-green-800 rounded p-2">
            <div className="font-semibold">Conforming</div>
            LSL + w ≤ result ≤ USL − w
          </div>
          <div className="bg-yellow-100 text-yellow-800 rounded p-2">
            <div className="font-semibold">Undecided (guard band)</div>
            LSL ≤ result &lt; LSL + w<br />USL − w &lt; result ≤ USL
          </div>
          <div className="bg-red-100 text-red-800 rounded p-2">
            <div className="font-semibold">Non-conforming</div>
            result &lt; LSL or result &gt; USL
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Rule Name</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-right">Guard Band Factor (w)</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-center">Active</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map(rule => (
              <tr key={rule.id} className="bg-white hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-800">{rule.name}</td>
                <td className="px-4 py-2 text-slate-600">{rule.method_code ?? `#${rule.method_id}`}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`font-mono font-bold ${(rule.guard_band_factor ?? 0) === 0 ? "text-slate-500" : (rule.guard_band_factor ?? 0) >= 1 ? "text-green-700" : "text-yellow-700"}`}>
                    {rule.guard_band_factor}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    {(rule.guard_band_factor ?? 0) === 0 ? "(binary)" : rule.guard_band_factor === 1 ? "(conservative)" : ""}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500">{rule.description ?? "—"}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => updateRule.mutate({ id: rule.id, data: { is_active: !rule.is_active } })}
                    className={`w-10 h-5 rounded-full transition-colors ${rule.is_active ? "bg-green-400" : "bg-slate-200"}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${rule.is_active ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => {
                      if (confirm("Delete this rule?")) deleteRule.mutate(rule.id);
                    }}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No decision rules configured</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MeasurementUncertaintyPage() {
  const [tab, setTab] = useState<Tab>("budgets");

  const tabs: { id: Tab; label: string }[] = [
    { id: "budgets", label: "Uncertainty Budgets" },
    { id: "entries", label: "Result Uncertainty" },
    { id: "rules", label: "Decision Rules" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Measurement Uncertainty</h1>
        <p className="text-sm text-slate-500 mt-1">
          GUM-compliant uncertainty budgets · Type A & B components · Expanded uncertainty · ILAC G8 decision rules
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.id
                ? "bg-white border border-b-white border-slate-200 -mb-px text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {tab === "budgets" && <BudgetsTab />}
        {tab === "entries" && <EntriesTab />}
        {tab === "rules" && <RulesTab />}
      </div>
    </div>
  );
}
