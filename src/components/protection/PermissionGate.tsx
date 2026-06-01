import { useUserStore } from "@/store/useUserStore";
import { RoleType } from "@/types/api-types";

interface Props {
  children: React.ReactNode;
  roles?: RoleType[];
  permissions?: string[];
}

export function PermissionGate({ children, roles, permissions }: Props) {
  const { user } = useUserStore();

  if (!user) return null;

  const hasRole = roles ? roles.some(r => user.roles.includes(r)) : true;
  const hasPermission = permissions ? permissions.some(p => user.permissions.includes(p)) : true;

  // In this logic, if both are provided, we check if they meet either criteria
  // You can adjust this to "must have both" depending on your needs.
  if (roles || permissions) {
    const authorized = (roles ? hasRole : true) && (permissions ? hasPermission : true);
    if (!authorized) return null;
  }

  return <>{children}</>;
}