import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { api } from "@/api/axiosInstance";
import { PageShell } from "@/components/PageShell";
import { useAuthStore } from "@/store/authStore";
import { useTripStore } from "@/store/tripStore";
import type { ApiResponse, Trip, TripTag } from "@/types";
import { formatCurrency, getTodayIso } from "@/utils/dateHelpers";
import { calculateNetProfit, roundValue } from "@/utils/profitCalc";

const tripSchema = z.object({
  date: z.string().min(1, "التاريخ مطلوب"),
  startTime: z.string().min(1, "وقت البداية مطلوب"),
  endTime: z.string().min(1, "وقت النهاية مطلوب"),
  distanceKm: z.coerce.number().min(0, "المسافة غير صحيحة"),
  fareAmount: z.coerce.number().min(0, "الأجرة غير صحيحة"),
  commission: z.coerce.number().min(0).max(100),
  fuelCost: z.coerce.number().min(0),
  tollFees: z.coerce.number().min(0),
  parkingFees: z.coerce.number().min(0),
  tipAmount: z.coerce.number().min(0),
  platform: z.string().min(1, "اختر التطبيق"),
  tags: z.array(z.string()).default([])
});

type TripFormValues = z.infer<typeof tripSchema>;

const platforms = ["Uber", "Careem", "InDrive", "Other"];
const tags: Array<{ id: TripTag; label: string }> = [
  { id: "peak hour", label: "وقت الذروة" },
  { id: "airport run", label: "مشوار مطار" },
  { id: "long distance", label: "مسافة طويلة" }
];

export const AddTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const resetDismissedAdvice = useTripStore((state) => state.resetDismissedAdvice);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const profile = user?.profile;

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      date: getTodayIso(),
      startTime: "08:00",
      endTime: "08:30",
      distanceKm: 10,
      fareAmount: 120,
      commission: profile?.defaultCommission ?? 20,
      fuelCost: roundValue(10 * (profile?.defaultFuelCostKm ?? 2.5)),
      tollFees: 0,
      parkingFees: 0,
      tipAmount: 0,
      platform: "Uber",
      tags: []
    }
  });

  const platform = form.watch("platform");
  const distanceKm = Number(form.watch("distanceKm") ?? 0);
  const values = form.watch();

  useEffect(() => {
    if (!profile || id) return;

    const commissionMap: Record<string, number> = {
      Uber: profile.defaultCommissionUber,
      Careem: profile.defaultCommissionCareem,
      InDrive: profile.defaultCommissionInDrive,
      Other: profile.defaultCommissionOther
    };

    form.setValue("commission", commissionMap[platform] ?? profile.defaultCommission, {
      shouldValidate: true
    });
  }, [form, id, platform, profile]);

  useEffect(() => {
    if (!id) return;

    api.get<ApiResponse<Trip>>(`/trips/${id}`).then((response) => {
      const trip = response.data.data;
      form.reset({
        date: trip.date.slice(0, 10),
        startTime: trip.startTime,
        endTime: trip.endTime,
        distanceKm: trip.distanceKm,
        fareAmount: trip.fareAmount,
        commission: trip.commission,
        fuelCost: trip.fuelCost,
        tollFees: trip.tollFees,
        parkingFees: trip.parkingFees,
        tipAmount: trip.tipAmount,
        platform: trip.platform,
        tags: trip.tags
      });
      setLoading(false);
    });
  }, [form, id]);

  const suggestedFuel = roundValue(distanceKm * (profile?.defaultFuelCostKm ?? 2.5));
  const netProfit = useMemo(
    () =>
      calculateNetProfit({
        fareAmount: Number(values.fareAmount ?? 0),
        tipAmount: Number(values.tipAmount ?? 0),
        commission: Number(values.commission ?? 0),
        fuelCost: Number(values.fuelCost ?? 0),
        tollFees: Number(values.tollFees ?? 0),
        parkingFees: Number(values.parkingFees ?? 0)
      }),
    [values]
  );

  const onSubmit = form.handleSubmit(async (payload) => {
    setSaving(true);
    try {
      if (id) {
        await api.put(`/trips/${id}`, payload);
      } else {
        await api.post("/trips", payload);
      }
      resetDismissedAdvice();
      navigate(id ? `/trips/${id}` : "/history");
    } catch {
      window.alert("تعذر حفظ الرحلة، حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <PageShell>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          جارٍ تحميل بيانات الرحلة...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow">
        <h1 className="text-2xl font-extrabold text-white">{id ? "تعديل الرحلة" : "إضافة رحلة جديدة"}</h1>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          سجّل تفاصيل الرحلة وسيتم حساب صافي الربح تلقائيًا حسب العمولة والمصاريف.
        </p>

        <div className="mt-5 rounded-[1.75rem] border border-brand-400/20 bg-brand-500/10 p-4">
          <p className="text-sm text-brand-200">صافي الربح المتوقع</p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {formatCurrency(netProfit, profile?.currency ?? "EGP")}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <input className="field" type="date" {...form.register("date")} />
            <select className="field" {...form.register("platform")}>
              {platforms.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className="field" type="time" {...form.register("startTime")} />
            <input className="field" type="time" {...form.register("endTime")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="field"
              type="number"
              step="0.1"
              placeholder="المسافة كم"
              {...form.register("distanceKm", { valueAsNumber: true })}
            />
            <input
              className="field"
              type="number"
              step="0.1"
              placeholder="الأجرة"
              {...form.register("fareAmount", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="field"
              type="number"
              step="0.1"
              placeholder="نسبة العمولة %"
              {...form.register("commission", { valueAsNumber: true })}
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              الوقود المقترح: {formatCurrency(suggestedFuel, profile?.currency ?? "EGP")}
              <button
                type="button"
                onClick={() => form.setValue("fuelCost", suggestedFuel)}
                className="mt-2 block text-brand-300"
              >
                استخدام القيمة الافتراضية
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="field"
              type="number"
              step="0.1"
              placeholder="تكلفة الوقود"
              {...form.register("fuelCost", { valueAsNumber: true })}
            />
            <input
              className="field"
              type="number"
              step="0.1"
              placeholder="البقشيش"
              {...form.register("tipAmount", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="field"
              type="number"
              step="0.1"
              placeholder="رسوم الطريق"
              {...form.register("tollFees", { valueAsNumber: true })}
            />
            <input
              className="field"
              type="number"
              step="0.1"
              placeholder="رسوم الانتظار"
              {...form.register("parkingFees", { valueAsNumber: true })}
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">وسوم الرحلة</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = values.tags?.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? (values.tags ?? []).filter((item) => item !== tag.id)
                        : [...(values.tags ?? []), tag.id];
                      form.setValue("tags", next, { shouldValidate: true });
                    }}
                    className={`rounded-full px-4 py-2 text-sm transition active:scale-[0.97] ${
                      selected
                        ? "bg-brand-500 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="primary-button w-full" disabled={saving}>
            <Save className="ml-2 h-4 w-4" />
            {saving ? "جارٍ الحفظ..." : id ? "حفظ التعديلات" : "حفظ الرحلة"}
          </button>
        </form>
      </div>
    </PageShell>
  );
};
