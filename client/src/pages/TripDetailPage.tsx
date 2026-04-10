import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PencilLine, Trash2 } from "lucide-react";
import { api } from "@/api/axiosInstance";
import { PageShell } from "@/components/PageShell";
import type { ApiResponse, Trip } from "@/types";
import { formatArabicDate, formatCompactNumber, formatCurrency } from "@/utils/dateHelpers";

const breakdownItemClass = "flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3";
const tagLabelMap: Record<string, string> = {
  "peak hour": "وقت الذروة",
  "airport run": "مشوار مطار",
  "long distance": "مسافة طويلة"
};

export const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    api.get<ApiResponse<Trip>>(`/trips/${id}`).then((response) => {
      setTrip(response.data.data);
      setLoading(false);
    });
  }, [id]);

  const deleteTrip = async () => {
    if (!id) return;
    if (!window.confirm("هل تريد حذف هذه الرحلة؟")) return;
    try {
      await api.delete(`/trips/${id}`);
      navigate("/history");
    } catch {
      window.alert("تعذر حذف الرحلة الآن.");
    }
  };

  if (loading || !trip) {
    return (
      <PageShell>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          جارٍ تحميل تفاصيل الرحلة...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200">
              {trip.platform}
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-white">{formatArabicDate(trip.date)}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {trip.startTime} - {trip.endTime}
            </p>
          </div>

          <div className={`rounded-full px-4 py-2 text-sm font-bold ${trip.netProfit >= 0 ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"}`}>
            {formatCurrency(trip.netProfit)}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => navigate(`/trips/${trip.id}/edit`)} className="secondary-button">
            <PencilLine className="ml-2 h-4 w-4" />
            تعديل
          </button>
          <button type="button" onClick={deleteTrip} className="rounded-2xl bg-rose-500/80 px-4 py-3 font-semibold text-white transition active:scale-[0.97]">
            <Trash2 className="ml-2 inline h-4 w-4" />
            حذف
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div className={breakdownItemClass}>
            <span className="text-slate-300">الأجرة + البقشيش</span>
            <span className="font-bold text-white">{formatCurrency(trip.fareAmount + trip.tipAmount)}</span>
          </div>
          <div className={breakdownItemClass}>
            <span className="text-slate-300">العمولة</span>
            <span className="font-bold text-white">{formatCurrency(trip.commissionAmount ?? 0)}</span>
          </div>
          <div className={breakdownItemClass}>
            <span className="text-slate-300">الوقود</span>
            <span className="font-bold text-white">{formatCurrency(trip.fuelCost)}</span>
          </div>
          <div className={breakdownItemClass}>
            <span className="text-slate-300">رسوم الطريق</span>
            <span className="font-bold text-white">{formatCurrency(trip.tollFees)}</span>
          </div>
          <div className={breakdownItemClass}>
            <span className="text-slate-300">رسوم الانتظار</span>
            <span className="font-bold text-white">{formatCurrency(trip.parkingFees)}</span>
          </div>
          <div className={breakdownItemClass}>
            <span className="text-slate-300">المسافة / الزمن</span>
            <span className="font-bold text-white">
              {formatCompactNumber(trip.distanceKm)} كم / {formatCompactNumber(trip.durationMinutes / 60)} ساعة
            </span>
          </div>
        </div>

        {trip.tags.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {trip.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
              >
                {tagLabelMap[tag] ?? tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </PageShell>
  );
};
