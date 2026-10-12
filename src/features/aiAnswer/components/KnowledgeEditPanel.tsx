import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { BookOpen, ChevronUp, CircleAlert, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRetrievalTest } from "../hooks/useKnowledge";
import { hasAnswerPatternChanges } from "../services/knowledge.service";
import { CategorySelect, ChipEditor, Field } from "./KnowledgeFormControls";
import type {
  KnowledgeDraft,
  KnowledgeItem,
  SysCategory,
} from "../type/knowledge.type";

const DESCRIPTION_MAX = 500;
const ANSWER_MAX = 4000;

const emptyDraft: KnowledgeDraft = {
  title: "",
  description: "",
  category: "",
  intentKey: "",
  keywords: [],
  questionExamples: [],
  answer: "",
  priority: 50,
  active: true,
};

const toDraft = (item: KnowledgeItem): KnowledgeDraft => ({
  title: item.title,
  description: item.description,
  category: item.category,
  intentKey: item.intentKey,
  keywords: [...item.keywords],
  questionExamples: [...item.questionExamples],
  answer: item.answer,
  priority: item.priority,
  active: item.active,
});

type Props = {
  item?: KnowledgeItem;
  categories: SysCategory[];
  isSaving: boolean;
  onClose: () => void;
  onPublish: (draft: KnowledgeDraft) => void;
};

const KnowledgeEditPanel = ({
  item,
  categories,
  isSaving,
  onClose,
  onPublish,
}: Props) => {
  const { t } = useTranslation("knowledge");
  const [draft, setDraft] = useState<KnowledgeDraft>(emptyDraft);
  const [question, setQuestion] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const retrieval = useRetrievalTest();

  // โหลดค่าใหม่ทุกครั้งที่สลับ entry ที่เลือก
  useEffect(() => {
    setDraft(item ? toDraft(item) : emptyDraft);
    setQuestion("");
    retrieval.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const set = <K extends keyof KnowledgeDraft>(key: K, value: KnowledgeDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const isValid = Boolean(
    draft.title.trim() &&
      draft.category.trim() &&
      draft.intentKey.trim() &&
      draft.answer.trim() &&
      draft.priority >= 0 &&
      draft.priority <= 100
  );
  const canPublish = isValid && (!item || hasAnswerPatternChanges(item, draft));
  const topMatch = retrieval.data?.[0];

  return (
    <aside className="absolute inset-0 flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b bg-card p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-icons" />
          <div>
            <p className="text-sm font-semibold text-normal">
              {item ? t("panel.editTitle") : t("panel.newTitle")}
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
            onChange={(event) => set("title", event.target.value)}
            placeholder={t("panel.titlePlaceholder")}
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
          <p className="mt-1 text-right text-[11px] text-mini">
            {draft.description.length}/{DESCRIPTION_MAX}
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("panel.category")} required>
            <CategorySelect
              value={draft.category}
              categories={categories}
              onChange={(value) => set("category", value)}
            />
          </Field>

          <Field label={t("panel.intentKey")} required>
            <div className="relative">
              <Input
                value={draft.intentKey}
                onChange={(event) => set("intentKey", event.target.value)}
                placeholder="member.register"
                className="pr-10"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t("panel.intentKeyHelp")}
                    className="absolute right-2.5 -mt-13 flex size-6 
                    -translate-y-1/2 items-center justify-center rounded-md 
                    text-mini transition hover:bg-hover hover:text-icons cursor-pointer
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <CircleAlert className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="end"
                  sideOffset={10}
                  className="max-w-64 rounded-xl px-3.5 py-3 text-left shadow-xl"
                >
                  <p className="font-semibold">{t("panel.intentKeyTitle")}</p>
                  <p className="mt-1 leading-relaxed opacity-80">
                    {t("panel.intentKeyBody")}
                    <span className="ml-1 font-mono font-semibold">member_register</span>
                  </p>
                  <p className="mt-1.5 leading-relaxed opacity-80">
                    {t("panel.intentKeyRule")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
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

        <Field label={t("panel.answer")}>
          <Textarea
            value={draft.answer}
            maxLength={ANSWER_MAX}
            onChange={(event) => set("answer", event.target.value)}
            className="min-h-32 resize-none"
            placeholder={t("panel.answerPlaceholder")}
          />
          <p className="mt-1 text-right text-[11px] text-mini">
            {draft.answer.length}/{ANSWER_MAX}
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="rounded-xl border p-3">
          <button
            type="button"
            onClick={() => setShowPreview((value) => !value)}
            className="flex w-full items-center justify-between"
          >
            <span className="text-xs font-semibold text-normal">
              {t("panel.preview")}
            </span>
            <ChevronUp
              className={`h-4 w-4 text-mini transition ${showPreview ? "" : "rotate-180"}`}
            />
          </button>

          {showPreview && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-mini">{t("panel.previewHint")}</p>
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && question.trim()) {
                      retrieval.mutate(question.trim());
                    }
                  }}
                  placeholder={t("panel.previewPlaceholder")}
                  className="text-xs"
                />
                <Button
                  onClick={() => question.trim() && retrieval.mutate(question.trim())}
                  disabled={!question.trim() || retrieval.isPending}
                >
                  {t("panel.test")}
                </Button>
              </div>

              {retrieval.isPending && (
                <p className="mt-3 text-xs text-mini">{t("panel.searching")}</p>
              )}

              {retrieval.isSuccess && !topMatch && (
                <p className="mt-3 text-xs text-mini">{t("panel.noMatch")}</p>
              )}

              {topMatch && (
                <div className="mt-3 rounded-lg border bg-hover p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      <Sparkles className="h-3 w-3" />
                      {t("panel.topMatch")}
                    </span>
                    <span className="text-xs font-semibold text-normal">
                      {topMatch.score}%
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-medium text-normal">
                    {topMatch.title} ({topMatch.id})
                  </p>
                  <p className="text-[11px] text-mini">
                    {t("panel.matchMeta", {
                      intent: topMatch.intentKey,
                      priority: topMatch.priority,
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-card p-4">
        <Button variant="ghost" className="border" onClick={onClose}>
          {t("panel.cancel")}
        </Button>
        <Button
          disabled={!canPublish || isSaving}
          onClick={() => onPublish(draft)}
        >
          {isSaving ? t("panel.publishing") : t("panel.publish")}
        </Button>
      </div>
    </aside>
  );
};

export default KnowledgeEditPanel;
