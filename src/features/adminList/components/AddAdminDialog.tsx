import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FilePicker } from "@/components/common/FilePicker";
import { SwitchField } from "@/components/common/SwitchField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAdmin } from "../hooks/useCreateAdmin";
import {
  addAdminDefaults,
  addAdminSchema,
  type AddAdminFormValues,
} from "../schema/addAdmin.schema";
import { ADMIN_CREATABLE_ROLES, isCreatableRole } from "../type";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type TextFieldName = Exclude<keyof AddAdminFormValues, "role" | "aiEnabled">;

const labelClassName = "text-sm font-medium text-normal";

export const AddAdminDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation("admins");
  const createAdmin = useCreateAdmin();

  // รูปโปรไฟล์ยังเป็นแค่ตัวอย่างในหน้า backend รับเฉพาะ URL ของรูปที่มีอยู่แล้ว จึงยังไม่ส่งไปกับบัญชี
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: addAdminDefaults,
    mode: "onTouched",
  });

  const aiEnabled = form.watch("aiEnabled");

  // เปิดใหม่ทุกครั้งต้องเป็นฟอร์มเปล่า ไม่ค้างค่าที่เพิ่งพิมพ์ไว้
  useEffect(() => {
    if (open) return;
    form.reset(addAdminDefaults);
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }, [open, form]);

  const handleAvatar = ([file]: File[]) => {
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    // zod กันค่าที่ไม่ใช่สิทธิ์ไว้แล้ว ตรงนี้แค่ช่วยให้ type แคบลง
    if (!isCreatableRole(values.role)) return;

    createAdmin.mutate(
      {
        username: values.username,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        aiBudgetLimitCredit: values.aiEnabled ? values.aiCredit : undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  });

  const renderInput = (
    name: TextFieldName,
    props: { type?: string; placeholder?: string; autoComplete?: string; inputMode?: "decimal" } = {},
    options: { disabled?: boolean; hint?: boolean } = {}
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={name !== "aiCredit" || aiEnabled} className={labelClassName}>
            {t(`add.field.${name}`)}
          </FormLabel>
          <FormControl>
            <Input {...field} {...props} disabled={options.disabled} />
          </FormControl>
          {options.hint && (
            <FormDescription className="text-xs text-mini">{t(`add.hint.${name}`)}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] gap-5 overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-normal">{t("add.title")}</DialogTitle>
          <DialogDescription className="text-mini">{t("add.subtitle")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-hover text-mini">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="size-full object-cover" />
                ) : (
                  <User className="size-6" />
                )}
              </div>
              <div>
                <FilePicker
                  accept="image/png,image/jpeg"
                  onFiles={handleAvatar}
                  className="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium text-normal shadow-xs hover:bg-hover"
                >
                  {t("add.avatar.upload")}
                </FilePicker>
                <p className="mt-2 text-xs text-mini">{t("add.avatar.hint")}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {renderInput("firstName", { autoComplete: "off" })}
              {renderInput("lastName", { autoComplete: "off" })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {renderInput("username", { placeholder: t("add.placeholder.username"), autoComplete: "off" })}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required className={labelClassName}>
                      {t("add.field.role")}
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full" onBlur={field.onBlur}>
                          <SelectValue placeholder={t("add.placeholder.role")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ADMIN_CREATABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(`role.${role}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {renderInput("password", { type: "password", autoComplete: "new-password" })}
              {renderInput("confirmPassword", { type: "password", autoComplete: "new-password" })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {renderInput("email", { type: "email", placeholder: t("add.placeholder.email"), autoComplete: "off" })}
              {renderInput("phone", { type: "tel", placeholder: t("add.placeholder.phone"), autoComplete: "off" })}
            </div>

            {/* สวิตช์ AI อยู่แถวเดียวกับเครดิต ปิด AI แล้วไม่ต้องกรอกเครดิต */}
            <div className="grid items-start gap-4 border-t pt-4 sm:grid-cols-2">
              <SwitchField
                className="sm:pt-5"
                label={t("add.ai.label")}
                description={t("add.ai.description")}
                checked={aiEnabled}
                onCheckedChange={(checked) =>
                  form.setValue("aiEnabled", checked, { shouldValidate: true })
                }
              />

              {renderInput(
                "aiCredit",
                { inputMode: "decimal", placeholder: t("add.placeholder.aiCredit"), autoComplete: "off" },
                { disabled: !aiEnabled, hint: true }
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={createAdmin.isPending}
                onClick={() => onOpenChange(false)}
              >
                {t("add.cancel")}
              </Button>
              <Button type="submit" disabled={createAdmin.isPending}>
                {createAdmin.isPending && <Loader2 className="size-4 animate-spin" />}
                {t("add.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
