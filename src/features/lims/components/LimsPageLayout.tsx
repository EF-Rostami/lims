import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LimsPageLayoutProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function LimsPageLayout({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: LimsPageLayoutProps) {
  return (
    <div className="p-6 space-y-4 max-w-screen-xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            <Plus className="h-4 w-4 mr-1.5" />
            {actionLabel}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
