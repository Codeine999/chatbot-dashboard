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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Bot,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import Spinner from "@/assets/spin.svg";
import { Background } from "@/components/BackGround";
import { useLogin } from "./hooks/useAuth";
import type { LoginPayload } from "./types/auth.type";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// tsconfig ยังไม่เปิด strictNullChecks -> z.infer จะมองทุก field เป็น optional
// จึงปล่อยให้ react-hook-form infer type จาก schema แล้ว map เป็น LoginPayload ตอน submit
type LoginForm = z.infer<typeof loginSchema>;

const fieldClassName =
  "h-13 rounded-2xl border-white/80 bg-white/70 pl-11 pr-4 text-[15px] text-slate-800 shadow-[0_8px_22px_rgba(88,70,148,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 focus-visible:border-violet-300 focus-visible:bg-white/90 focus-visible:ring-4 focus-visible:ring-violet-400/15 dark:!bg-white/70";

const Login = () => {
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
      formReset.setError("email", { message: "Email is required" });
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

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#fcf8f7] px-4 py-8 text-slate-900 sm:px-6">
      <Background />

      <section className="relative w-full max-w-[36rem] overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/65
       px-6 py-8 shadow-[0_28px_70px_rgba(90,90,135,0.16),inset_0_1px_1px_rgba(255,255,255,0.95)] backdrop-blur-[0px] sm:px-25 sm:py-13">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/95" />

        <motion.div
          key={isForgotPassword ? "forgot" : "login"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="mx-auto w-full max-w-[35rem] pt-14"
        >
          {isForgotPassword ? (
            <div>
              <button type="button" onClick={() => setForgotPassword(false)} className="mb-7 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-violet-700">
                <ChevronLeft className="size-4" /> Back to sign in
              </button>
              <div className="text-center">
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
                  <Mail className="size-4" /> Reset access
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">Reset password</h1>
                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-slate-500">Enter your email and we&apos;ll send a link to reset your password.</p>
              </div>

              <Form {...formReset}>
                <form onSubmit={formReset.handleSubmit(resetPassword)} className="mx-auto mt-10 max-w-[31rem] space-y-5">
                  <FormField control={formReset.control} name="email" render={({ field }) => (
                    <FormItem>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                          <Input type="email" autoComplete="email" placeholder="you@company.com" {...field} className={fieldClassName} />
                        </div>
                      </FormControl>
                      <FormMessage className="px-1 text-xs" />
                    </FormItem>
                  )} />
                  {isSent && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">We sent a reset link to your email.</p>}
                  <Button type="submit" disabled={loading} className="h-13 w-full rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-500 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(116,66,235,0.32),inset_0_1px_1px_rgba(255,255,255,0.45)] transition hover:brightness-105">
                    {loading ? <img src={Spinner} alt="Loading" className="size-5" /> : "Send reset link"}
                  </Button>
                  <p className="text-center text-xs text-slate-400">Don&apos;t forget to check your spam folder.</p>
                </form>
              </Form>
            </div>
          ) : (
            <div>
              <div className="text-center mb-14">
                <div className="-mt-12 flex justify-center">
                  <div className="flex items-center gap-3 rounded-full border border-white/90 bg-white/75 py-1 pl-3 pr-5 text-[22px] font-bold tracking-[-0.04em] text-violet-600 shadow-[0_7px_22px_rgba(123,92,229,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] backdrop-blur-md">
                    <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-violet-600 to-fuchsia-500 text-white shadow-[0_4px_12px_rgba(132,83,235,0.38)]">
                      <Bot className="size-5" strokeWidth={2} />
                    </span>
                      <p className="text-[17px]">KeeLa AI</p>
                  </div>
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-4xl">Welcome back</h1>
                <p className="mt-3 text-[15px] text-slate-500">Sign in to manage your workspace</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto mt-10 max-w-[31rem] space-y-5">
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                          <Input type="text" autoComplete="username" placeholder="Enter your username" {...field} className={fieldClassName} />
                        </div>
                      </FormControl>
                      <FormMessage className="px-1 text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                          <Input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" {...field} className={`${fieldClassName} pr-12`} />
                          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="px-1 text-xs" />
                    </FormItem>
                  )} />

                  <div className="flex items-center justify-between gap-4 pt-0.5">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-600">
                      <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} className="size-5 rounded-md border-slate-300 bg-white/75 data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600 dark:!bg-white/75 dark:data-[state=checked]:!bg-violet-600" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setForgotPassword(true)} className="text-sm font-semibold text-violet-600 transition hover:text-violet-800">Forgot password?</button>
                  </div>

                  {errorMessage && <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{errorMessage}</p>}

                  <Button 
                    type="submit" 
                    disabled={isPending} 
                    className="h-13 w-full mt-12">
                    {isPending ? <img src={Spinner} alt="Loading" className="size-5" /> : "Sign in"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </motion.div>

        {/* <div className="mx-auto mt-8 flex max-w-[31rem] items-center justify-center gap-2 border-t border-slate-200/70 pt-6 text-sm text-slate-400">
          <ShieldCheck className="size-4" /> Secure admin access
        </div> */}
      </section>
    </main>
  );
};

export default Login;
