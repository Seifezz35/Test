import { MoonStar, SunMedium } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ThemeMode } from "@/types";

type ThemeToggleProps = {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
};

export const ThemeToggle = ({ value, onChange }: ThemeToggleProps) => (
  <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
    {[
      { id: "dark" as const, label: "داكن", icon: MoonStar },
      { id: "light" as const, label: "فاتح", icon: SunMedium }
    ].map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        type="button"
        onClick={() => onChange(id)}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition active:scale-[0.97]",
          value === id ? "bg-brand-500 text-slate-950" : "text-slate-300"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    ))}
  </div>
);
