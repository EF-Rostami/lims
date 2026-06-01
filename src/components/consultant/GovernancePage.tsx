/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { 
  Users, ShieldCheck, FileText, UserPlus, 
  CheckCircle2, AlertCircle, Trash2, Settings2 
} from "lucide-react";

// Mocking some of your existing hooks for this UI concept
// import { useEmployees, useUpdateEmployeeRole } from "@/services/employee.hooks";
// import { useDocumentTypes, useUpdateDocType } from "@/services/document.hooks";

export default function GovernanceDashboard() {
  const [activeTab, setActiveTab] = useState<"committee" | "rules">("committee");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Governance</h1>
          <p className="text-slate-500">Define the Steering Committee and document approval authorities.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("committee")}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "committee" ? "bg-blue-600 text-white shadow-md" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
          >
            Steering Committee
          </button>
          <button 
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "rules" ? "bg-blue-600 text-white shadow-md" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
          >
            Approval Rules
          </button>
        </div>
      </header>

      {activeTab === "committee" ? (
        <CommitteeSection />
      ) : (
        <DocumentRulesSection />
      )}
    </div>
  );
}

function CommitteeSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- ADD STAKEHOLDER FORM --- */}
      <section className="lg:col-span-1 bg-white p-6 border rounded-xl shadow-sm h-fit">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-blue-600" /> Add Stakeholder
        </h2>
        <div className="space-y-4">
          <input className="w-full border p-2 rounded text-sm" placeholder="First Name" />
          <input className="w-full border p-2 rounded text-sm" placeholder="Last Name" />
          <input className="w-full border p-2 rounded text-sm" placeholder="Email (User Login)" />
          <select className="w-full border p-2 rounded text-sm bg-slate-50">
            <option>Select Primary Position...</option>
            {/* Map through your Positions here */}
          </select>
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <input type="checkbox" id="steerco" className="w-4 h-4" />
            <label htmlFor="steerco" className="text-sm font-medium text-blue-800">Assign to Steering Committee</label>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            Register Stakeholder
          </button>
        </div>
      </section>

      {/* --- COMMITTEE LIST --- */}
      <section className="lg:col-span-2 space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-slate-800">
          <ShieldCheck size={20} className="text-green-600" /> Current Steering Committee
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* This would be a .map() of employees with RoleType.STEERING_COMMITTEE */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border p-4 rounded-xl flex justify-between items-start group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                  JD
                </div>
                <div>
                  <p className="font-bold text-slate-900">John Doe</p>
                  <p className="text-xs text-slate-500 font-medium">Lab Director / Sponsor</p>
                </div>
              </div>
              <button className="text-slate-300 group-hover:text-red-500 transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DocumentRulesSection() {
  return (
    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <Settings2 size={18} className="text-blue-600" /> Macro-Level Approval Rules
          </h2>
          <p className="text-xs text-slate-500">Define which system roles are required for Verification and Approval by Document Type.</p>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600 font-bold">
          <tr>
            <th className="p-4">Document Type</th>
            <th className="p-4">Prefix</th>
            <th className="p-4">Verification Authority</th>
            <th className="p-4">Approval Authority</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {/* This maps your DocumentType model */}
          <tr>
            <td className="p-4 font-bold text-blue-700">Standard Operating Procedure</td>
            <td className="p-4 font-mono text-xs text-slate-500">SOP</td>
            <td className="p-4">
              <select className="border rounded p-1 text-xs">
                <option>QUALITY_MANAGER</option>
                <option>TECHNICAL_MANAGER</option>
              </select>
            </td>
            <td className="p-4">
              <select className="border rounded p-1 text-xs">
                <option>TECHNICAL_MANAGER</option>
                <option>HEAD_OF_LABORATORY</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}