// src/app/layout.tsx
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LIMS Portal",
  description: "Laboratory Information Management System",
};

const plausibleScriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL;
const plausibleInitSnippet = `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        {plausibleScriptUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
            <script async src={plausibleScriptUrl} />
            <script dangerouslySetInnerHTML={{ __html: plausibleInitSnippet }} />
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