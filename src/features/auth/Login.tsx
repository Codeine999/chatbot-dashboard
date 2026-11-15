import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { useLogin } from "./hooks/useAuth";
import { LoginBrandPanel } from "./components/LoginBrandPanel";
import type { LoginPayload } from "./types/auth.type";
import { useTranslation } from "react-i18next";

// เก็บเป็น translation key ไม่ใช่ข้อความจริง เพราะ schema ถูกสร้างครั้งเดียวนอก component
// ถ้าใส่ข้อความแปลไว้เลย ข้อความ error จะค้างเป็นภาษาแรกที่โหลด
const loginSchema = z.object({
  username: z.string().min(1, "auth:validation.usernameRequired"),
  password: z.string().min(1, "auth:validation.passwordRequired"),
});

// tsconfig ยังไม่เปิด strictNullChecks -> z.infer จะมองทุก field เป็น optional
// จึงปล่อยให้ react-hook-form infer type จาก schema แล้ว map เป็น LoginPayload ตอน submit
type LoginForm = z.infer<typeof loginSchema>;

/** ช่องกรอกสูง 44px ขอบบาง โฟกัสแล้วขอบเป็นสีดำพร้อมวงแหวนจาง ตามดีไซน์ */
const fieldClassName =
  "h-11 rounded-[10px] border-border bg-background pl-10 pr-3 text-sm text-foreground shadow-none placeholder:text-mini focus-visible:border-foreground focus-visible:ring-[3px] focus-visible:ring-foreground/10 dark:bg-background";

const fieldIconClassName = "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mini";

const labelClassName = "text-[13px] leading-[1.45] font-medium text-foreground";

const submitClassName =
  "mt-6 h-[46px] w-full gap-2 rounded-full bg-foreground text-[15px] font-medium text-background shadow-none hover:bg-foreground/85 active:bg-foreground/75 disabled:opacity-100";

const BrandMark = () => (
  <span className="flex items-center gap-2.5">
    <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-foreground text-[17px] font-semibold text-background">
      k
    </span>
    <span className="text-[21px] leading-none font-semibold tracking-[-0.035em] text-foreground">keeLa</span>
  </span>
);

