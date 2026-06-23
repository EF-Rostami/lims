// src/app/layout.tsx
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import Script from "next/script";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LIMS Portal",
  description: "Laboratory Information Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const plausibleScriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL;

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        {plausibleScriptUrl && (
          <>
            <Script src={plausibleScriptUrl} strategy="afterInteractive" />
            <Script id="plausible-init" strategy="afterInteractive">{`
              window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
              plausible.init()
            `}</Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}