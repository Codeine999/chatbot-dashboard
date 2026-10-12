import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_NAME_MAX, SKILL_PROMPT_MAX, SKILLS_MAX } from "../constants";
import type { AiSkill } from "../type";

type Props = {
  skills: AiSkill[];
  onChange: (next: AiSkill[]) => void;
};

export const SkillsEditor = ({ skills, onChange }: Props) => {
  const { t } = useTranslation("settings");

  const update = (index: number, patch: Partial<AiSkill>) =>
    onChange(
      skills.map((skill, position) =>
        position === index ? { ...skill, ...patch } : skill
      )
    );

  const remove = (index: number) =>
    onChange(skills.filter((_, position) => position !== index));

  const add = () => onChange([...skills, { name: "", prompt: "" }]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {skills.map((skill, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl border bg-card p-3"
        >
          <div className="flex items-center gap-2">
            <Input
              value={skill.name}
              maxLength={SKILL_NAME_MAX}
              onChange={(event) => update(index, { name: event.target.value })}
              placeholder={t("aiSetting.skills.namePlaceholder")}
              className="h-9"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={t("aiSetting.skills.remove")}
              className="shrink-0 rounded-md p-2 text-mini transition hover:bg-hover hover:text-red-500"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <Textarea
            value={skill.prompt}
            maxLength={SKILL_PROMPT_MAX}
            onChange={(event) => update(index, { prompt: event.target.value })}
            placeholder={t("aiSetting.skills.promptPlaceholder")}
            className="min-h-20 resize-none text-sm"
          />
        </div>
      ))}

      {skills.length < SKILLS_MAX && (
        <button
          type="button"
          onClick={add}
          className="flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 text-primary transition hover:bg-primary/5"
        >
          <Plus className="size-5" />
          <span className="text-sm font-medium">{t("aiSetting.skills.add")}</span>
        </button>
      )}
    </div>
  );
};
