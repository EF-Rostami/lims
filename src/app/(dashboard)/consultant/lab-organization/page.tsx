"use client";

import { useState, useMemo } from "react";
import {
  Trash2, PlusCircle, Loader2, Edit3, Check, X,
  Building2, Briefcase, ChevronRight, GitBranch, Users, User,
} from "lucide-react";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/features/lims/departments/departments.queries";
import {
  usePositions,
  usePositionHierarchy,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from "@/features/lims/positions/positions.queries";
import type { DepartmentRead, DepartmentCreate } from "@/features/lims/departments/departments.api";
import type { PositionRead, PositionCreate, PositionTree } from "@/features/lims/positions/positions.api";

// ── Types ─────────────────────────────────────────────────────────────────────

type DeptFormState = { name: string; code: string; parent_id: number | "" };
type PosFormState = {
  title: string;
  department_id: number | "";
  reports_to_position_id: number | "";
  headcount: number | "";
};

interface DeptTreeNode {
  dept: DepartmentRead;
  children: DeptTreeNode[];
  positions: PositionRead[];
}

interface PosMiniNode {
  pos: PositionRead;
  children: PosMiniNode[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDeptTree(
  departments: DepartmentRead[],
  positions: PositionRead[],
  parentId: number | null = null
): DeptTreeNode[] {
  return departments
    .filter((d) => (d.parent_id ?? null) === parentId)
    .map((d) => ({
      dept: d,
      children: buildDeptTree(departments, positions, d.id),
      positions: positions.filter((p) => p.department_id === d.id),
    }));
}

function buildPosTree(positions: PositionRead[]): PosMiniNode[] {
  const idSet = new Set(positions.map((p) => p.id));
  const map: Record<number, PosMiniNode> = {};
  for (const p of positions) map[p.id] = { pos: p, children: [] };
  const roots: PosMiniNode[] = [];
  for (const p of positions) {
    if (p.reports_to_position_id && idSet.has(p.reports_to_position_id)) {
      map[p.reports_to_position_id].children.push(map[p.id]);
    } else {
      roots.push(map[p.id]);
    }
  }
  return roots;
}

// ── Shared connector between siblings ─────────────────────────────────────────

const LINE = "#94a3b8";

function SiblingConnector({ index, total }: { index: number; total: number }) {
  if (total === 1) {
    return <div style={{ width: 2, height: 28, backgroundColor: LINE }} />;
  }
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const PAD = 16;

  return (
    <div
      style={{
        position: "relative",
        marginLeft: -PAD,
        marginRight: -PAD,
        width: `calc(100% + ${PAD * 2}px)`,
        height: 28,
      }}
    >
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 2, height: "100%", backgroundColor: LINE }} />
      <div style={{ position: "absolute", top: 0, left: isFirst ? "50%" : 0, right: isLast ? "50%" : 0, height: 2, backgroundColor: LINE }} />
    </div>
  );
}

// ── Mini position tree (inside a dept card) ────────────────────────────────────

function PosMini({ node, depth = 0 }: { node: PosMiniNode; depth?: number }) {
  const hc = node.pos.headcount;
  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1"
        style={{ paddingLeft: depth * 14 }}
      >
        {/* tree indent line */}
        {depth > 0 && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <div style={{ width: 1, height: 14, backgroundColor: "#cbd5e1" }} />
            <div style={{ width: 8, height: 1, backgroundColor: "#cbd5e1" }} />
          </div>
        )}
        {depth === 0 && (
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
        )}
        <span className="text-[11px] text-slate-700 font-semibold leading-snug flex-1 min-w-0 truncate">
          {node.pos.title}
        </span>
        {/* headcount badge */}
        {hc != null ? (
          <span className="ml-1 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
            <User size={8} />×{hc}
          </span>
        ) : (
          <span className="ml-1 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 flex-shrink-0">
            <Users size={8} />∞
          </span>
        )}
      </div>
      {node.children.map((child) => (
        <PosMini key={child.pos.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// ── Position hierarchy chart node ─────────────────────────────────────────────

const DEPTH_TOP = ["border-slate-700", "bg-slate-800", "text-white"];
const DEPTH_MID = ["border-blue-400", "bg-blue-600", "text-white"];
const DEPTH_LOW = ["border-slate-200", "bg-white", "text-slate-800"];

const PosNode: React.FC<{
  node: PositionTree;
  departments: DepartmentRead[];
  depth?: number;
}> = ({ node, departments, depth = 0 }) => {
  const dept = departments.find((d) => d.id === node.department_id);
  const children = node.subordinates ?? [];
  const isTop = depth === 0;
  const isMid = depth === 1;
  const [border, bg, text] = isTop ? DEPTH_TOP : isMid ? DEPTH_MID : DEPTH_LOW;
  const hc = node.headcount;

  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-xl shadow-md border-2 ${border} ${bg} ${text} w-48 overflow-hidden`}>
        {/* Title */}
        <div className="px-4 pt-3 pb-1 text-center">
          <p className="text-[12px] font-bold leading-snug">{node.title}</p>
        </div>

        {/* Meta badges */}
        <div className="px-3 pb-2.5 flex flex-wrap items-center justify-center gap-1.5">
          {dept && (
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isTop || isMid ? "bg-white/20 text-white/80" : "bg-blue-50 text-blue-600"}`}>
              {dept.name}
            </span>
          )}
          {/* headcount */}
          {hc != null ? (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${isTop || isMid ? "bg-white/20 text-white/80" : "bg-indigo-50 text-indigo-600"}`}>
              <User size={8} />×{hc}
            </span>
          ) : (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${isTop || isMid ? "bg-white/15 text-white/60" : "bg-slate-100 text-slate-400"}`}>
              <Users size={8} />∞
            </span>
          )}
          {children.length > 0 && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isTop || isMid ? "bg-white/15 text-white/70" : "bg-slate-100 text-slate-500"}`}>
              {children.length} report{children.length > 1 ? "s" : ""}
            </span>
          )}
          {!node.is_active && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500">
              Inactive
            </span>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <>
          <div style={{ width: 2, height: 28, backgroundColor: LINE }} />
          <div className="flex">
            {children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center px-4">
                <SiblingConnector index={i} total={children.length} />
                <PosNode node={child} departments={departments} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Department structure chart node ───────────────────────────────────────────

const DEPT_HEADER_BG = ["bg-indigo-700", "bg-blue-600", "bg-cyan-600", "bg-teal-600"];
const DEPT_BORDER   = ["border-indigo-500", "border-blue-400", "border-cyan-400", "border-teal-400"];

const DeptNode: React.FC<{ node: DeptTreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  const { dept, children, positions } = node;
  const d = Math.min(depth, 3);
  const headerBg = DEPT_HEADER_BG[d];
  const border   = DEPT_BORDER[d];
  const posTree  = useMemo(() => buildPosTree(positions), [positions]);

  return (
    <div className="flex flex-col items-center">
      <div className={`bg-white rounded-xl shadow-md border-2 ${border} min-w-[200px] max-w-[260px] overflow-hidden`}>
        {/* Colored header */}
        <div className={`${headerBg} text-white px-4 pt-3 pb-2.5`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest bg-white/25 px-2 py-0.5 rounded-full">
              {dept.code}
            </span>
            <div className="flex gap-1">
              {positions.length > 0 && (
                <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                  {positions.length} pos
                </span>
              )}
              {children.length > 0 && (
                <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                  {children.length} sub
                </span>
              )}
            </div>
          </div>
          <p className="text-[13px] font-bold leading-snug">{dept.name}</p>
        </div>

        {/* Position hierarchy tree */}
        {posTree.length > 0 && (
          <div className="px-3 pt-2 pb-2.5 space-y-0 bg-slate-50 border-t border-slate-100">
            {posTree.map((root) => (
              <PosMini key={root.pos.id} node={root} depth={0} />
            ))}
          </div>
        )}

        {/* Sub-dept footer hint */}
        {children.length > 0 && (
          <div className="px-3 py-1 bg-slate-100 border-t border-slate-200 text-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {children.length} Sub-department{children.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {children.length > 0 && (
        <>
          <div style={{ width: 2, height: 28, backgroundColor: LINE }} />
          <div className="flex">
            {children.map((child, i) => (
              <div key={child.dept.id} className="flex flex-col items-center px-4">
                <SiblingConnector index={i} total={children.length} />
                <DeptNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LabOrganizationPage() {
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: positions = [], isLoading: posLoading } = usePositions();
  const { data: posHierarchy, isLoading: hierarchyLoading } = usePositionHierarchy();

  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const createPos = useCreatePosition();
  const updatePos = useUpdatePosition();
  const deletePos = useDeletePosition();

  const [newDept, setNewDept] = useState<DeptFormState>({ name: "", code: "", parent_id: "" });
  const [newPos, setNewPos] = useState<PosFormState>({
    title: "",
    department_id: "",
    reports_to_position_id: "",
    headcount: "",
  });
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [editDeptData, setEditDeptData] = useState<DeptFormState>({ name: "", code: "", parent_id: "" });
  const [editingPosId, setEditingPosId] = useState<number | null>(null);
  const [editPosData, setEditPosData] = useState<PosFormState>({
    title: "",
    department_id: "",
    reports_to_position_id: "",
    headcount: "",
  });
  const [chartView, setChartView] = useState<"departments" | "positions">("departments");

  const deptTree = useMemo(
    () => buildDeptTree(departments, positions),
    [departments, positions]
  );

  const handleCreateDept = () => {
    if (!newDept.name || !newDept.code) return;
    createDept.mutate(
      {
        name: newDept.name,
        code: newDept.code,
        parent_id: newDept.parent_id === "" ? null : Number(newDept.parent_id),
      } as DepartmentCreate,
      { onSuccess: () => setNewDept({ name: "", code: "", parent_id: "" }) }
    );
  };

  const handleUpdateDept = (id: number) => {
    updateDept.mutate(
      {
        id,
        data: {
          name: editDeptData.name,
          code: editDeptData.code,
          parent_id: editDeptData.parent_id === "" ? null : Number(editDeptData.parent_id),
        },
      },
      { onSuccess: () => setEditingDeptId(null) }
    );
  };

  const handleCreatePos = () => {
    if (!newPos.title.trim() || !newPos.department_id) return;
    createPos.mutate(
      {
        title: newPos.title.trim(),
        department_id: Number(newPos.department_id),
        reports_to_position_id:
          newPos.reports_to_position_id === "" ? null : Number(newPos.reports_to_position_id),
        headcount: newPos.headcount === "" ? null : Number(newPos.headcount),
        is_active: true,
      } as PositionCreate,
      { onSuccess: () => setNewPos({ title: "", department_id: "", reports_to_position_id: "", headcount: "" }) }
    );
  };

  const handleUpdatePos = (id: number) => {
    updatePos.mutate(
      {
        id,
        data: {
          title: editPosData.title,
          department_id: Number(editPosData.department_id),
          reports_to_position_id:
            editPosData.reports_to_position_id === "" ? null : Number(editPosData.reports_to_position_id),
          headcount: editPosData.headcount === "" ? null : Number(editPosData.headcount),
        },
      },
      { onSuccess: () => setEditingPosId(null) }
    );
  };

  const showChart = departments.length > 0 || positions.length > 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <header className="border-b pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 0</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Organizational Structure</h1>
        <p className="text-gray-500 mt-1 italic">
          Define the laboratory&apos;s departments and hierarchical positions.
        </p>
      </header>

      {/* Management panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* ── DEPARTMENTS ── */}
        <section className="bg-white p-6 border rounded-xl shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Building2 size={20} className="text-blue-600" /> Departments
          </h2>

          <div className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Add New Department</p>
            <select
              className="border p-2 w-full rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={newDept.parent_id}
              onChange={(e) =>
                setNewDept({ ...newDept, parent_id: e.target.value === "" ? "" : Number(e.target.value) })
              }
            >
              <option value="">No Parent (Top Level)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                className="border p-2 w-24 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Code"
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
              />
              <input
                className="border p-2 flex-1 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Department Name"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              />
              <button
                onClick={handleCreateDept}
                disabled={createDept.isPending || !newDept.name || !newDept.code}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createDept.isPending ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {deptsLoading && <p className="text-center text-slate-400 py-4">Loading departments...</p>}
            {departments.map((d: DepartmentRead) => (
              <div key={d.id} className="p-3 bg-white border rounded-lg hover:shadow-md transition group">
                {editingDeptId === d.id ? (
                  <div className="flex flex-col gap-2">
                    <select
                      className="border p-1 rounded text-sm"
                      value={editDeptData.parent_id}
                      onChange={(e) =>
                        setEditDeptData({ ...editDeptData, parent_id: e.target.value === "" ? "" : Number(e.target.value) })
                      }
                    >
                      <option value="">No Parent</option>
                      {departments.filter((dept) => dept.id !== d.id).map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input className="border p-1 w-16 rounded text-sm" value={editDeptData.code}
                        onChange={(e) => setEditDeptData({ ...editDeptData, code: e.target.value })} />
                      <input className="border p-1 flex-1 rounded text-sm" value={editDeptData.name}
                        onChange={(e) => setEditDeptData({ ...editDeptData, name: e.target.value })} />
                      <button onClick={() => handleUpdateDept(d.id)} className="text-green-600"><Check size={20} /></button>
                      <button onClick={() => setEditingDeptId(null)} className="text-red-400"><X size={20} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded mr-3 uppercase">
                          {d.code}
                        </span>
                        <span className="text-gray-700 font-medium">{d.name}</span>
                      </div>
                      {d.parent_id && (
                        <p className="text-[9px] text-slate-400 mt-1 ml-12">
                          Sub-dept of: {departments.find((p) => p.id === d.parent_id)?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="hover:text-blue-600"
                        onClick={() => {
                          setEditingDeptId(d.id);
                          setEditDeptData({ name: d.name, code: d.code, parent_id: d.parent_id ?? "" });
                        }}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        className="hover:text-red-500"
                        onClick={() => window.confirm(`Delete ${d.name}?`) && deleteDept.mutate(d.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── POSITIONS ── */}
        <section className="bg-white p-6 border rounded-xl shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Briefcase size={20} className="text-blue-600" /> Positions
          </h2>

          <div className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Add New Position</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="border p-2 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={newPos.department_id}
                onChange={(e) => setNewPos({ ...newPos, department_id: Number(e.target.value) })}
              >
                <option value="">Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select
                className="border p-2 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={newPos.reports_to_position_id}
                onChange={(e) =>
                  setNewPos({ ...newPos, reports_to_position_id: e.target.value === "" ? "" : Number(e.target.value) })
                }
              >
                <option value="">Reports To (Optional)...</option>
                {positions.map((p) => {
                  const deptName = departments.find((d) => d.id === p.department_id)?.name || "Unassigned";
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title} ({deptName})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                className="border p-2 flex-1 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Position Title"
                value={newPos.title}
                onChange={(e) => setNewPos({ ...newPos, title: e.target.value })}
              />
              <div className="relative w-28 flex-shrink-0">
                <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  className="border p-2 pl-7 w-full rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="HC (opt)"
                  title="Headcount — how many people hold this position (leave blank for unlimited)"
                  value={newPos.headcount}
                  onChange={(e) =>
                    setNewPos({ ...newPos, headcount: e.target.value === "" ? "" : Number(e.target.value) })
                  }
                />
              </div>
              <button
                onClick={handleCreatePos}
                disabled={createPos.isPending || !newPos.department_id}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {createPos.isPending ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400">
              HC = Headcount — leave blank for unlimited occupants, or enter a number (e.g. 1 for a singleton role like &quot;Head of Lab&quot;).
            </p>
          </div>

          <div className="space-y-3">
            {posLoading && <p className="text-center text-slate-400 py-4">Loading positions...</p>}
            {positions.map((p: PositionRead) => (
              <div key={p.id} className="p-3 bg-white border rounded-lg hover:shadow-md transition group">
                {editingPosId === p.id ? (
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="border p-1 rounded text-xs"
                        value={editPosData.department_id}
                        onChange={(e) => setEditPosData({ ...editPosData, department_id: Number(e.target.value) })}
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <select
                        className="border p-1 rounded text-xs"
                        value={editPosData.reports_to_position_id}
                        onChange={(e) =>
                          setEditPosData({
                            ...editPosData,
                            reports_to_position_id: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      >
                        <option value="">No Supervisor</option>
                        {positions.filter((pos) => pos.id !== p.id).map((pos) => (
                          <option key={pos.id} value={pos.id}>{pos.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="border p-1 flex-1 rounded text-sm"
                        value={editPosData.title}
                        onChange={(e) => setEditPosData({ ...editPosData, title: e.target.value })}
                      />
                      <input
                        type="number"
                        min={1}
                        className="border p-1 w-16 rounded text-sm"
                        placeholder="HC"
                        title="Headcount"
                        value={editPosData.headcount}
                        onChange={(e) =>
                          setEditPosData({
                            ...editPosData,
                            headcount: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                      />
                      <button onClick={() => handleUpdatePos(p.id)} className="text-green-600"><Check size={20} /></button>
                      <button onClick={() => setEditingPosId(null)} className="text-red-400"><X size={20} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-semibold">{p.title}</span>
                        {p.headcount != null ? (
                          <span className="text-[9px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                            <User size={8} />×{p.headcount}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">
                            <Users size={8} />∞
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                          {departments.find((d) => d.id === p.department_id)?.name || "Unassigned"}
                        </span>
                        {p.reports_to_position_id && (
                          <div className="flex items-center text-[10px] text-slate-400 font-medium">
                            <ChevronRight size={10} />
                            <span className="ml-1">
                              Supervisor: {positions.find((s) => s.id === p.reports_to_position_id)?.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="hover:text-blue-600"
                        onClick={() => {
                          setEditingPosId(p.id);
                          setEditPosData({
                            title: p.title,
                            department_id: p.department_id,
                            reports_to_position_id: p.reports_to_position_id ?? "",
                            headcount: p.headcount ?? "",
                          });
                        }}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        className="hover:text-red-500"
                        onClick={() => window.confirm("Delete position?") && deletePos.mutate(p.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── ORG CHART PREVIEW ─────────────────────────────────────────────────── */}
      {showChart && (
        <section className="bg-white border rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          {/* Chart header */}
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-gray-800 text-sm">
              <GitBranch size={18} className="text-blue-600" />
              Organisation Chart
            </h2>
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setChartView("departments")}
                className={[
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  chartView === "departments"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                Dept Structure
              </button>
              <button
                onClick={() => setChartView("positions")}
                className={[
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  chartView === "positions"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                Reporting Lines
              </button>
            </div>
          </div>

          {/* Chart canvas */}
          <div
            className="p-12 overflow-auto min-h-[320px] flex items-start justify-center"
            style={{
              background: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundColor: "#f1f5f9",
            }}
          >
            {chartView === "departments" ? (
              deptTree.length > 0 ? (
                <div className="flex gap-8 min-w-max">
                  {deptTree.map((node) => (
                    <DeptNode key={node.dept.id} node={node} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-8">
                  <Building2 size={40} className="opacity-20" />
                  <p className="text-sm">Add departments to preview the structure.</p>
                </div>
              )
            ) : hierarchyLoading ? (
              <div className="flex items-center justify-center gap-2 text-slate-400 py-8">
                <Loader2 size={22} className="animate-spin text-blue-400" />
                <span className="text-sm">Building chart…</span>
              </div>
            ) : posHierarchy && posHierarchy.length > 0 ? (
              <div className="flex gap-8 min-w-max">
                {posHierarchy.map((root) => (
                  <PosNode key={root.id} node={root} departments={departments} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-8">
                <Users size={40} className="opacity-20" />
                <p className="text-sm">
                  Set &quot;Reports To&quot; on positions to see the reporting-line chart.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
