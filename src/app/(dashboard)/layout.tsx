import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LimsAuthBootstrap } from "@/features/lims-auth/LimsAuthBootstrap";
import { BrandingProvider } from "@/features/lims/branding/BrandingProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { isLocale } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/types";

export default async function LimsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("LIMS_LOCALE")?.value ?? "en";
  const initialLocale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  return (
    <LimsAuthBootstrap>
      <BrandingProvider>
        <LocaleProvider initialLocale={initialLocale}>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto">
              <Header />
              <main className="p-6">{children}</main>
            </div>
          </div>
        </LocaleProvider>
      </BrandingProvider>
    </LimsAuthBootstrap>
  );
}
