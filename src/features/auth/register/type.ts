import { z } from "zod";

export const ownerRegisterSchema = z
  .object({
    username: z.string().trim().min(3, "At least 3 characters").max(100),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email")
      .max(255),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .refine(
        (v) => {
          const digits = v.replace(/\D/g, "");
          return digits.length >= 8 && digits.length <= 10;
        },
        { message: "Enter a valid phone number" }
      ),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/[a-z]/, "One lowercase letter")
      .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, "One number or symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    avatar: z.string().optional(),
    companyName: z.string().min(1, "Company name is required"),
    companyType: z.string().min(1, "Please select a company type"),
    companyImage: z.instanceof(File, { message: "กรุณาอัปโหลดโลโก้บริษัท" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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
