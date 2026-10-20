"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

export function LangSwitch() {
  const { lang } = useT();
  const setLang = usePrefs((s) => s.setLang);
  return (
    <div role="group" aria-label="Language" className="flex rounded-full border border-border bg-card p-0.5 text-sm">
      {(["kn", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn("rounded-full px-3 py-1 font-medium", lang === l ? "bg-primary text-primary-fg" : "text-muted")}
        >
          {l === "kn" ? "ಕನ್ನಡ" : "English"}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full border border-border bg-card p-2 text-foreground"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
