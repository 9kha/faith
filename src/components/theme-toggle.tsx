"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`grid size-9 place-items-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground ${className}`}
      >
        <Sun size={17} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`grid size-9 place-items-center rounded-xl border border-border/80 bg-background/80 text-foreground transition-all hover:bg-muted hover:text-primary ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon size={17} className="text-slate-700 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
