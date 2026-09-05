import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateKnowledgeCategory,
  useRetrievalTest,
} from "../hooks/useKnowledge";
import { hasAnswerPatternChanges } from "../services/knowledge.service";
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

/** แถวของ chip ที่เพิ่ม/ลบได้ ใช้ทั้ง keywords และ example questions */
const ChipEditor = ({
  values,
  addLabel,
  onChange,
}: {
  values: string[];
  addLabel: string;
  onChange: (next: string[]) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  const commit = () => {
    const value = text.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setText("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border p-2">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-md bg-hover px-2 py-1 text-xs text-normal"
        >
          {value}
          <button
            type="button"
            onClick={() => onChange(values.filter((item) => item !== value))}
            aria-label={`Remove ${value}`}
            className="text-mini transition hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              setText("");
              setAdding(false);
            }
          }}
          className="w-28 bg-transparent px-1 text-xs text-normal outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-icons transition hover:bg-hover"
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
      )}
    </div>
  );
};

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <p className="mb-1.5 text-xs font-medium text-normal">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </p>
    {children}
  </div>
);

const CategorySelect = ({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: SysCategory[];
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const createCategory = useCreateKnowledgeCategory();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAdding(false);
      setName("");
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existing = categories.find(
      (category) => category.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase()
    );
    if (existing) {
      onChange(existing.name);
      handleOpenChange(false);
      return;
    }

    try {
      const created = await createCategory.mutateAsync(trimmedName);
      onChange(created.name);
      handleOpenChange(false);
    } catch {
      // The mutation displays the API error and keeps the input open for retry.
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm text-normal shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className={value ? "truncate" : "truncate text-mini"}>
            {value || "เลือกหมวด"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-mini" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-1"
      >
        <div className="max-h-64 overflow-y-auto py-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onChange(category.name);
                handleOpenChange(false);
              }}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm text-normal outline-none transition hover:bg-accent"
            >
              <span className="truncate">{category.name}</span>
              {category.name === value && <Check className="size-4 shrink-0" />}
            </button>
          ))}
        </div>

        <div className="border-t p-1 pt-2">
          {adding ? (
            <div className="space-y-2">
              <Input
                autoFocus
                value={name}
                maxLength={100}
                placeholder="ชื่อหมวดหมู่ใหม่"
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSave();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setAdding(false);
                    setName("");
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={!name.trim() || createCategory.isPending}
                onClick={() => void handleSave()}
              >
                {createCategory.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm font-medium text-icons outline-none transition hover:bg-accent"
            >
              <Plus className="size-4" />
              Add more
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
              {item ? "Edit Knowledge Entry" : "New Knowledge Entry"}
            </p>
            {item && <p className="text-xs text-mini">ID: {item.id}</p>}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <X className="h-4 w-4 text-mini" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 touch-pan-y space-y-4 overflow-y-auto overscroll-contain p-4">
        <p className="text-xs font-semibold text-normal">Basic Information</p>

        <Field label="Title" required>
          <Input
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="ชื่อหัวข้อความรู้"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={draft.description}
            maxLength={DESCRIPTION_MAX}
            onChange={(event) => set("description", event.target.value)}
            className="min-h-20 resize-none"
            placeholder="อธิบายสั้น ๆ ว่า entry นี้ใช้ตอบเรื่องอะไร"
          />
          <p className="mt-1 text-right text-[11px] text-mini">
            {draft.description.length}/{DESCRIPTION_MAX}
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" required>
            <CategorySelect
              value={draft.category}
              categories={categories}
              onChange={(value) => set("category", value)}
            />
          </Field>

          <Field label="Intent Key" required>
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
                    aria-label="วิธีตั้งค่า Intent Key"
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
                  <p className="font-semibold">Intent Key คืออะไร?</p>
                  <p className="mt-1 leading-relaxed opacity-80">
                    ใช้ระบุเจตนาของคำถามในรูปแบบหมวดหมู่เพื่อบอกให้ Ai ตอบกลับได้ถูกข้อความ <br/> เช่น
                    <span className="ml-1 font-mono font-semibold"> member_register</span>
                  </p>
                  <p className="mt-1.5 leading-relaxed opacity-80">
                    ควรใช้ตัวพิมพ์เล็ก ไม่มีเว้นวรรค และไม่ซ้ำกับรายการอื่น 
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Field>
        </div>

        <Field label="Keywords">
          <ChipEditor
            values={draft.keywords}
            addLabel="Add keyword"
            onChange={(next) => set("keywords", next)}
          />
        </Field>

        <Field label="Example Questions">
          <ChipEditor
            values={draft.questionExamples}
            addLabel="Add question"
            onChange={(next) => set("questionExamples", next)}
          />
        </Field>

        <Field label="Final Answer (shown to AI)">
          <Textarea
            value={draft.answer}
            maxLength={ANSWER_MAX}
            onChange={(event) => set("answer", event.target.value)}
            className="min-h-32 resize-none"
            placeholder="คำตอบที่ AI จะใช้ตอบลูกค้า"
          />
          <p className="mt-1 text-right text-[11px] text-mini">
            {draft.answer.length}/{ANSWER_MAX}
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <Input
              type="number"
              min={0}
              max={100}
              value={draft.priority}
              onChange={(event) => set("priority", Number(event.target.value))}
            />
          </Field>

          <Field label="Status">
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
                {draft.active ? "Active" : "Inactive"}
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
              Retrieval Preview (Test)
            </span>
            <ChevronUp
              className={`h-4 w-4 text-mini transition ${showPreview ? "" : "rotate-180"}`}
            />
          </button>

          {showPreview && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-mini">Test with a sample question</p>
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && question.trim()) {
                      retrieval.mutate(question.trim());
                    }
                  }}
                  placeholder="อยากสมัครสมาชิกต้องทำยังไงคะ?"
                  className="text-xs"
                />
                <Button
                  onClick={() => question.trim() && retrieval.mutate(question.trim())}
                  disabled={!question.trim() || retrieval.isPending}
                >
                  Test
                </Button>
              </div>

              {retrieval.isPending && (
                <p className="mt-3 text-xs text-mini">กำลังค้นหา...</p>
              )}

              {retrieval.isSuccess && !topMatch && (
                <p className="mt-3 text-xs text-mini">ไม่พบ entry ที่ตรงกับคำถามนี้</p>
              )}

              {topMatch && (
                <div className="mt-3 rounded-lg border bg-hover p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      <Sparkles className="h-3 w-3" />
                      Top Match
                    </span>
                    <span className="text-xs font-semibold text-normal">
                      {topMatch.score}%
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-medium text-normal">
                    {topMatch.title} ({topMatch.id})
                  </p>
                  <p className="text-[11px] text-mini">
                    Intent: {topMatch.intentKey} · Priority: {topMatch.priority}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-card p-4">
        <Button variant="ghost" className="border" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!canPublish || isSaving}
          onClick={() => onPublish(draft)}
        >
          {isSaving ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </aside>
  );
};

export default KnowledgeEditPanel;
