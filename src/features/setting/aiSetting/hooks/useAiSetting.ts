import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { getApiErrorMessage } from "@/api/api";
import { aiSettingApi } from "../services/aiSetting.service";
import type {
  AiResponseStyle,
  AiSettingForm,
  AiSettingPayload,
  AiSettingRecord,
  AiSkill,
} from "../type";
import { AI_EMOJI_LEVELS, AI_TARGET_LENGTHS } from "../constants";

export const aiSettingKeys = {
  list: ["ai-setting", "list"] as const,
};

const DEFAULT_RESPONSE_STYLE: AiResponseStyle = { targetLength: "adaptive", emojiLevel: "light" };

const toSkills = (value: unknown): AiSkill[] =>
  Array.isArray(value)
    ? value.flatMap((item) =>
        item && typeof item.name === "string" && typeof item.prompt === "string"
          ? [{ name: item.name, prompt: item.prompt }]
          : []
      )
    : [];

const toResponseStyle = (value: unknown): AiResponseStyle => {
  const style = value as Partial<AiResponseStyle> | null;
  return style &&
    AI_TARGET_LENGTHS.includes(style.targetLength as never) &&
    AI_EMOJI_LEVELS.includes(style.emojiLevel as never)
    ? (style as AiResponseStyle)
    : DEFAULT_RESPONSE_STYLE;
};

/** รายการที่บอทใช้จริง: active ล่าสุด (backend เรียง updatedAt ใหม่ก่อน) */
export const pickActiveSetting = (records: AiSettingRecord[]) =>
  records.find((record) => record.active);

export const recordToForm = (record?: AiSettingRecord): AiSettingForm => ({
  ownerPrompt: record?.ownerPrompt ?? "",
  tone: record?.tone ?? "",
  skills: toSkills(record?.skills),
  responseStyle: toResponseStyle(record?.responseStyle),
  fallbackMessage: record?.fallbackMessage ?? "",
});

const formToPayload = (form: AiSettingForm): AiSettingPayload => ({
  ownerPrompt: form.ownerPrompt.trim() || null,
  tone: form.tone.trim() || null,
  skills: form.skills.map((skill) => ({ name: skill.name.trim(), prompt: skill.prompt.trim() })),
  responseStyle: form.responseStyle,
  fallbackMessage: form.fallbackMessage.trim() || null,
});

export function useAiSettings() {
  return useQuery({ queryKey: aiSettingKeys.list, queryFn: aiSettingApi.list });
}

/** มีรายการ active อยู่แล้วแก้ด้วย PATCH ไม่มีก็สร้างใหม่ด้วย POST */
export function useSaveAiSetting(current?: AiSettingRecord) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: AiSettingForm) =>
      current
        ? aiSettingApi.update(current.id, formToPayload(form))
        : aiSettingApi.create(formToPayload(form)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiSettingKeys.list });
      toast.success(i18n.t("settings:aiSetting.saved"));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, i18n.t("settings:aiSetting.saveError")));
    },
  });
}
