import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Define the AuditLog type locally or in a types file
export interface AuditLog {
  id: number;
  user: { name: string; role: string };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY';
  table_name: string;
  record_id: number;
  old_values: string | null; // JSON strings from backend
  new_values: string | null;
  change_reason: string | null;
  created_at: string;
}

export const useAuditLogs = (equipmentId: number) => {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-logs', equipmentId],
    queryFn: async () => {
      // Adjust URL to match your backend route
      const { data } = await axios.get(`/api/audit/equipment/${equipmentId}`);
      return data;
    },
    enabled: !!equipmentId,
  });
};