import { AnimatedNumber } from "./AnimatedNumber";
import { cn } from "@/lib/cn";

type KPICardProps = {
  label: string;
  value: number;
  suffix?: string;
  hint: string;
  delay?: number;
  highlight?: boolean;
  formatter?: (value: number) => string;
};

export const KPICard = ({
  label,
  value,
  suffix,
  hint,
  delay = 0,
  highlight = false,
  formatter
}: KPICardProps) => (
  <article
    className={cn(
      "animate-page-in rounded-[1.75rem] border p-4 shadow-glow backdrop-blur transition",
      highlight
        ? "border-brand-400/30 bg-gradient-to-br from-brand-500/20 via-brand-400/8 to-white/5"
        : "border-white/10 bg-white/5"
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <p className="text-sm text-slate-300">{label}</p>
    <p className="mt-3 text-2xl font-extrabold text-white">
      <AnimatedNumber value={value} formatter={formatter} />
      {suffix ? <span className="mr-1 text-base text-brand-300">{suffix}</span> : null}
    </p>
    <p className="mt-2 text-xs text-slate-400">{hint}</p>
  </article>
);
