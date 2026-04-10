import { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, LogIn, UserPlus } from "lucide-react";
import { AuthIllustration } from "@/components/AuthIllustration";
import { OTPInput } from "@/components/OTPInput";
import { useAuthStore } from "@/store/authStore";
import { getPasswordStrength } from "@/utils/profitCalc";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";

const registerSchema = z
  .object({
    name: z.string().min(2, "الاسم مطلوب"),
    email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
    phone: z.string().min(8, "رقم الهاتف غير صحيح").optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
      .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم")
      .regex(/[^A-Za-z0-9]/, "كلمة المرور يجب أن تحتوي على رمز خاص")
  })
  .refine((values) => values.email || values.phone, {
    path: ["email"],
    message: "أدخل بريد إلكتروني أو رقم هاتف"
  });

const loginSchema = z.object({
  identifier: z.string().min(4, "أدخل البريد أو الهاتف"),
  password: z.string().min(1, "أدخل كلمة المرور"),
  rememberMe: z.boolean().default(false)
});

const forgotSchema = z.object({
  identifier: z.string().min(4, "أدخل البريد أو الهاتف")
});

const resetSchema = z.object({
  identifier: z.string().min(4, "أدخل البريد أو الهاتف"),
  code: z.string().length(6, "الرمز يجب أن يكون 6 أرقام"),
  password: z
    .string()
    .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
    .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم")
    .regex(/[^A-Za-z0-9]/, "كلمة المرور يجب أن تحتوي على رمز خاص")
});

