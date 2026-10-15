"use client";
import { createContext, useContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";

type Theme = "light" | "dark";
type Ctx = { ready: boolean; theme: Theme; setTheme: (t: Theme) => void; toggle: () => void; isDark: boolean };

const ThemeContext = createContext<Ctx | null>(null);
const KEY = "temanta.theme.v1";

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved: Theme | null = null;
    try { saved = (localStorage.getItem(KEY) as Theme) ?? null; } catch {}
    const initial: Theme = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(initial);
    apply(initial);
    setReady(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    apply(t);
    try { localStorage.setItem(KEY, t); } catch {}
  }, []);

  const value = useMemo<Ctx>(() => ({
    ready, theme, setTheme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    isDark: theme === "dark",
  }), [ready, theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("useTheme harus dipakai di dalam ThemeProvider");
  return c;
};
