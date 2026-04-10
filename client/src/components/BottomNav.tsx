import { Home, Plus, ReceiptText, User2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

const items = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/history", label: "الرحلات", icon: ReceiptText },
  { to: "/profile", label: "حسابي", icon: User2 }
];

export const BottomNav = () => (
  <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-white/10 bg-slate-950/90 px-4 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-3 backdrop-blur-xl">
    <div className="relative flex items-center justify-between">
      {items.slice(0, 2).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex min-w-[88px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition active:scale-[0.97]",
              isActive ? "text-brand-300" : "text-slate-400"
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}

      <NavLink
        to="/trips/new"
        className="absolute left-1/2 top-[-28px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-slate-950 shadow-glow transition active:scale-[0.97]"
      >
        <Plus className="h-7 w-7" />
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          cn(
            "mr-auto flex min-w-[88px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition active:scale-[0.97]",
            isActive ? "text-brand-300" : "text-slate-400"
          )
        }
      >
        <User2 className="h-5 w-5" />
        <span>حسابي</span>
      </NavLink>
    </div>
  </nav>
);
