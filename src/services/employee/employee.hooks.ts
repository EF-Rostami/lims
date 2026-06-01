/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "./employee.service";
import type { Schema } from "@/types/api-types";
import { toast } from "sonner";

type Employee = Schema["EmployeeResponse"];
type EmployeeUpdate = Schema["EmployeeUpdate"];

export const employeeQueryKeys = {
  all: ["employees"] as const,
  detail: (id: number) => ["employees", "detail", id] as const,
};

/**
 * Fetch All Employees (For the List/Table)
 */
export function useEmployees(enabled: boolean = true) {
  return useQuery<Employee[]>({
    queryKey: employeeQueryKeys.all,
    queryFn: employeeService.getEmployees,
    enabled: enabled,
  });
}


// Ensure this hook is ready to be called in your form
export function useEmployee(id: number | null) {
  return useQuery({
    queryKey: ["employees", "detail", id],
    queryFn: () => employeeService.getEmployee(id!),
    enabled: !!id, // Only run if we have an ID
    staleTime: 0,  // Force it to check for fresh data
  });
}


/**
 * Register Employee Mutation
 */
export function useRegisterEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeService.registerEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "readiness"] });
    },
  });
}

/**
 * Update Employee Mutation
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    // Explicitly type the arguments and the return
    mutationFn: async ({ id, data }: { id: number; data: EmployeeUpdate }) => {
      const result = await employeeService.updateEmployee(id, data);
      return result; // Ensure this returns the updated employee object
    },
    onSuccess: (updatedEmployee: any) => { // Use 'any' temporarily or your Schema type
      // 1. Use your existing constant for consistency
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      
      // 2. Update specific cache
      if (updatedEmployee?.id) {
        queryClient.setQueryData(
          employeeQueryKeys.detail(updatedEmployee.id), 
          updatedEmployee
        );
      }
      
      toast.success("Personnel record synchronized");
    },
  });
}