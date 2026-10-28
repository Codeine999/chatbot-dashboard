import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ExternalLink,
  Info,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CHANNEL_SECRET_LENGTH,
  type LineCredentialsForm,
} from "../schema/lineCredentials.schema";
import type { LineChannelState } from "../type";
import { maskSecret } from "../utils/connectionView";
import { CredentialField } from "./CredentialField";
import { SecretInput } from "./SecretInput";

const LINE_DEVELOPERS_URL = "https://developers.line.biz/console/";

type Props = {
  form: UseFormReturn<LineCredentialsForm>;
  state: LineChannelState | undefined;
  /** ค่าถูกเก็บในระบบแล้ว แสดงแบบอ่านอย่างเดียวจนกว่าจะกดแก้ไข */
  locked: boolean;
  canCancel: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onReset: () => void;
};

const Header = () => {
  const { t } = useTranslation("settings");

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
          <MessageCircle className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-normal">
            {t("connection.line.title")}
          </h2>
          <p className="mt-0.5 text-sm text-mini">{t("connection.line.subtitle")}</p>
        </div>
      </div>

      <Button type="button" variant="outline" className="rounded-full" asChild>
        <a href={LINE_DEVELOPERS_URL} target="_blank" rel="noreferrer">
          {t("connection.line.openConsole")}
          <ExternalLink />
        </a>
      </Button>
    </div>
  );
};

/** ค่าที่บันทึกแล้ว ไม่แสดงค่าจริง เห็นแค่ 4 ตัวท้าย */
const LockedFields = ({ state }: { state: LineChannelState | undefined }) => {
  const { t } = useTranslation("settings");
  const rows = [
    { label: t("connection.line.channelId"), value: state?.channelId ?? "—" },
    {
      label: t("connection.line.channelSecret"),
      value: maskSecret(state?.secretLast4 ?? null),
    },
    {
      label: t("connection.line.accessToken"),
      value: maskSecret(state?.accessTokenLast4 ?? null),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="mb-1.5 text-sm font-medium text-normal">{row.label}</p>
          <div className="relative">
            <Input
              readOnly
              disabled
              value={row.value}
              aria-label={row.label}
              className="!h-11 rounded-xl pr-11 font-mono"
            />
            <LockKeyhole className="absolute inset-y-0 right-3.5 my-auto size-4 text-mini" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EditableFields = ({ form }: { form: UseFormReturn<LineCredentialsForm> }) => {
  const { t } = useTranslation("settings");

  return (
    <div className="flex flex-col gap-5">
      <FormField
        control={form.control}
        name="channelId"
        render={({ field, fieldState }) => (
          <CredentialField
            label={t("connection.line.channelId")}
            hint={t("connection.line.channelIdHint")}
          >
            <Input
              {...field}
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              placeholder={t("connection.line.channelIdPlaceholder")}
              className="!h-11 rounded-xl"
            />
          </CredentialField>
        )}
      />

      <FormField
        control={form.control}
        name="channelSecret"
        render={({ field, fieldState }) => (
          <CredentialField
            label={t("connection.line.channelSecret")}
            badge={
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-icons">
                {t("connection.line.recommended")}
              </span>
            }
            hint={t("connection.line.channelSecretHint")}
            counter={`${field.value.trim().length}/${CHANNEL_SECRET_LENGTH}`}
          >
            <SecretInput
              name={field.name}
              value={field.value}
              invalid={fieldState.invalid}
              placeholder={t("connection.line.channelSecretPlaceholder")}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </CredentialField>
        )}
      />

      <FormField
        control={form.control}
        name="channelAccessToken"
        render={({ field, fieldState }) => (
          <CredentialField
            label={t("connection.line.accessToken")}
            hint={t("connection.line.accessTokenHint")}
          >
            <SecretInput
              name={field.name}
              value={field.value}
              invalid={fieldState.invalid}
              placeholder={t("connection.line.accessTokenPlaceholder")}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </CredentialField>
        )}
      />
    </div>
  );
};

export const LineCredentialsCard = ({
  form,
  state,
  locked,
  canCancel,
  canSubmit,
  isSaving,
  onSubmit,
  onEdit,
  onCancel,
  onReset,
}: Props) => {
  const { t } = useTranslation("settings");
  const reduceMotion = useReducedMotion();
  const usesServerEnv = state?.source === "env" && !locked;

  return (
    <Card className="p-6">
      <Header />

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
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              {t("connection.line.envNote")}
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

          <div className="flex items-center gap-2 rounded-xl bg-hover px-4 py-3 text-xs text-mini">
            <ShieldCheck className="size-4 shrink-0" />
            {t(locked ? "connection.line.lockedNote" : "connection.line.encryptedNote")}
          </div>

          <div className="flex items-center gap-4">
            {locked ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onEdit}
                className="rounded-xl"
              >
                <Pencil />
                {t("connection.line.edit")}
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!canSubmit}
                  className="rounded-xl shadow-md shadow-primary/30"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Plug />}
                  {t(isSaving ? "connection.line.testing" : "connection.line.submit")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  onClick={canCancel ? onCancel : onReset}
                >
                  {t(canCancel ? "connection.line.cancel" : "connection.line.reset")}
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
};
