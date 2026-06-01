// @ts-nocheck — QMS module pending backend_v3 migration
// features/shared/action-items/components/ActionManager.tsx

import React from 'react';
import { ActionItemRead, ActionType, ActionStatus } from '@/types/api.d.ts'; 

interface ActionManagerProps {
  parentId: number;
  parentType: 'nc_id' | 'audit_id' | 'mr_id';
  actions: ActionItemRead[];
  onActionCreated: () => void;
}

export const ActionManager: React.FC<ActionManagerProps> = ({ 
  parentId, 
  parentType, 
  actions, 
  onActionCreated 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Actions & CAPA</h3>
        <button className="btn-primary">Add Action</button>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Type</th>
            <th>Description</th>
            <th>Responsible</th>
            <th>Target Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {actions.map(action => (
            <tr key={action.id}>
              <td>{action.action_type}</td>
              <td>{action.description}</td>
              <td>{action.responsible_person_id}</td>
              <td>{action.target_date}</td>
              <td>
                <span className={`badge-${action.status}`}>
                  {action.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};