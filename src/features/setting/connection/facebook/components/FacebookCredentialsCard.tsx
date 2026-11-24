import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Info,
  Loader2,
  LockKeyhole,
  Pencil,
  Plug,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CredentialField } from "../../components/CredentialField";
import { SecretInput } from "../../components/SecretInput";
import { maskSecret } from "../../utils/connectionView";
import {
  APP_SECRET_LENGTH,
  type FacebookCredentialsForm,
} from "../schema/facebookCredentials.schema";
import type { FacebookChannelState } from "../type";

const META_DEVELOPERS_URL = "https://developers.facebook.com/apps/";

type Props = {
  form: UseFormReturn<FacebookCredentialsForm>;
  state: FacebookChannelState | undefined;
  /** ค่าถูกเก็บในระบบแล้ว แสดงแบบอ่านอย่างเดียวจนกว่าจะกดแก้ไข */
  locked: boolean;
  canCancel: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  isDisconnecting: boolean;
  onSubmit: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onReset: () => void;
  onDisconnect: () => void;
};

const LockedFields = ({ state }: { state: FacebookChannelState | undefined }) => {
  const { t } = useTranslation("settings");
  const rows = [
    { label: t("connection.facebook.page"), value: state?.pageName ?? state?.pageId ?? "—" },
    {
      label: t("connection.facebook.appSecret"),
      value: maskSecret(state?.appSecretLast4 ?? null),
    },
    {
      label: t("connection.facebook.pageAccessToken"),
      value: maskSecret(state?.pageAccessTokenLast4 ?? null),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="mb-2 text-sm font-medium text-foreground">{row.label}</p>
          <div className="relative">
            <Input
              readOnly
              disabled
              value={row.value}
              aria-label={row.label}
              className="!h-[42px] rounded-[10px] pr-11 font-mono"
            />
            <LockKeyhole className="absolute inset-y-0 right-3.5 my-auto size-4 text-mini" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EditableFields = ({ form }: { form: UseFormReturn<FacebookCredentialsForm> }) => {
  const { t } = useTranslation("settings");

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={form.control}
        name="appSecret"
        render={({ field, fieldState }) => (
          <CredentialField
            label={t("connection.facebook.appSecret")}
            hint={t("connection.facebook.appSecretHint")}
            counter={`${field.value.trim().length}/${APP_SECRET_LENGTH}`}
          >
            <SecretInput
              name={field.name}
              value={field.value}
              invalid={fieldState.invalid}
              placeholder={t("connection.facebook.appSecretPlaceholder")}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </CredentialField>
        )}
      />

      <FormField
        control={form.control}
        name="pageAccessToken"
        render={({ field, fieldState }) => (
          <CredentialField
            label={t("connection.facebook.pageAccessToken")}
            hint={t("connection.facebook.pageAccessTokenHint")}
          >
            <SecretInput
              name={field.name}
              value={field.value}
              invalid={fieldState.invalid}
              placeholder={t("connection.facebook.pageAccessTokenPlaceholder")}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </CredentialField>
        )}
      />
    </div>
  );
};

export const FacebookCredentialsCard = ({
  form,
  state,
  locked,
  canCancel,
  canSubmit,
  isSaving,
  isDisconnecting,
  onSubmit,
  onEdit,
  onCancel,
  onReset,
  onDisconnect,
}: Props) => {
  const { t } = useTranslation("settings");
  const reduceMotion = useReducedMotion();
  const usesServerEnv = state?.source === "env" && !locked;

  return (
    <Card variant="flat" className="border-t py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">
            {t("connection.facebook.title")}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {t("connection.facebook.subtitle")}
          </p>
        </div>

        <Button type="button" variant="outline" className="h-[38px] rounded-[10px]" asChild>
          <a href={META_DEVELOPERS_URL} target="_blank" rel="noreferrer">
            {t("connection.facebook.openConsole")}
            <ExternalLink />
          </a>
        </Button>
      </div>

      <Form {...form}>
        <form
          noValidate
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            // ปุ่มแก้ไขเป็น type="button" ฟอร์มจึงถูก submit ได้เฉพาะตอนกำลังแก้ไข
            if (!locked) onSubmit();
          }}
        >
          {usesServerEnv && (
            <div className="flex items-start gap-2 rounded-xl border border-0 bg-muted px-4 py-2.5 text-[13px] text-normal">
              <Info className="mt-0.5 size-4 shrink-0" />
              {t("connection.facebook.envNote")}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={locked ? "locked" : "editing"}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {locked ? <LockedFields state={state} /> : <EditableFields form={form} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" />
            {t(locked ? "connection.facebook.lockedNote" : "connection.facebook.encryptedNote")}
          </div>

          <div className="flex items-center gap-4">
            {locked ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onEdit}
                  disabled={isDisconnecting}
                  className="h-[38px] rounded-[10px]"
                >
                  <Pencil />
                  {t("connection.facebook.edit")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onDisconnect}
                  disabled={isDisconnecting}
                  className="h-[38px] rounded-[10px] text-red-600 hover:text-red-600"
                >
                  {isDisconnecting ? <Loader2 className="animate-spin" /> : <Unplug />}
                  {t("connection.facebook.disconnect")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-[38px] rounded-[10px] bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Plug />}
                  {t(isSaving ? "connection.facebook.testing" : "connection.facebook.submit")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  onClick={canCancel ? onCancel : onReset}
                >
                  {t(canCancel ? "connection.facebook.cancel" : "connection.facebook.reset")}
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
};
