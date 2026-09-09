import { Mail, LockKeyhole, User, Eye, EyeOff } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { OwnerRegisterForm } from "../type";
import { PasswordRule } from "./PasswordRule";
import { useTranslation } from "react-i18next";

type Props = {
  form: UseFormReturn<OwnerRegisterForm>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
};

export const StepAccount = ({
  form,
  showPassword,
  showConfirmPassword,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
}: Props) => {
  const { t } = useTranslation("auth");
  const password = form.watch("password");
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    numberOrSymbol: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("register.field.username")}</FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                <User className="text-gray-400 w-5" />
              </div>
              <FormControl>
                <Input
                  placeholder={t("register.placeholder.username")}
                  {...field}
                  className="bg-gray-50 h-[45px] focus-visible:ring-ring/0 pl-11 placeholder:text-[14px] text-[14px] text-gray-800"
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("register.field.email")}</FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                <Mail className="text-gray-400 w-5" />
              </div>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("register.placeholder.email")}
                  {...field}
                  className="bg-gray-50 h-[45px] focus-visible:ring-ring/0 pl-11 placeholder:text-[14px] text-[14px] text-gray-800"
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("register.field.phone")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("register.placeholder.phone")}
                {...field}
                className="bg-gray-50 h-[45px] focus-visible:ring-ring/0 placeholder:text-[14px] text-[14px] text-gray-800"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("register.field.password")}</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                  <LockKeyhole className="text-gray-400 w-5" />
                </div>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("register.placeholder.password")}
                    {...field}
                    className="bg-gray-50 h-[45px] focus-visible:ring-ring/0 pl-11 pr-9 placeholder:text-[14px] text-[14px] text-gray-800"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={onToggleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5" /> : <Eye className="w-5" />}
                </button>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("register.field.confirmPassword")}</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                  <LockKeyhole className="text-gray-400 w-5" />
                </div>
                <FormControl>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("register.placeholder.confirmPassword")}
                    {...field}
                    className="bg-gray-50 h-[45px] focus-visible:ring-ring/0 pl-11 pr-9 placeholder:text-[14px] text-[14px] text-gray-800"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={onToggleShowConfirmPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5" />
                  ) : (
                    <Eye className="w-5" />
                  )}
                </button>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs font-medium text-gray-600 mb-2">{t("register.passwordRules.title")}</p>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-gray-500">
          <PasswordRule met={passwordChecks.length} label={t("register.passwordRules.length")} />
          <PasswordRule met={passwordChecks.lower} label={t("register.passwordRules.lower")} />
          <PasswordRule met={passwordChecks.upper} label={t("register.passwordRules.upper")} />
          <PasswordRule met={passwordChecks.numberOrSymbol} label={t("register.passwordRules.numberOrSymbol")} />
        </div>
      </div>
    </div>
  );
};