type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [pendingIdentifier, setPendingIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const {
    register: registerAction,
    verifyOtp,
    login,
    forgotPassword,
    resetPassword,
    loading,
    error,
    setError
  } = useAuthStore();

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: ""
    }
  });

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true
    }
  });

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      identifier: ""
    }
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      identifier: "",
      code: "",
      password: ""
    }
  });

  const passwordStrength = getPasswordStrength(registerForm.watch("password") ?? "");
  const resetStrength = getPasswordStrength(resetForm.watch("password") ?? "");

  const switchMode = (nextMode: Mode) => {
    setError(null);
    setMode(nextMode);
  };

  const handleRegister = registerForm.handleSubmit(async (values) => {
    try {
      const result = await registerAction(values);
      const identifier = result.verificationTarget;
      setPendingIdentifier(identifier);
      setOtpCode("");
      switchMode("verify");
    } catch {
      return;
    }
  });

  const handleVerify = async () => {
    try {
      await verifyOtp(pendingIdentifier, otpCode);
      navigate("/");
    } catch {
      return;
    }
  };

  const handleLogin = loginForm.handleSubmit(async (values) => {
    try {
      await login(values.identifier, values.password, values.rememberMe);
      navigate("/");
    } catch {
      return;
    }
  });

  const handleForgot = forgotForm.handleSubmit(async (values) => {
    try {
      await forgotPassword(values.identifier);
      setPendingIdentifier(values.identifier);
      resetForm.setValue("identifier", values.identifier);
      switchMode("reset");
    } catch {
      return;
    }
  });

  const handleReset = resetForm.handleSubmit(async (values) => {
    try {
      await resetPassword(values.identifier, values.code, values.password);
      loginForm.setValue("identifier", values.identifier);
      switchMode("login");
    } catch {
      return;
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(245,158,11,0.24),_transparent_32%)]" />
      <div className="relative z-10 w-full max-w-md animate-page-in rounded-[2.25rem] border border-white/10 bg-slate-950/70 p-5 shadow-glow backdrop-blur-xl">
        <AuthIllustration />

        <div className="mt-6">
          <h1 className="text-3xl font-extrabold text-white">CaptainProfit</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            تطبيق ذكي يساعدك تسجل رحلاتك وتفهم أرباحك اليومية من Uber وCareem وInDrive.
          </p>
        </div>

        {(mode === "login" || mode === "register") && (
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.97] ${
                mode === "login" ? "bg-brand-500 text-slate-950" : "text-slate-300"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.97] ${
                mode === "register" ? "bg-brand-500 text-slate-950" : "text-slate-300"
              }`}
            >
              إنشاء حساب
            </button>
          </div>
        )}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {mode === "login" && (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <input
                className="field"
                placeholder="البريد الإلكتروني أو رقم الهاتف"
                {...loginForm.register("identifier")}
              />
              <p className="mt-2 text-xs text-rose-200">{loginForm.formState.errors.identifier?.message}</p>
            </div>

            <div>
              <input className="field" type="password" placeholder="كلمة المرور" {...loginForm.register("password")} />
              <p className="mt-2 text-xs text-rose-200">{loginForm.formState.errors.password?.message}</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" className="accent-amber-500" {...loginForm.register("rememberMe")} />
              <span>تذكرني لمدة 30 يوم</span>
            </label>

            <button type="submit" className="primary-button w-full" disabled={loading}>
              <LogIn className="ml-2 h-4 w-4" />
              دخول
            </button>

            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="w-full text-center text-sm font-semibold text-brand-300"
            >
              نسيت كلمة المرور؟
            </button>
          </form>
        )}

        {mode === "register" && (
          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <div>
              <input className="field" placeholder="اسم الكابتن" {...registerForm.register("name")} />
              <p className="mt-2 text-xs text-rose-200">{registerForm.formState.errors.name?.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input className="field" placeholder="البريد الإلكتروني" {...registerForm.register("email")} />
                <p className="mt-2 text-xs text-rose-200">{registerForm.formState.errors.email?.message}</p>
              </div>
              <div>
                <input className="field" placeholder="رقم الهاتف" {...registerForm.register("phone")} />
                <p className="mt-2 text-xs text-rose-200">{registerForm.formState.errors.phone?.message}</p>
              </div>
            </div>

            <div>
              <input
                className="field"
                type="password"
                placeholder="كلمة المرور"
                {...registerForm.register("password")}
              />
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                  style={{ width: `${passwordStrength.percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-300">قوة كلمة المرور: {passwordStrength.label}</p>
              <p className="mt-2 text-xs text-rose-200">{registerForm.formState.errors.password?.message}</p>
            </div>

            <button type="submit" className="primary-button w-full" disabled={loading}>
              <UserPlus className="ml-2 h-4 w-4" />
              إنشاء الحساب
            </button>
          </form>
        )}

        {mode === "verify" && (
          <div className="mt-6 space-y-5">
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <ArrowRight className="h-4 w-4" />
              رجوع
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">تأكيد الحساب</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                أدخل رمز التحقق المكوّن من 6 أرقام الذي أُرسل إلى {pendingIdentifier}.
              </p>
            </div>
            <OTPInput value={otpCode} onChange={setOtpCode} />
            <button
              type="button"
              onClick={handleVerify}
              disabled={otpCode.length !== 6 || loading}
              className="primary-button w-full"
            >
              <KeyRound className="ml-2 h-4 w-4" />
              تأكيد الرمز
            </button>
          </div>
        )}

        {mode === "forgot" && (
          <form className="mt-6 space-y-5" onSubmit={handleForgot}>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <ArrowRight className="h-4 w-4" />
              رجوع
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">استعادة كلمة المرور</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                سنرسل لك رمز تحقق إلى البريد الإلكتروني أو الهاتف المسجل.
              </p>
            </div>
            <input className="field" placeholder="البريد الإلكتروني أو الهاتف" {...forgotForm.register("identifier")} />
            <p className="text-xs text-rose-200">{forgotForm.formState.errors.identifier?.message}</p>
            <button type="submit" className="primary-button w-full" disabled={loading}>
              إرسال الرمز
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form className="mt-6 space-y-4" onSubmit={handleReset}>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <ArrowRight className="h-4 w-4" />
              رجوع
            </button>

            <input className="field" placeholder="البريد الإلكتروني أو الهاتف" {...resetForm.register("identifier")} />
            <input className="field" placeholder="رمز التحقق" {...resetForm.register("code")} />
            <input
              className="field"
              type="password"
              placeholder="كلمة المرور الجديدة"
              {...resetForm.register("password")}
            />
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                style={{ width: `${resetStrength.percent}%` }}
              />
            </div>
            <p className="text-xs text-slate-300">قوة كلمة المرور: {resetStrength.label}</p>
            <button type="submit" className="primary-button w-full" disabled={loading}>
              حفظ كلمة المرور
            </button>
          </form>
        )}
      </div>
    </main>
  );
};
