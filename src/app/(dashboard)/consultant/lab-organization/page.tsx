/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { 
  Trash2, PlusCircle, Loader2, Edit3, Check, X, Building2, Briefcase, ChevronRight 
} from "lucide-react";

import { 
  useListDepartments, useCreateDepartment, useDeleteDepartment, useUpdateDepartment 
} from "@/services/department/department.hooks";
import { 
  useListPositions, useCreatePosition, useDeletePosition, useUpdatePosition 
} from "@/services/position/position.hooks";
import OrgChart from "@/components/consultant/OrgChart";

export default function LabOrganizationPage() {
  const { data: departments = [], isLoading: deptsLoading } = useListDepartments();
  const { data: positions = [], isLoading: posLoading } = useListPositions();

  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const createPos = useCreatePosition();
  const updatePos = useUpdatePosition();
  const deletePos = useDeletePosition();

  // --- Local State ---
  const [newDept, setNewDept] = useState({ name: "", code: "", parent_id: "" as number | "" });
  const [newPos, setNewPos] = useState({ 
    title: "", 
    department_id: "" as number | "", 
    reports_to_position_id: "" as number | "" 
  });

  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [editDeptData, setEditDeptData] = useState({ name: "", code: "", parent_id: "" as number | "" });

  const [editingPosId, setEditingPosId] = useState<number | null>(null);
  const [editPosData, setEditPosData] = useState({ 
    title: "", 
    department_id: 0, 
    reports_to_position_id: "" as number | "" 
  });

  // --- Handlers ---

    const handleCreateDept = () => {
    if (!newDept.name || !newDept.code) return;
    // Ensure parent_id is sent as number or null, not an empty string
    const payload = {
      ...newDept,
      parent_id: newDept.parent_id === "" ? null : Number(newDept.parent_id)
    };
    
    createDept.mutate(payload as any, { 
      onSuccess: () => setNewDept({ name: "", code: "", parent_id: "" }),
      onError: (err: any) => alert(err.response?.data?.detail || "Create Failed")
    });
  };

  const handleUpdateDept = (id: number) => {
    const payload = {
      ...editDeptData,
      parent_id: editDeptData.parent_id === "" ? null : Number(editDeptData.parent_id)
    };

    updateDept.mutate(
      { id, data: payload as any }, 
      { 
        onSuccess: () => setEditingDeptId(null),
        onError: (err: any) => alert(err.response?.data?.detail || "Update Failed")
      }
    );
  };



  const handleCreatePos = () => {
    // 1. Basic Validation
    if (!newPos.title.trim() || !newPos.department_id) {
      alert("Title and Department are required");
      return;
    }

    // 2. Prepare Payload with strict type casting
    const payload = {
      title: newPos.title.trim(),
      department_id: Number(newPos.department_id),
      // Convert "" to null, otherwise cast to Number
      reports_to_position_id: newPos.reports_to_position_id === "" 
        ? null 
        : Number(newPos.reports_to_position_id),
      is_active: true,
      job_definition: null // Or "" depending on your Pydantic model
    };

    console.log("🚀 Sending Payload:", payload);

    createPos.mutate(payload as any, { 
      onSuccess: () => {
        setNewPos({ title: "", department_id: "", reports_to_position_id: "" });
      },
      onError: (err: any) => {
        // This will capture specific FastAPI validation errors
        const errorData = err.response?.data?.detail;
        console.error("❌ Backend Rejected:", errorData);

        if (Array.isArray(errorData)) {
          // If it's a Pydantic validation list, show the first error
          alert(`Validation Error: ${errorData[0].loc[1]} - ${errorData[0].msg}`);
        } else {
          alert(errorData || "Check Position Fields: Duplicate entry or missing data.");
        }
      }
    });
  };

  const handleUpdatePos = (id: number) => {
    updatePos.mutate(
      { 
        id, 
        data: {
          ...editPosData,
          reports_to_position_id: editPosData.reports_to_position_id === "" ? null : Number(editPosData.reports_to_position_id)
        } as any 
      }, 
      { 
        onSuccess: () => setEditingPosId(null),
        onError: (err: any) => alert(err.response?.data?.detail || "Update Failed")
      }
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Step 0: Organizational Structure</h1>
        <p className="text-gray-500 mt-1 italic">Define the laboratory&apos;s departments and hierarchical positions.</p>
      </header>
        
        <OrgChart/>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* --- DEPARTMENTS SECTION --- */}
        <section className="bg-white p-6 border rounded-xl shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Building2 size={20} className="text-blue-600" /> 
            Departments
          </h2>
          
          <div className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Add New Department</p>
            
            <select 
              className="border p-2 w-full rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={newDept.parent_id}
              onChange={e => setNewDept({...newDept, parent_id: e.target.value === "" ? "" : Number(e.target.value)})}
            >
              <option value="">No Parent (Top Level)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input 
                className="border p-2 w-24 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Code" 
                value={newDept.code} 
                onChange={e => setNewDept({...newDept, code: e.target.value})} 
              />
              <input 
                className="border p-2 flex-1 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Department Name" 
                value={newDept.name} 
                onChange={e => setNewDept({...newDept, name: e.target.value})} 
              />
              <button 
                onClick={handleCreateDept} 
                disabled={createDept.isPending}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createDept.isPending ? <Loader2 className="animate-spin" size={20}/> : <PlusCircle size={20}/>}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {deptsLoading && <p className="text-center text-slate-400 py-4">Loading departments...</p>}
            {departments.map(d => (
              <div key={d.id} className="p-3 bg-white border rounded-lg hover:shadow-md transition group">
                {Number(editingDeptId) === Number(d.id) ? (
                  <div className="flex flex-col gap-2">
                    <select 
                      className="border p-1 rounded text-sm"
                      value={editDeptData.parent_id}
                      onChange={e => setEditDeptData({...editDeptData, parent_id: e.target.value === "" ? "" : Number(e.target.value)})}
                    >
                      <option value="">No Parent</option>
                      {departments.filter(dept => dept.id !== d.id).map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input className="border p-1 w-16 rounded text-sm" value={editDeptData.code} onChange={e => setEditDeptData({...editDeptData, code: e.target.value})} />
                      <input className="border p-1 flex-1 rounded text-sm" value={editDeptData.name} onChange={e => setEditDeptData({...editDeptData, name: e.target.value})} />
                      <button onClick={() => handleUpdateDept(d.id)} className="text-green-600"><Check size={20}/></button>
                      <button onClick={() => setEditingDeptId(null)} className="text-red-400"><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded mr-3 uppercase">{d.code}</span>
                        <span className="text-gray-700 font-medium">{d.name}</span>
                      </div>
                      {d.parent_id && (
                        <p className="text-[9px] text-slate-400 mt-1 ml-12">
                          Sub-dept of: {departments.find(parent => parent.id === d.parent_id)?.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="hover:text-blue-600" onClick={() => { 
                        setEditingDeptId(d.id); 
                        setEditDeptData({name: d.name, code: d.code, parent_id: d.parent_id ?? ""}); 
                      }}><Edit3 size={18}/></button>
                      <button className="hover:text-red-500" onClick={() => confirm(`Delete ${d.name}?`) && deleteDept.mutate(d.id)}><Trash2 size={18}/></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>


        {/* --- POSITIONS SECTION (UPDATED) --- */}
        <section className="bg-white p-6 border rounded-xl shadow-sm ring-1 ring-black/5">
          <h2 className="font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Briefcase size={20} className="text-blue-600" /> 
            Positions
          </h2>
          
          <div className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Add New Position</p>
            
            <div className="grid grid-cols-2 gap-2">
                <select 
                className="border p-2 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                value={newPos.department_id} 
                onChange={e => setNewPos({...newPos, department_id: Number(e.target.value)})}
                >
                <option value="">Department...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>

                <select 
                className="border p-2 rounded bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                value={newPos.reports_to_position_id} 
                onChange={e => setNewPos({...newPos, reports_to_position_id: e.target.value === "" ? "" : Number(e.target.value)})}
                >
                <option value="">Reports To (Optional)...</option>
                {positions.map(p => {
                    const deptName = departments.find(d => d.id === p.department_id)?.name || "Unassigned";
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
                onChange={e => setNewPos({...newPos, title: e.target.value})} 
              />
              <button 
                onClick={handleCreatePos} 
                disabled={createPos.isPending || !newPos.department_id}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
              >
                {createPos.isPending ? <Loader2 className="animate-spin" size={20}/> : <PlusCircle size={20}/>}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {posLoading && <p className="text-center text-slate-400 py-4">Loading positions...</p>}
            {positions.map(p => (
              <div key={p.id} className="p-3 bg-white border rounded-lg hover:shadow-md transition group">
                {Number(editingPosId) === Number(p.id) ? (
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="grid grid-cols-2 gap-2">
                        <select className="border p-1 rounded text-xs" value={editPosData.department_id} onChange={e => setEditPosData({...editPosData, department_id: Number(e.target.value)})}>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select className="border p-1 rounded text-xs" value={editPosData.reports_to_position_id} onChange={e => setEditPosData({...editPosData, reports_to_position_id: e.target.value === "" ? "" : Number(e.target.value)})}>
                            <option value="">No Supervisor</option>
                            {positions.filter(pos => pos.id !== p.id).map(pos => <option key={pos.id} value={pos.id}>{pos.title}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                      <input className="border p-1 flex-1 rounded text-sm" value={editPosData.title} onChange={e => setEditPosData({...editPosData, title: e.target.value})} />
                      <button onClick={() => handleUpdatePos(p.id)} className="text-green-600"><Check size={20}/></button>
                      <button onClick={() => setEditingPosId(null)} className="text-red-400"><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-semibold">{p.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                            {departments.find(d => d.id === p.department_id)?.name || 'Unassigned'}
                        </span>
                        {p.reports_to_position_id && (
                            <div className="flex items-center text-[10px] text-slate-400 font-medium">
                                <ChevronRight size={10} />
                                <span className="ml-1">Supervisor: {positions.find(sup => sup.id === p.reports_to_position_id)?.title}</span>
                            </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="hover:text-blue-600" onClick={() => { 
                        setEditingPosId(p.id); 
                        setEditPosData({
                            title: p.title, 
                            department_id: p.department_id, 
                            reports_to_position_id: p.reports_to_position_id ?? ""
                        }); 
                      }}><Edit3 size={18}/></button>
                      <button className="hover:text-red-500" onClick={() => confirm("Delete position?") && deletePos.mutate(p.id)}><Trash2 size={18}/></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}