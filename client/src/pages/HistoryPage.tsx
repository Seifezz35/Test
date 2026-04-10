import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageShell } from "@/components/PageShell";
import { TripCard } from "@/components/TripCard";
import { useTrips } from "@/hooks/useTrips";
import { useTripStore } from "@/store/tripStore";

const tagOptions = [
  { value: "", label: "كل الوسوم" },
  { value: "peak hour", label: "وقت الذروة" },
  { value: "airport run", label: "مشوار مطار" },
  { value: "long distance", label: "مسافة طويلة" }
];

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const filters = useTripStore((state) => state.filters);
  const setFilters = useTripStore((state) => state.setFilters);
  const resetFilters = useTripStore((state) => state.resetFilters);
  const { data, loading, removeTrip } = useTrips(page, 8);

  const hasTrips = Boolean(data?.items.length);
  const totalPages = data?.pagination.totalPages ?? 1;

  const title = useMemo(() => {
    if (filters.platform) return `رحلات ${filters.platform}`;
    return "سجل الرحلات";
  }, [filters.platform]);

  return (
    <PageShell>
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-300">راجع، رتّب، وابحث في كل رحلاتك السابقة.</p>
          </div>
          <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-300">
            <Filter className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <input
            type="date"
            className="field"
            value={filters.from}
            onChange={(event) => {
              setPage(1);
              setFilters({ from: event.target.value });
            }}
          />
          <input
            type="date"
            className="field"
            value={filters.to}
            onChange={(event) => {
              setPage(1);
              setFilters({ to: event.target.value });
            }}
          />
          <input
            type="date"
            className="field"
            value={filters.search}
            onChange={(event) => {
              setPage(1);
              setFilters({ search: event.target.value });
            }}
          />
          <select
            className="field"
            value={filters.platform}
            onChange={(event) => {
              setPage(1);
              setFilters({ platform: event.target.value });
            }}
          >
            <option value="">كل التطبيقات</option>
            <option value="Uber">Uber</option>
            <option value="Careem">Careem</option>
            <option value="InDrive">InDrive</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="field"
            value={filters.tag}
            onChange={(event) => {
              setPage(1);
              setFilters({ tag: event.target.value });
            }}
          >
            {tagOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="field"
            value={filters.profit}
            onChange={(event) => {
              setPage(1);
              setFilters({ profit: event.target.value as "" | "profit" | "loss" });
            }}
          >
            <option value="">ربح وخسارة</option>
            <option value="profit">رحلات مربحة</option>
            <option value="loss">رحلات خاسرة</option>
          </select>

          <select
            className="field"
            value={filters.sortBy}
            onChange={(event) => {
              setPage(1);
              setFilters({ sortBy: event.target.value as "date" | "profit" | "distance" | "duration" });
            }}
          >
            <option value="date">ترتيب بالتاريخ</option>
            <option value="profit">ترتيب بالربح</option>
            <option value="distance">ترتيب بالمسافة</option>
            <option value="duration">ترتيب بالمدة</option>
          </select>

          <select
            className="field"
            value={filters.sortOrder}
            onChange={(event) => {
              setPage(1);
              setFilters({ sortOrder: event.target.value as "asc" | "desc" });
            }}
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setPage(1);
              resetFilters();
            }}
            className="secondary-button col-span-2"
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            إعادة الضبط
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-slate-300">
            جارٍ تحميل الرحلات...
          </div>
        ) : hasTrips ? (
          data?.items.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => navigate(`/trips/${trip.id}`)}
              onDelete={async (tripId) => {
                if (!window.confirm("هل تريد حذف هذه الرحلة؟")) return;
                try {
                  await removeTrip(tripId);
                } catch {
                  window.alert("تعذر حذف الرحلة الآن.");
                }
              }}
            />
          ))
        ) : (
          <EmptyState
            title="لا توجد رحلات في هذه الفترة"
            message="جرّب تغيير الفلاتر أو نطاق التاريخ، أو أضف رحلة جديدة لتبدأ لوحة الأرباح في الامتلاء."
          />
        )}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="secondary-button px-3 py-2 disabled:opacity-50"
        >
          السابق
        </button>
        <span>
          صفحة {page} من {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages}
          className="secondary-button px-3 py-2 disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </PageShell>
  );
};
