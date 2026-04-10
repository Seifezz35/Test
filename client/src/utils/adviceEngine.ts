import { AdviceCard } from "@/types";

export const adviceToneStyles: Record<AdviceCard["tone"], string> = {
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-100",
  warning: "border-orange-400/30 bg-orange-400/10 text-orange-50",
  info: "border-amber-400/30 bg-amber-400/10 text-amber-50",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-50",
  celebration: "border-yellow-300/40 bg-yellow-300/10 text-yellow-50"
};
