import { createContext, use, useEffect, useMemo, useState } from "react";
import { en } from "../locales/en";
import { es } from "../locales/es";

export type Locale = "en" | "es";
export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

const LOCALE_STORAGE_KEY = "dakinis-tabletop-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

interface TranslationTree {
  [key: string]: string | TranslationTree;
}

const dictionaries: Record<Locale, TranslationTree> = { en, es };

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "es" || stored === "en") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("es")) {
    return "es";
  }
  return "en";
}

function deepGet(dict: TranslationTree, key: string): string | undefined {
  const resolved = key.split(".").reduce<string | TranslationTree | undefined>((cursor, segment) => {
    if (!cursor || typeof cursor === "string") return undefined;
    return cursor[segment];
  }, dict);
  return typeof resolved === "string" ? resolved : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const t: TranslateFn = (key, vars) => {
      const active = deepGet(dictionaries[locale], key);
      const fallbackEn = deepGet(dictionaries.en, key);
      const fallbackEs = deepGet(dictionaries.es, key);
      return interpolate(active ?? fallbackEn ?? fallbackEs ?? key, vars);
    };
    return { locale, setLocale, t };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = use(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
