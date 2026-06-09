"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/features/lims/notifications/notifications.queries";

export function NotificationBell() {
  const router = useRouter();
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <button
      title="Notifications"
      onClick={() => router.push("/lims/notifications")}
      className="relative p-2 hover:bg-muted rounded-full"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
