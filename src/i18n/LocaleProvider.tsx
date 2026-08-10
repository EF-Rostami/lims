"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Locale } from "./types";
import { SUPPORTED_LOCALES, DICTS, RTL_LOCALES } from "./dictionaries";

type Dict = Record<string, unknown>;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (ns: string, key: string, vars?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (_ns, key) => key,
});

function resolveDot(obj: unknown, key: string): string {
  const parts = key.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (typeof cur !== "object" || cur === null) return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : key;
}

function writeCookieLocale(locale: Locale) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `LIMS_LOCALE=${locale};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    writeCookieLocale(l);
  }

  function t(ns: string, key: string, vars?: Record<string, string>): string {
    const dict = DICTS[locale] as Dict;
    const namespace = dict?.[ns] as Dict | undefined;
    const raw = resolveDot(namespace, key);
    if (!vars || raw === key) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT(ns: string) {
  const { t } = useContext(LocaleContext);
  return (key: string, vars?: Record<string, string>) => t(ns, key, vars);
}
