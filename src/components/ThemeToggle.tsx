"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      id="theme-toggle-btn"
      className={`
        relative flex items-center w-14 h-7 rounded-full p-1 transition-all duration-500 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2
        ${isDark
          ? "bg-emerald-900/60 border border-emerald-500/30 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
          : "bg-amber-100 border border-amber-300/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
        }
      `}
    >
      {/* Track icons */}
      <span className={`absolute left-1.5 transition-all duration-300 ${isDark ? "opacity-100" : "opacity-0"}`}>
        <Moon className="w-3.5 h-3.5 text-emerald-300" />
      </span>
      <span className={`absolute right-1.5 transition-all duration-300 ${!isDark ? "opacity-100" : "opacity-0"}`}>
        <Sun className="w-3.5 h-3.5 text-amber-500" />
      </span>

      {/* Sliding knob */}
      <span
        className={`
          relative z-10 flex items-center justify-center w-5 h-5 rounded-full shadow-md
          transition-all duration-500 ease-in-out
          ${isDark
            ? "translate-x-7 bg-gradient-to-br from-emerald-400 to-orange-500"
            : "translate-x-0 bg-gradient-to-br from-amber-400 to-orange-400"
          }
        `}
      >
        {isDark
          ? <Moon className="w-3 h-3 text-white" />
          : <Sun className="w-3 h-3 text-white" />
        }
      </span>
    </button>
  );
}
