import { z } from "zod";

// ข้อความ error เก็บเป็น translation key (schema ถูกสร้างครั้งเดียวนอก component)
// FormMessage เป็นคนแปลตอน render — ดู src/components/ui/form.tsx

export const ownerRegisterSchema = z
  .object({
    username: z.string().trim().min(3, "auth:validation.usernameMin").max(100),
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
      .refine(
        (v) => {
          const digits = v.replace(/\D/g, "");
          return digits.length >= 8 && digits.length <= 10;
        },
        { message: "auth:validation.phoneInvalid" }
      ),
    password: z
      .string()
      .min(8, "auth:validation.passwordMin")
      .max(128)
      .regex(/[A-Z]/, "auth:validation.passwordUpper")
      .regex(/[a-z]/, "auth:validation.passwordLower")
      .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, "auth:validation.passwordNumberOrSymbol"),
    confirmPassword: z.string().min(1, "auth:validation.confirmPasswordRequired"),
    firstName: z.string().trim().min(1, "auth:validation.firstNameRequired").max(100),
    lastName: z.string().trim().min(1, "auth:validation.lastNameRequired").max(100),
    avatar: z.string().optional(),
    companyName: z.string().min(1, "auth:validation.companyNameRequired"),
    companyType: z.string().min(1, "auth:validation.companyTypeRequired"),
    companyImage: z.instanceof(File, { message: "auth:validation.companyImageRequired" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth:validation.passwordMismatch",
    path: ["confirmPassword"],
  });

export type OwnerRegisterForm = z.infer<typeof ownerRegisterSchema>;

export const accountFieldNames = [
  "username",
  "email",
  "phone",
  "password",
  "confirmPassword",
] as const;

export const profileFieldNames = ["firstName", "lastName"] as const;

export const companyFieldNames = [
  "companyName",
  "companyType",
  "companyImage",
] as const;

/** ฟิลด์ที่ persist ลง localStorage ระหว่าง step (ไม่รวม password และไฟล์ที่ serialize ไม่ได้) */
export type OwnerRegisterDraftData = Omit<
  OwnerRegisterForm,
  "password" | "confirmPassword" | "companyImage"
>;

export type AuditOwnerPayload = {
  username: string;
  email: string;
  phone: string;
};

/** data: true = พบปัญหา ต้องแก้ก่อนถึงจะไปต่อได้ */
export type AuditOwnerResponse = {
  data: boolean;
  message?: string;
};

export type CreateOwnerPayload = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image?: string | null;
  role: "owner";
};

export type CreateOwnerResponse = {
  id: string;
};

export type CreateCompanyPayload = {
  companyName: string;
  companyType: string;
  image?: File | null;
};
