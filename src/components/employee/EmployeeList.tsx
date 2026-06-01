import { useEmployees } from "@/services/employee/employee.hooks"

export default function EmployeeList() {

  const { data, isLoading } = useEmployees()

  if (isLoading) return <p>Loading...</p>

  return (
    <div>
      {data?.map(emp => {
        const roles = emp.roles_list?.map(r => r.name).join(", ");
        const permissions = emp.permission_names?.join(", ");

        return (
          <div key={emp.id}>
            {emp.full_name} -{" "}
            {emp.primary_department_name || "No Dept"} -{" "}
            {roles || "No Roles"} -{" "}
            {permissions || "No Permissions"}
          </div>
        );
      })}
    </div>
  )
}