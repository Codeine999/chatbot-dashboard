import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { DotBadge } from "@/components/common/DotBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ConfigSection } from "./ConfigSection";
import { SKILL_NAME_MAX, SKILL_PROMPT_MAX, SKILLS_MAX } from "../constants";
import type { AiSkill } from "../type";

type Props = {
  skills: AiSkill[];
  onChange: (next: AiSkill[]) => void;
};

const isComplete = (skill: AiSkill) => Boolean(skill.name.trim() && skill.prompt.trim());

/** รายการ skill แบบพับได้ เปิดแก้ทีละตัวเพื่อให้เห็นภาพรวมทุก skill ในหน้าเดียว */
export const SkillsEditor = ({ skills, onChange }: Props) => {
  const { t } = useTranslation("settings");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const update = (index: number, patch: Partial<AiSkill>) =>
    onChange(skills.map((skill, position) => (position === index ? { ...skill, ...patch } : skill)));

  const remove = (index: number) => {
    onChange(skills.filter((_, position) => position !== index));
    // ตำแหน่งหลังตัวที่ลบเลื่อนขึ้นหนึ่งช่อง
    setOpenIndex((open) => (open === null || open === index ? null : open > index ? open - 1 : open));
  };

  const add = () => {
    onChange([...skills, { name: "", prompt: "" }]);
    setOpenIndex(skills.length);
  };

  const toggle = (index: number) => setOpenIndex((open) => (open === index ? null : index));

  return (
    <ConfigSection
      icon={Sparkles}
      title={t("aiSetting.sections.skills.title")}
      subtitle={t("aiSetting.sections.skills.subtitle")}
      aside={
        <span className="rounded-md bg-hover px-2 py-0.5 text-xs font-medium text-mini">
          {t("aiSetting.skills.count", { count: skills.length, max: SKILLS_MAX })}
        </span>
      }
    >
      {skills.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wand2 className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-normal">{t("aiSetting.skills.empty")}</p>
          <p className="mt-1 max-w-sm text-xs text-mini">{t("aiSetting.skills.emptyHint")}</p>
          <button
            type="button"
            onClick={add}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/15"
          >
            <Plus className="size-4" />
            {t("aiSetting.skills.add")}
          </button>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-mini">{t("aiSetting.skills.alwaysHint")}</p>

          <ul className="flex flex-col gap-2">
            {skills.map((skill, index) => {
              const open = openIndex === index;
              const complete = isComplete(skill);
              const panelId = `ai-skill-panel-${index}`;
              const name = skill.name.trim();

              return (
                <li
                  key={index}
                  className={cn(
                    "rounded-xl border bg-card/60 transition-colors",
                    open && "border-primary/40 bg-card",
                    !complete && !open && "border-amber-300 dark:border-amber-500/40"
                  )}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-hover text-xs font-semibold text-mini"
                      aria-hidden
                    >
                      {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggle(index)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex min-w-0 flex-1 cursor-pointer flex-col items-start rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <span className="flex w-full items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            name ? "text-normal" : "italic text-mini"
                          )}
                        >
                          {name || t("aiSetting.skills.untitled")}
                        </span>
                        <DotBadge tone="neutral" className="hidden sm:inline-flex">
                          {t("aiSetting.skills.always")}
                        </DotBadge>
                      </span>
                      {!open && (
                        <span className="mt-0.5 w-full truncate text-xs text-mini">
                          {skill.prompt.trim() || t("aiSetting.skills.emptyPrompt")}
                        </span>
                      )}
                    </button>

                    {!complete && !open && (
                      <DotBadge tone="warning" className="hidden md:inline-flex">
                        {t("aiSetting.skills.incomplete")}
                      </DotBadge>
                    )}

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={t("aiSetting.skills.remove")}
                      className="shrink-0 rounded-md p-1.5 text-mini transition hover:bg-hover hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <ChevronDown
                      aria-hidden
                      onClick={() => toggle(index)}
                      className={cn(
                        "size-4 shrink-0 cursor-pointer text-mini transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </div>

                  {open && (
                    <div id={panelId} className="flex flex-col gap-2 border-t px-3 py-3">
                      <Input
                        value={skill.name}
                        maxLength={SKILL_NAME_MAX}
                        autoFocus={!skill.name}
                        aria-label={t("aiSetting.skills.namePlaceholder")}
                        aria-invalid={!name || undefined}
                        onChange={(event) => update(index, { name: event.target.value })}
                        placeholder={t("aiSetting.skills.namePlaceholder")}
                        className="h-9"
                      />
                      <Textarea
                        value={skill.prompt}
                        maxLength={SKILL_PROMPT_MAX}
                        aria-label={t("aiSetting.skills.promptPlaceholder")}
                        aria-invalid={!skill.prompt.trim() || undefined}
                        onChange={(event) => update(index, { prompt: event.target.value })}
                        placeholder={t("aiSetting.skills.promptPlaceholder")}
                        className="min-h-24 resize-none text-sm"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {skills.length < SKILLS_MAX && (
            <button
              type="button"
              onClick={add}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              <Plus className="size-4" />
              {t("aiSetting.skills.add")}
            </button>
          )}
        </>
      )}
    </ConfigSection>
  );
};
