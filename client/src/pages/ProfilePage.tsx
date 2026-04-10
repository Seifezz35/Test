import { useEffect, useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Save, Trash2 } from "lucide-react";
import { api } from "@/api/axiosInstance";
import { PageShell } from "@/components/PageShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse, Profile, User } from "@/types";

const nullableNumber = z.preprocess(
  (value) => (value === "" || value === null || Number.isNaN(value) ? null : Number(value)),
  z
    .number()
    .min(1990, "سنة السيارة غير صحيحة")
    .max(2100, "سنة السيارة غير صحيحة")
    .nullable()
);

const profileSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  carModel: z.string().nullable(),
  carYear: nullableNumber,
  licensePlate: z.string().nullable(),
  defaultCommission: z.coerce.number().min(0).max(100),
  defaultCommissionUber: z.coerce.number().min(0).max(100),
  defaultCommissionCareem: z.coerce.number().min(0).max(100),
  defaultCommissionInDrive: z.coerce.number().min(0).max(100),
  defaultCommissionOther: z.coerce.number().min(0).max(100),
  defaultFuelCostKm: z.coerce.number().min(0),
  currency: z.string().min(1),
  notificationsEnabled: z.boolean(),
  monthlyGoal: z.coerce.number().min(0),
  theme: z.enum(["dark", "light"])
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type ProfileResponse = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  profile: Profile;
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfileUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      carModel: user?.profile?.carModel ?? "",
      carYear: user?.profile?.carYear ?? null,
      licensePlate: user?.profile?.licensePlate ?? "",
      defaultCommission: user?.profile?.defaultCommission ?? 20,
      defaultCommissionUber: user?.profile?.defaultCommissionUber ?? 25,
      defaultCommissionCareem: user?.profile?.defaultCommissionCareem ?? 20,
      defaultCommissionInDrive: user?.profile?.defaultCommissionInDrive ?? 12,
      defaultCommissionOther: user?.profile?.defaultCommissionOther ?? 15,
      defaultFuelCostKm: user?.profile?.defaultFuelCostKm ?? 2.5,
      currency: user?.profile?.currency ?? "EGP",
      notificationsEnabled: user?.profile?.notificationsEnabled ?? true,
      monthlyGoal: user?.profile?.monthlyGoal ?? 3000,
      theme: user?.profile?.theme ?? "dark"
    }
  });

  useEffect(() => {
    api.get<ApiResponse<ProfileResponse>>("/profile").then((response) => {
      const payload = response.data.data;
      form.reset({
        name: payload.name,
        carModel: payload.profile.carModel ?? "",
        carYear: payload.profile.carYear ?? null,
        licensePlate: payload.profile.licensePlate ?? "",
        defaultCommission: payload.profile.defaultCommission,
        defaultCommissionUber: payload.profile.defaultCommissionUber,
        defaultCommissionCareem: payload.profile.defaultCommissionCareem,
        defaultCommissionInDrive: payload.profile.defaultCommissionInDrive,
        defaultCommissionOther: payload.profile.defaultCommissionOther,
        defaultFuelCostKm: payload.profile.defaultFuelCostKm,
        currency: payload.profile.currency,
        notificationsEnabled: payload.profile.notificationsEnabled,
        monthlyGoal: payload.profile.monthlyGoal,
        theme: payload.profile.theme
      });
      setLoading(false);
    });
  }, [form]);

  const saveProfile = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      const response = await api.put<ApiResponse<ProfileResponse>>("/profile", values);
      const payload = response.data.data;
      const nextUser: User = {
        id: user?.id ?? payload.id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        isVerified: user?.isVerified ?? true,
        profile: payload.profile
      };
      updateProfileUser(nextUser);
      document.documentElement.dataset.theme = payload.profile.theme;
    } catch {
      window.alert("تعذر حفظ الإعدادات الآن.");
    } finally {
      setSaving(false);
    }
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const response = await api.get("/export/csv", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "captainprofit-trips.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.alert("تعذر تصدير البيانات الآن.");
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("سيتم حذف الحساب وكل الرحلات نهائيًا. هل أنت متأكد؟")) return;
    try {
      await api.delete("/auth/account", {
        data: {
          confirm: "DELETE"
        }
      });
      await logout();
      navigate("/auth");
    } catch {
      window.alert("تعذر حذف الحساب الآن.");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center text-slate-300">
          جارٍ تحميل الملف الشخصي...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <form className="space-y-5" onSubmit={saveProfile}>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <h1 className="text-2xl font-extrabold text-white">الملف الشخصي والإعدادات</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            حدّث بياناتك وسياراتك والعمولات الافتراضية لتسجيل الرحلات أسرع.
          </p>

          <div className="mt-5 space-y-4">
            <input className="field" placeholder="اسم الكابتن" {...form.register("name")} />
            <div className="grid grid-cols-2 gap-3">
            <input className="field" placeholder="موديل السيارة" {...form.register("carModel")} />
            <input
              className="field"
              type="number"
              placeholder="سنة السيارة"
              {...form.register("carYear", {
                setValueAs: (value) => (value === "" ? null : Number(value))
              })}
            />
            </div>
            <input className="field" placeholder="رقم اللوحة" {...form.register("licensePlate")} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold text-white">إعدادات الربحية</h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <input className="field" type="number" step="0.1" placeholder="عمولة افتراضية" {...form.register("defaultCommission", { valueAsNumber: true })} />
            <input className="field" type="number" step="0.1" placeholder="تكلفة الوقود لكل كم" {...form.register("defaultFuelCostKm", { valueAsNumber: true })} />
            <input className="field" type="number" step="0.1" placeholder="عمولة Uber" {...form.register("defaultCommissionUber", { valueAsNumber: true })} />
            <input className="field" type="number" step="0.1" placeholder="عمولة Careem" {...form.register("defaultCommissionCareem", { valueAsNumber: true })} />
            <input className="field" type="number" step="0.1" placeholder="عمولة InDrive" {...form.register("defaultCommissionInDrive", { valueAsNumber: true })} />
            <input className="field" type="number" step="0.1" placeholder="عمولة أخرى" {...form.register("defaultCommissionOther", { valueAsNumber: true })} />
            <input className="field" placeholder="العملة" {...form.register("currency")} />
            <input className="field" type="number" step="0.1" placeholder="الهدف الشهري" {...form.register("monthlyGoal", { valueAsNumber: true })} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-bold text-white">الثيم والتنبيهات</h2>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">المظهر</p>
              <p className="mt-1 text-sm text-slate-300">بدّل بين الوضع الداكن والفاتح بسلاسة</p>
            </div>
            <ThemeToggle
              value={form.watch("theme")}
              onChange={(value) => {
                form.setValue("theme", value);
                document.documentElement.dataset.theme = value;
              }}
            />
          </div>

          <label className="mt-5 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-slate-900/50 px-4 py-3">
            <div>
              <p className="font-semibold text-white">الإشعارات</p>
              <p className="text-sm text-slate-400">تذكيرات ونصائح ذكية حول الأداء</p>
            </div>
            <input type="checkbox" className="h-5 w-5 accent-amber-500" {...form.register("notificationsEnabled")} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={exportCsv} className="secondary-button" disabled={exporting}>
            <Download className="ml-2 h-4 w-4" />
            {exporting ? "جارٍ التصدير..." : "تصدير CSV"}
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            <Save className="ml-2 h-4 w-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>

        <button
          type="button"
          onClick={deleteAccount}
          className="flex w-full items-center justify-center rounded-2xl bg-rose-500/80 px-4 py-3 font-semibold text-white transition active:scale-[0.97]"
        >
          <Trash2 className="ml-2 h-4 w-4" />
          حذف الحساب
        </button>
      </form>
    </PageShell>
  );
};
