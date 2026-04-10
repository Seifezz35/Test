import { useMemo, useState } from "react";
import { CalendarDays, Flame, Target } from "lucide-react";
import { AdviceCard } from "@/components/AdviceCard";
import { EmptyState } from "@/components/EmptyState";
import { KPICard } from "@/components/KPICard";
import { PageShell } from "@/components/PageShell";
import { BestDayChart } from "@/components/charts/BestDayChart";
import { DonutExpenseChart } from "@/components/charts/DonutExpenseChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { PlatformSplitChart } from "@/components/charts/PlatformSplitChart";
import { ProfitBreakdownChart } from "@/components/charts/ProfitBreakdownChart";
import { useAdvice } from "@/hooks/useAdvice";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useAuthStore } from "@/store/authStore";
import { useTripStore } from "@/store/tripStore";
import {
  formatArabicDate,
  formatCompactNumber,
  formatCurrency,
  formatMonthLabel,
  formatShortDay
} from "@/utils/dateHelpers";

type View = "daily" | "monthly" | "cumulative";

export const DashboardPage = () => {
  const [view, setView] = useState<View>("daily");
  const user = useAuthStore((state) => state.user);
  const { data, loading, refetch } = useAnalytics(view);
  const { data: advice, refetch: refetchAdvice } = useAdvice();
  const dismissedAdviceIds = useTripStore((state) => state.dismissedAdviceIds);
  const dismissAdvice = useTripStore((state) => state.dismissAdvice);

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchAdvice()]);
  };

  const { pullDistance, refreshing } = usePullToRefresh(refreshAll);
  const summary = data?.summary;
  const adviceCards = advice?.cards.filter((card) => !dismissedAdviceIds.includes(card.id)) ?? [];
  const hasTrips = Boolean(summary?.totalTrips);

  const viewTitle = useMemo(() => {
    if (view === "daily") return "اليوم";
    if (view === "monthly") return data && "month" in data ? formatMonthLabel(data.month) : "هذا الشهر";
    return "كل الوقت";
  }, [data, view]);

  return (
    <PageShell>
      <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/5 bg-slate-950/80 px-4 pb-4 pt-3 backdrop-blur-xl">
        <div
          className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-brand-400/70 transition-all"
          style={{ transform: `scaleX(${Math.max(0.2, pullDistance / 100)})` }}
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">أهلاً كابتن {user?.name ?? "السائق"}</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white">{viewTitle}</h1>
            <p className="mt-2 text-sm text-slate-300">{formatArabicDate(new Date())}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {refreshing ? "جارٍ التحديث..." : "اسحب لأسفل للتحديث"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-[1.75rem] border border-white/10 bg-white/5 p-1">
        {[
          { id: "daily" as const, label: "يومي" },
          { id: "monthly" as const, label: "شهري" },
          { id: "cumulative" as const, label: "تراكمي" }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`rounded-[1.25rem] px-4 py-3 text-sm font-bold transition active:scale-[0.97] ${
              view === item.id ? "bg-brand-500 text-slate-950" : "text-slate-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading || !summary ? (
        <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          جارٍ تحميل لوحة الأرباح...
        </div>
      ) : (
        <>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            <div className="min-w-[170px] flex-1">
              <KPICard
                label="صافي الربح"
                value={summary.netProfit}
                hint="أهم مؤشر في يومك"
                highlight
                delay={0}
                formatter={(value) => formatCurrency(value, user?.profile?.currency ?? "EGP")}
              />
            </div>
            <div className="min-w-[170px] flex-1">
              <KPICard label="إجمالي الرحلات" value={summary.totalTrips} hint="عدد الرحلات المكتملة" delay={80} />
            </div>
            <div className="min-w-[170px] flex-1">
              <KPICard label="إجمالي الساعات" value={summary.workingHours} hint="ساعات العمل الفعلية" delay={160} />
            </div>
            <div className="min-w-[170px] flex-1">
              <KPICard
                label="متوسط الربح/رحلة"
                value={summary.avgProfitPerTrip}
                hint="هل كل رحلة مربحة؟"
                delay={240}
                formatter={(value) => formatCurrency(value, user?.profile?.currency ?? "EGP")}
              />
            </div>
          </div>

          {view === "cumulative" && data && "streak" in data ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[1.75rem] border border-brand-400/20 bg-brand-500/10 p-4">
                <div className="flex items-center gap-2 text-brand-200">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-semibold">سلسلة نشاط</span>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-white">{data.streak} يوم متتالي</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Target className="h-4 w-4 text-brand-300" />
                  <span className="text-sm font-semibold">هدفك الشهري</span>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-white">
                  {formatCurrency(data.monthlyGoal, user?.profile?.currency ?? "EGP")}
                </p>
              </div>
            </div>
          ) : null}

          {view === "monthly" && data && "goalProgress" in data ? (
            <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-200">
                  <Target className="h-4 w-4 text-brand-300" />
                  <span className="font-semibold">تقدم الهدف الشهري</span>
                </div>
                <span className="text-sm text-brand-300">{formatCompactNumber(data.goalProgress.percent)}%</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
                  style={{ width: `${data.goalProgress.percent}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                {formatCurrency(data.goalProgress.current, user?.profile?.currency ?? "EGP")} من أصل{" "}
                {formatCurrency(data.goalProgress.target, user?.profile?.currency ?? "EGP")}
              </p>
            </div>
          ) : null}

          {!hasTrips ? (
            <div className="mt-5">
              <EmptyState
                title="ابدأ بتسجيل أول رحلة"
                message="ابدأ بتسجيل أول رحلة وشوف أرباحك تتراكم. بمجرد إضافة رحلة ستظهر المؤشرات والرسوم والنصائح الذكية هنا."
              />
            </div>
          ) : (
            <>
              {adviceCards.length ? (
                <div className="mt-5 space-y-3">
                  {adviceCards.map((card) => (
                    <AdviceCard key={card.id} advice={card} onDismiss={dismissAdvice} />
                  ))}
                </div>
              ) : null}

              <div className="mt-5 grid gap-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CalendarDays className="h-4 w-4 text-brand-300" />
                    <span className="font-semibold">ملخص سريع</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {view === "daily" && "هذا ملخص أدائك اليومي مع توزيع المصروفات وأفضل أيام الأسبوع."}
                    {view === "monthly" && "هذا ملخص شهرك الحالي مع تفصيل الأيام الأكثر ربحًا ومعدل التقدم نحو الهدف."}
                    {view === "cumulative" && "هذه نظرة شاملة على كل تاريخك، الترند الشهري، وسلسلة النشاط الحالية."}
                  </p>
                </div>

                <DonutExpenseChart
                  data={[
                    { name: "الدخل", value: summary.grossIncome },
                    { name: "المصاريف", value: summary.totalExpenses }
                  ]}
                />
                <PlatformSplitChart data={data.platformSplit} />

                {view === "daily" ? <BestDayChart data={data.dayOfWeekPerformance} /> : null}

                {view === "monthly" && "dailyBreakdown" in data ? (
                  <>
                    {data.bestDay ? (
                      <div className="rounded-[1.75rem] border border-brand-400/20 bg-brand-500/10 p-4">
                        <p className="text-sm text-brand-200">أفضل يوم في الشهر</p>
                        <p className="mt-2 text-lg font-bold text-white">{formatArabicDate(data.bestDay.date)}</p>
                        <p className="mt-2 text-sm text-slate-300">
                          حققت فيه {formatCurrency(data.bestDay.netProfit, user?.profile?.currency ?? "EGP")} من{" "}
                          {data.bestDay.trips} رحلة
                        </p>
                      </div>
                    ) : null}
                    <ProfitBreakdownChart
                      title="تفصيل الأيام داخل الشهر"
                      subtitle="صافي الربح لكل يوم"
                      data={data.dailyBreakdown.map((item) => ({
                        label: formatShortDay(item.date),
                        value: item.netProfit
                      }))}
                    />
                  </>
                ) : null}

                {view === "cumulative" && "monthlyTrend" in data ? (
                  <>
                    <MonthlyTrendChart data={data.monthlyTrend} />
                    <BestDayChart data={data.dayOfWeekPerformance} />
                    {data.latestFuelEntries.length ? (
                      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                        <h3 className="text-sm font-semibold text-white">آخر تعبئات الوقود</h3>
                        <div className="mt-4 space-y-3">
                          {data.latestFuelEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-semibold text-white">{formatArabicDate(entry.date)}</p>
                                <p className="text-xs text-slate-400">{formatCompactNumber(entry.liters)} لتر</p>
                              </div>
                              <p className="text-sm font-bold text-brand-300">
                                {formatCurrency(entry.totalCost, user?.profile?.currency ?? "EGP")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </>
          )}
        </>
      )}
    </PageShell>
  );
};
