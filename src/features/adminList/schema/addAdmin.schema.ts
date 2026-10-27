import { z } from "zod";
import { isCreatableRole } from "../type";

// ข้อความ error เก็บเป็น translation key แล้วให้ <FormMessage> แปลตอน render
// กติกาตรงกับ CreateAdminDto ฝั่ง backend และกฎรหัสผ่านตอนสมัครเจ้าของ

/** ตรงกับ regex ของ aiBudgetLimitCredit ใน backend */
const CREDIT_PATTERN = /^\d+(\.\d{1,6})?$/;

export const addAdminSchema = z
  .object({
    firstName: z.string().trim().min(1, "auth:validation.firstNameRequired").max(100),
    lastName: z.string().trim().min(1, "auth:validation.lastNameRequired").max(100),
    username: z.string().trim().min(3, "auth:validation.usernameMin").max(100),
    // "" คือยังไม่ได้เลือก
    role: z.string().refine((value): boolean => isCreatableRole(value), "admins:validation.roleRequired"),
    password: z
      .string()
      .min(8, "auth:validation.passwordMin")
      .max(128)
      .regex(/[A-Z]/, "auth:validation.passwordUpper")
      .regex(/[a-z]/, "auth:validation.passwordLower")
      .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, "auth:validation.passwordNumberOrSymbol"),
    confirmPassword: z.string().min(1, "auth:validation.confirmPasswordRequired"),
    email: z
      .string()
      .trim()
      .min(1, "auth:validation.emailRequired")
      .email("auth:validation.emailInvalid")
      .max(255),
    phone: z
      .string()
      .trim()
      .min(1, "auth:validation.phoneRequired")
      .refine((value) => {
        const digits = value.replace(/\D/g, "");
        return digits.length >= 8 && digits.length <= 10;
      }, "auth:validation.phoneInvalid"),
    aiEnabled: z.boolean(),
    aiCredit: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth:validation.passwordMismatch",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (!data.aiEnabled) return;

    if (data.aiCredit === "") {
      ctx.addIssue({ code: "custom", path: ["aiCredit"], message: "admins:validation.creditRequired" });
    } else if (!CREDIT_PATTERN.test(data.aiCredit)) {
      ctx.addIssue({ code: "custom", path: ["aiCredit"], message: "admins:validation.creditInvalid" });
    }
  });

export type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export const addAdminDefaults: AddAdminFormValues = {
  firstName: "",
  lastName: "",
  username: "",
  role: "",
  password: "",
  confirmPassword: "",
  email: "",
  phone: "",
  aiEnabled: true,
  aiCredit: "",
};
