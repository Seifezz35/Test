import { useState } from "react";
import { Clock3, Fuel, MapPinned, Trash2 } from "lucide-react";
import { formatArabicDate, formatCurrency, formatCompactNumber } from "@/utils/dateHelpers";
import { cn } from "@/lib/cn";
import type { Trip } from "@/types";

type TripCardProps = {
  trip: Trip;
  onDelete?: (id: string) => void;
  onClick?: () => void;
};

export const TripCard = ({ trip, onDelete, onClick }: TripCardProps) => {
  const [offset, setOffset] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);

  return (
    <div className="relative overflow-hidden rounded-[1.6rem]">
      <button
        type="button"
        onClick={() => onDelete?.(trip.id)}
        className="absolute inset-y-0 left-0 flex w-20 items-center justify-center rounded-[1.6rem] bg-rose-500/80 text-white"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      <article
        onClick={onClick}
        onTouchStart={(event) => setStartX(event.touches[0].clientX)}
        onTouchMove={(event) => {
          if (startX === null) return;
          const diff = event.touches[0].clientX - startX;
          setOffset(Math.max(-80, Math.min(0, diff)));
        }}
        onTouchEnd={() => {
          setOffset((current) => (current < -35 ? -80 : 0));
          setStartX(null);
        }}
        className={cn(
          "relative rounded-[1.6rem] border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur transition duration-200 active:scale-[0.99]"
        )}
        style={{ transform: `translateX(${offset}px)` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200">
                {trip.platform}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  trip.netProfit >= 0
                    ? "bg-emerald-500/15 text-emerald-200"
                    : "bg-rose-500/15 text-rose-200"
                )}
              >
                {formatCurrency(trip.netProfit)}
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold text-white">{formatArabicDate(trip.date)}</h3>
            <p className="mt-1 text-sm text-slate-300">
              {trip.startTime} - {trip.endTime}
            </p>
          </div>

          <div className="text-left">
            <p className="text-sm text-slate-400">الأجرة</p>
            <p className="text-lg font-bold text-white">{formatCurrency(trip.fareAmount + trip.tipAmount)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="rounded-2xl bg-slate-900/60 p-3">
            <MapPinned className="mb-2 h-4 w-4 text-brand-300" />
            <p>{formatCompactNumber(trip.distanceKm)} كم</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 p-3">
            <Clock3 className="mb-2 h-4 w-4 text-brand-300" />
            <p>{formatCompactNumber(trip.durationMinutes / 60)} ساعة</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 p-3">
            <Fuel className="mb-2 h-4 w-4 text-brand-300" />
            <p>{formatCurrency(trip.fuelCost)}</p>
          </div>
        </div>

        {trip.tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {trip.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
};
