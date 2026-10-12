import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Boxes, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelect, ChipEditor, Field } from "./KnowledgeFormControls";
import {
  DEFAULT_MICRO_KNOWLEDGE_LANGUAGE,
  hasMicroKnowledgeChanges,
} from "../services/microKnowledge.service";
import type { SysCategory } from "../type/knowledge.type";
import type {
  MicroKnowledgeDraft,
  MicroKnowledgeItem,
} from "../type/microKnowledge.type";

// ตรงกับ limit ของ DTO ฝั่ง backend
const DESCRIPTION_MAX = 20_000;
const ANSWER_MAX = 50_000;
const LANGUAGES = ["th", "en"];

const emptyDraft: MicroKnowledgeDraft = {
  title: "",
  description: "",
  category: "",
  intentKey: "",
  entityKey: "",
  topicKey: "",
  keywords: [],
  questionExamples: [],
  answer: "",
  language: DEFAULT_MICRO_KNOWLEDGE_LANGUAGE,
  priority: 0,
  active: true,
};

const toDraft = (item: MicroKnowledgeItem): MicroKnowledgeDraft => ({
  title: item.title,
  description: item.description,
  category: item.category,
  intentKey: item.intentKey,
  entityKey: item.entityKey,
  topicKey: item.topicKey,
  keywords: [...item.keywords],
  questionExamples: [...item.questionExamples],
  answer: item.answer,
  language: item.language,
  priority: item.priority,
  active: item.active,
});

type Props = {
  item?: MicroKnowledgeItem;
  categories: SysCategory[];
  isSaving: boolean;
  onClose: () => void;
  onPublish: (draft: MicroKnowledgeDraft) => void;
};

const MicroKnowledgeEditPanel = ({
  item,
  categories,
  isSaving,
  onClose,
  onPublish,
}: Props) => {
  const { t } = useTranslation("knowledge");
  const [draft, setDraft] = useState<MicroKnowledgeDraft>(emptyDraft);

  // โหลดค่าใหม่ทุกครั้งที่สลับ entry ที่เลือก
  useEffect(() => {
    setDraft(item ? toDraft(item) : emptyDraft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const set = <K extends keyof MicroKnowledgeDraft>(
    key: K,
    value: MicroKnowledgeDraft[K]
  ) => setDraft((current) => ({ ...current, [key]: value }));

  // backend บังคับแค่ title กับ answer ที่เหลือเป็น nullable
  const isValid = Boolean(
    draft.title.trim() &&
      draft.answer.trim() &&
      draft.priority >= 0 &&
      draft.priority <= 100
  );
  const canPublish = isValid && (!item || hasMicroKnowledgeChanges(item, draft));

  return (
    <aside className="absolute inset-0 flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b bg-card p-4">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-icons" />
          <div>
            <p className="text-sm font-semibold text-normal">
              {item ? t("micro.panel.editTitle") : t("micro.panel.newTitle")}
            </p>
            {item && <p className="text-xs text-mini">ID: {item.id}</p>}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("panel.close")}>
          <X className="h-4 w-4 text-mini" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 touch-pan-y space-y-4 overflow-y-auto overscroll-contain p-4">
        <p className="text-xs font-semibold text-normal">{t("panel.basicInfo")}</p>

        <Field label={t("panel.title")} required>
          <Input
            value={draft.title}
            maxLength={255}
            onChange={(event) => set("title", event.target.value)}
            placeholder={t("micro.panel.titlePlaceholder")}
          />
        </Field>

        <Field label={t("panel.description")}>
          <Textarea
            value={draft.description}
            maxLength={DESCRIPTION_MAX}
            onChange={(event) => set("description", event.target.value)}
            className="min-h-20 resize-none"
            placeholder={t("panel.descriptionPlaceholder")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("panel.category")}>
            <CategorySelect
              value={draft.category}
              categories={categories}
              onChange={(value) => set("category", value)}
            />
          </Field>

          <Field label={t("panel.intentKey")}>
            <Input
              value={draft.intentKey}
              maxLength={100}
              onChange={(event) => set("intentKey", event.target.value)}
              placeholder="member.register"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("micro.panel.entityKey")}>
            <Input
              value={draft.entityKey}
              maxLength={50}
              onChange={(event) => set("entityKey", event.target.value)}
              placeholder="product_a"
            />
            <p className="mt-1 text-[11px] text-mini">{t("micro.panel.entityKeyHint")}</p>
          </Field>

          <Field label={t("micro.panel.topicKey")}>
            <Input
              value={draft.topicKey}
              maxLength={50}
              onChange={(event) => set("topicKey", event.target.value)}
              placeholder="price"
            />
            <p className="mt-1 text-[11px] text-mini">{t("micro.panel.topicKeyHint")}</p>
          </Field>
        </div>

        <Field label={t("panel.keywords")}>
          <ChipEditor
            values={draft.keywords}
            addLabel={t("panel.addKeyword")}
            onChange={(next) => set("keywords", next)}
          />
        </Field>

        <Field label={t("panel.examples")}>
          <ChipEditor
            values={draft.questionExamples}
            addLabel={t("panel.addQuestion")}
            onChange={(next) => set("questionExamples", next)}
          />
        </Field>

        <Field label={t("panel.answer")} required>
          <Textarea
            value={draft.answer}
            maxLength={ANSWER_MAX}
            onChange={(event) => set("answer", event.target.value)}
            className="min-h-32 resize-none"
            placeholder={t("micro.panel.answerPlaceholder")}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label={t("micro.panel.language")}>
            <Select
              value={draft.language}
              onValueChange={(value) => set("language", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* ค่าของ API ไม่แปล แสดงตามที่ backend เก็บ */}
                {LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t("panel.priority")}>
            <Input
              type="number"
              min={0}
              max={100}
              value={draft.priority}
              onChange={(event) => set("priority", Number(event.target.value))}
            />
          </Field>

          <Field label={t("panel.status")}>
            <button
              type="button"
              onClick={() => set("active", !draft.active)}
              className="flex h-9 items-center gap-2"
            >
              <span
                className={`relative h-5 w-9 rounded-full transition ${
                  draft.active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                    draft.active ? "left-4.5" : "left-0.5"
                  }`}
                />
              </span>
              <span className="text-sm text-normal">
                {draft.active ? t("panel.active") : t("panel.inactive")}
              </span>
            </button>
          </Field>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-card p-4">
        <Button variant="ghost" className="border" onClick={onClose}>
          {t("panel.cancel")}
        </Button>
        <Button disabled={!canPublish || isSaving} onClick={() => onPublish(draft)}>
          {isSaving ? t("panel.publishing") : t("panel.publish")}
        </Button>
      </div>
    </aside>
  );
};

export default MicroKnowledgeEditPanel;
