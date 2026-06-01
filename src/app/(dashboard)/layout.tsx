// src/app/(lims)/layout.tsx
"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LimsAuthBootstrap } from "@/features/lims-auth/LimsAuthBootstrap";

export default function LimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LimsAuthBootstrap>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-y-auto">
            <Header />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
  </LimsAuthBootstrap>;
}