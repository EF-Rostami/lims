/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Loader2, 
  CheckCircle, Fingerprint, Save,
  Briefcase, UserCircle,
  ChevronDown, RotateCcw, AlertTriangle,
  Zap, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useRolesMatrix } from '@/services/admin/admin.hooks';
import { useListPositions } from '@/services/position/position.hooks';
import { useEmployee, useRegisterEmployee, useUpdateEmployee } from '@/services/employee/employee.hooks';
import { useListDepartments } from '@/services/department/department.hooks';

interface Props {
  onComplete: () => void;
  employeeToEdit?: any | null; 
}

type FormDataType = {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  primary_position_id: number | null;
  secondary_position_ids: number[];
  primary_role_id: number | null;
  secondary_role_ids: number[];
  permission_ids: number[];
};

export default function EmployeeRegistrationForm({ onComplete, employeeToEdit }: Props) {
  const isEditMode = !!employeeToEdit;

  // --- API Hooks ---
  const { data: freshEmployee, isLoading: isFetchingDetail } = useEmployee(employeeToEdit?.id);
  const { data: positions = [] } = useListPositions();
  const { data: departments = [] } = useListDepartments(); // Added to resolve names
  const { data: rolesMatrix = [] } = useRolesMatrix();
  const registration = useRegisterEmployee();
  const updater = useUpdateEmployee();

  // --- Local State ---
  const [showResetConfirm, setShowResetConfirm] = useState<'roles' | 'perms' | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    email: '', username: '', password: '',
    first_name: '', last_name: '',
    primary_position_id: null, secondary_position_ids: [],
    primary_role_id: null, secondary_role_ids: [], permission_ids: [],
  });

  // --- Sync Logic ---
  useEffect(() => {
    const activeSource = freshEmployee || employeeToEdit;
    if (activeSource) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        email: activeSource.email || '',
        username: activeSource.username || '',
        password: '',
        first_name: activeSource.first_name || '',
        last_name: activeSource.last_name || '',
        // department_id: activeSource.department_id ? String(activeSource.department_id) : '',
        primary_position_id: activeSource.primary_position_id ?? null,
        secondary_position_ids: activeSource.secondary_position_ids || [],
        primary_role_id: activeSource.primary_role_id ?? null,
        secondary_role_ids: activeSource.secondary_role_ids || [],
        permission_ids: activeSource.permission_ids || [],
      });
    }
  }, [freshEmployee, employeeToEdit]);

  // --- Helper: Get Department Name from ID ---
  const getDeptName = (deptId: number) => {
    const dept = departments.find((d: any) => Number(d.id) === Number(deptId));
    return dept ? (dept.name || 'Unknown Dept') : 'Unknown Dept';
  };

  // --- Derived Data ---
  const uniqueAvailablePermissions = useMemo(() => {
    const allPerms = rolesMatrix.flatMap((r: any) => r.permissions || []);
    return Array.from(new Map(allPerms.map((p: any) => [p.id, p])).values());
  }, [rolesMatrix]);

  const inheritedPermissionIds = useMemo(() => {
    const primaryId = Number(formData.primary_role_id);
    const secondaryIds = formData.secondary_role_ids.map(Number);
    const relevantRoles = rolesMatrix.filter((r: any) => 
      Number(r.id) === primaryId || secondaryIds.includes(Number(r.id))
    );
    return new Set(relevantRoles.flatMap((r: any) => r.permissions?.map((p: any) => p.id) || []));
  }, [formData.primary_role_id, formData.secondary_role_ids, rolesMatrix]);

  // --- Handlers ---
  const handlePrimaryRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const selectedRole = rolesMatrix.find((r: any) => Number(r.id) === id);
    const rolePerms = selectedRole?.permissions.map((p: any) => p.id) || [];

    setFormData(prev => ({
      ...prev,
      primary_role_id: id,
      secondary_role_ids: prev.secondary_role_ids.filter(sid => Number(sid) !== id),
      permission_ids: Array.from(new Set([...prev.permission_ids, ...rolePerms]))
    }));
  };

  const toggleSecondaryRole = (role: any) => {
    if (Number(role.id) === Number(formData.primary_role_id)) return;
    const isSelected = formData.secondary_role_ids.includes(Number(role.id));
    
    setFormData(prev => {
      const newIds = isSelected 
        ? prev.secondary_role_ids.filter(id => Number(id) !== Number(role.id))
        : [...prev.secondary_role_ids, Number(role.id)];

      let newPerms = [...prev.permission_ids];
      if (!isSelected) {
        const rolePerms = role.permissions.map((p: any) => p.id);
        newPerms = Array.from(new Set([...newPerms, ...rolePerms]));
      }
      return { ...prev, secondary_role_ids: newIds, permission_ids: newPerms };
    });
  };

  const performReset = (type: 'roles' | 'perms') => {
    if (type === 'roles') {
      setFormData(prev => ({ ...prev, secondary_role_ids: [] }));
      toast.info("Secondary roles cleared");
    } else {
      setFormData(prev => ({ ...prev, permission_ids: Array.from(inheritedPermissionIds) }));
      toast.info("Permissions synchronized with roles");
    }
    setShowResetConfirm(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // 1. Validation Guards (ISO 17025 Requirement: Must have a primary role and position)
      if (!formData.primary_role_id) return toast.error("Primary Role is required.");
      if (!formData.primary_position_id) return toast.error("Primary Position is required.");

      // 2. Construct clean payload
      const payload = {
        ...formData,
        // The 'as number' tells TS we've already verified these aren't null above
        primary_position_id: formData.primary_position_id as number,
        primary_role_id: formData.primary_role_id as number,
      };

      // 3. Execution
      if (isEditMode) {
        updater.mutate({ id: employeeToEdit.id, data: payload }, {
          onSuccess: () => { toast.success("Record Updated"); onComplete(); }
        });
      } else {
        registration.mutate(payload, {
          onSuccess: () => { toast.success("Personnel Created"); onComplete(); }
        });
      }
    };

  if (isFetchingDetail) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Harmonizing Registry...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12 max-w-5xl mx-auto px-4">
      
      {/* IDENTITY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-slate-400">
            <Fingerprint size={14} className="text-blue-500" /> Authentication
          </div>
          <input disabled={isEditMode} className="input-style w-full" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input disabled={isEditMode} className="input-style w-full" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
        </div>
        <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-slate-400">
            <UserCircle size={14} className="text-indigo-500" /> Identity
          </div>
          <input className="input-style w-full" placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
          <input className="input-style w-full" placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
        </div>
      </div>

      {/* POSITION MAPPING */}
      <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200/60 space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Briefcase size={16} className="text-emerald-500" /> Position Mapping
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Primary Assignment</label>
            <select className="input-style w-full bg-white shadow-sm font-semibold" value={formData.primary_position_id || ""} onChange={e => setFormData({...formData, primary_position_id: Number(e.target.value)})}>
              <option value="">Select Primary Position...</option>
              {positions.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.title} - {getDeptName(p.department_id)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Secondary Assignments</label>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-2 custom-scrollbar bg-white/50 p-2 rounded-xl border border-dashed border-slate-200">
              {positions.filter(p => Number(p.id) !== Number(formData.primary_position_id)).map((p: any) => {
                const isSel = formData.secondary_position_ids.includes(Number(p.id));
                return (
                  <button key={p.id} type="button" onClick={() => setFormData({...formData, secondary_position_ids: isSel ? formData.secondary_position_ids.filter(i => Number(i) !== Number(p.id)) : [...formData.secondary_position_ids, Number(p.id)]})}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-[11px] font-bold transition-all ${isSel ? 'bg-white border-blue-400 shadow-sm text-blue-600' : 'bg-transparent border-transparent text-slate-400 hover:bg-white hover:border-slate-200'}`}>
                    <span>{p.title} - {getDeptName(p.department_id)}</span>
                    {isSel && <CheckCircle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ACCESS CONTROL */}
      <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="space-y-3 max-w-md">
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Primary System Role</label>
          <div className="relative">
            <select className="input-style w-full appearance-none bg-slate-50 pr-10 font-bold border-slate-200" value={formData.primary_role_id || ""} onChange={handlePrimaryRoleChange}>
              <option value="" disabled>Choose core role...</option>
              {rolesMatrix.map((r: any) => <option key={r.id} value={r.id}>{typeof r.name === 'string' ? r.name : r.name?.value}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Secondary Roles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secondary Roles</label>
              {showResetConfirm === 'roles' ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2">
                   <span className="text-[9px] font-black text-orange-600 flex items-center gap-1"><AlertTriangle size={10}/> CLEAR ALL?</span>
                   <button type="button" onClick={() => performReset('roles')} className="text-[9px] font-black text-emerald-600 hover:underline">YES</button>
                   <button type="button" onClick={() => setShowResetConfirm(null)} className="text-[9px] font-black text-slate-400">NO</button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowResetConfirm('roles')} className="text-[9px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <RotateCcw size={10} /> Reset Roles
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {rolesMatrix.filter(r => Number(r.id) !== Number(formData.primary_role_id)).map((role: any) => {
                const isSel = formData.secondary_role_ids.includes(Number(role.id));
                return (
                  <button key={role.id} type="button" onClick={() => toggleSecondaryRole(role)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-[11px] font-black transition-all ${isSel ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}>
                    {typeof role.name === 'string' ? role.name : role.name?.value}
                    <CheckCircle size={14} className={isSel ? 'opacity-100' : 'opacity-0'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective Permissions</label>
              {showResetConfirm === 'perms' ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2">
                   <span className="text-[9px] font-black text-orange-600 flex items-center gap-1"><AlertTriangle size={10}/> SYNC TO ROLES?</span>
                   <button type="button" onClick={() => performReset('perms')} className="text-[9px] font-black text-emerald-600 hover:underline">YES</button>
                   <button type="button" onClick={() => setShowResetConfirm(null)} className="text-[9px] font-black text-slate-400">NO</button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowResetConfirm('perms')} className="text-[9px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <RotateCcw size={10} /> Reset to Roles
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {uniqueAvailablePermissions.map((perm: any) => {
                const isAct = formData.permission_ids.includes(Number(perm.id));
                const isInherited = inheritedPermissionIds.has(Number(perm.id));
                const isManualOverride = (isAct && !isInherited) || (!isAct && isInherited);
                return (
                  <div key={perm.id} 
                    onClick={() => setFormData(prev => ({...prev, permission_ids: isAct ? prev.permission_ids.filter(p => Number(p) !== Number(perm.id)) : [...prev.permission_ids, Number(perm.id)]}))}
                    className={`flex items-center justify-between p-3 px-4 rounded-lg border cursor-pointer transition-all ${isAct ? 'bg-emerald-50 border-emerald-100 text-emerald-800 font-bold' : 'bg-slate-50/50 border-slate-50 text-slate-300 italic'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">{perm.name}</span>
                      {isManualOverride && <span className="flex items-center gap-0.5 text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-black animate-pulse"><Zap size={8} /> MANUAL</span>}
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isAct ? 'bg-emerald-500 border-emerald-500 shadow-sm' : 'border-slate-200 bg-white'}`}>
                      {isAct && <CheckCircle size={12} className="text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-400 italic flex items-center gap-1"><Info size={10} /> Manual overrides are cleared upon reset.</p>
          </div>
        </div>
      </div>

      <button type="submit" disabled={registration.isPending || updater.isPending || !formData.primary_role_id}
        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all disabled:bg-slate-200 disabled:text-slate-400">
        {(registration.isPending || updater.isPending) ? <Loader2 className="animate-spin mx-auto" /> : <div className="flex items-center justify-center gap-2"><Save size={16}/> {isEditMode ? "COMMIT REGISTRY UPDATES" : "INITIALIZE PERSONNEL PROFILE"}</div>}
      </button>

    </form>
  );
}