const Login = () => {
  const { t } = useTranslation("auth");
  const [isForgotPassword, setForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { mutate: login, isPending, errorMessage } = useLogin();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const formReset = useForm({ defaultValues: { email: "" } });

  const onSubmit = (data: LoginForm) => {
    const payload: LoginPayload = { username: data.username, password: data.password };
    login(payload);
  };

  const resetPassword = async (data: { email?: string }) => {
    if (!data.email) {
      formReset.setError("email", { message: "auth:validation.emailRequired" });
      return;
    }

    setLoading(true);
    setIsSent(false);

    // Keep the existing reset-password placeholder flow until its API is connected.
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setTimeout(() => setLoading(false), 3000);
      setTimeout(() => setIsSent(true), 3200);
    } catch (error) {
      console.error("Failed to send email:", error);
      setLoading(false);
    }
  };

  const linkClassName = "underline-offset-[3px] hover:underline";

  return (
    <div className="flex min-h-svh flex-row-reverse bg-background text-foreground">
      {/* ============ FORM SIDE ============ */}
      <div className="flex min-w-0 flex-[7_1_0%] flex-col px-6 py-7 sm:px-10">
        <BrandMark />

        <main className="flex flex-1 items-center justify-center py-10">
          <motion.div
            key={isForgotPassword ? "forgot" : "login"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-full max-w-[380px]"
          >
            {isForgotPassword ? (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="mb-6 inline-flex cursor-pointer items-center gap-1 self-start text-[13px] font-medium text-normal transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="size-4" /> {t("reset.backToSignIn")}
                </button>

                <span className="inline-flex h-7 items-center gap-2 self-start rounded-full bg-[#f5f2ef] pl-2 pr-3 text-xs font-medium text-normal dark:bg-muted">
                  <Mail className="size-3.5" /> {t("reset.badge")}
                </span>
                <h1 className="mt-[18px] text-[30px] leading-[1.2] font-semibold tracking-[-0.025em]">
                  {t("reset.title")}
                </h1>
                <p className="mt-2 text-sm leading-[1.5] text-normal">{t("reset.subtitle")}</p>

                <Form {...formReset}>
                  <form onSubmit={formReset.handleSubmit(resetPassword)} className="mt-8 flex flex-col">
                    <FormField
                      control={formReset.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="gap-1.5">
                          <FormLabel className={labelClassName}>{t("reset.email")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className={fieldIconClassName} strokeWidth={1.7} />
                              <Input
                                type="email"
                                autoComplete="email"
                                placeholder={t("reset.emailPlaceholder")}
                                {...field}
                                className={fieldClassName}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {isSent && (
                      <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
                        {t("reset.sent")}
                      </p>
                    )}

                    <Button type="submit" disabled={loading} className={submitClassName}>
                      {loading ? (
                        <LoaderCircle className="size-5 animate-spin" role="status" aria-label={t("login.loading")} />
                      ) : (
                        t("reset.submit")
                      )}
                    </Button>
                    <p className="mt-4 text-center text-xs text-mini">{t("reset.spamHint")}</p>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="inline-flex h-7 items-center gap-2 self-start rounded-full bg-[#f5f2ef] pl-2 pr-3 text-xs font-medium text-normal dark:bg-muted">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z"
                      fill="#4f46e5"
                    />
                  </svg>
                  {t("login.badge")}
                </span>

                <h1 className="mt-[18px] text-[30px] leading-[1.2] font-semibold tracking-[-0.025em]">
                  {t("login.title")}
                </h1>
                <p className="mt-2 text-sm leading-[1.5] text-normal">{t("login.subtitle")}</p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex flex-col">
                    <div className="flex flex-col gap-[18px]">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="gap-1.5">
                            <FormLabel className={labelClassName}>{t("login.username")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserRound className={fieldIconClassName} strokeWidth={1.7} />
                                <Input
                                  type="text"
                                  autoComplete="username"
                                  placeholder={t("login.usernamePlaceholder")}
                                  {...field}
                                  className={fieldClassName}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="gap-1.5">
                            <div className="flex items-baseline justify-between">
                              <FormLabel className={labelClassName}>{t("login.password")}</FormLabel>
                              <button
                                type="button"
                                onClick={() => setForgotPassword(true)}
                                className={`cursor-pointer text-[13px] text-normal ${linkClassName} hover:text-foreground`}
                              >
                                {t("login.forgotPassword")}
                              </button>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className={fieldIconClassName} strokeWidth={1.7} />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  autoComplete="current-password"
                                  placeholder={t("login.passwordPlaceholder")}
                                  {...field}
                                  className={`${fieldClassName} pr-12`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((visible) => !visible)}
                                  className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-mini transition-colors hover:bg-muted"
                                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                                >
                                  {showPassword ? (
                                    <EyeOff className="size-4" strokeWidth={1.7} />
                                  ) : (
                                    <Eye className="size-4" strokeWidth={1.7} />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-normal">
                        <Checkbox
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                          className="size-4 rounded-[4px] border-border data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                        />
                        {t("login.rememberMe")}
                      </label>
                    </div>

                    {errorMessage && (
                      <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                        {errorMessage}
                      </p>
                    )}

                    <Button type="submit" disabled={isPending} className={submitClassName}>
                      {isPending ? (
                        <LoaderCircle className="size-5 animate-spin" role="status" aria-label={t("login.loading")} />
                      ) : (
                        <>
                          {t("login.submit")}
                          <ArrowRight className="size-[15px]" strokeWidth={2} />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                <p className="mt-6 text-center text-[13px] text-mini">
                  {t("login.noAccount")}{" "}
                  <a href="#" className={`font-medium text-foreground ${linkClassName}`}>
                    {t("login.contactAdmin")}
                  </a>
                </p>
              </div>
            )}
          </motion.div>
        </main>

        <footer className="flex flex-wrap justify-between gap-2 text-xs text-mini">
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          <span>
            <a href="#" className={linkClassName}>
              {t("footer.terms")}
            </a>{" "}
            ·{" "}
            <a href="#" className={linkClassName}>
              {t("footer.privacy")}
            </a>
          </span>
        </footer>
      </div>

      {/* ============ BRAND SIDE ============ */}
      <LoginBrandPanel />
    </div>
  );
};

export default Login;
