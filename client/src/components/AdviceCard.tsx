import { X } from "lucide-react";
import { adviceToneStyles } from "@/utils/adviceEngine";
import { cn } from "@/lib/cn";
import type { AdviceCard as AdviceCardType } from "@/types";

type AdviceCardProps = {
  advice: AdviceCardType;
  onDismiss: (id: string) => void;
};

export const AdviceCard = ({ advice, onDismiss }: AdviceCardProps) => (
  <article
    className={cn(
      "rounded-[1.5rem] border p-4 shadow-glow backdrop-blur transition",
      adviceToneStyles[advice.tone]
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-bold">{advice.title}</h3>
        <p className="mt-2 text-sm leading-7 opacity-90">{advice.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(advice.id)}
        className="rounded-full border border-current/20 p-2 transition active:scale-[0.97]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </article>
);
