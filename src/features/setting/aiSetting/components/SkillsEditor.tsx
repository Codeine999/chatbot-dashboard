import { useTranslation } from "react-i18next";
import { GripVertical, Plus, Trash2 } from "lucide-react";
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
    <div className="overflow-hidden rounded-xl border">
      {skills.map((skill, index) => (
        <div key={index} className="flex items-start gap-3 border-b p-4">
          <GripVertical className="mt-0.5 size-4 shrink-0 text-[#c4c4c4]" />
          <div className="min-w-0 flex-1">
            <input
              value={skill.name}
              maxLength={SKILL_NAME_MAX}
              onChange={(event) => update(index, { name: event.target.value })}
              placeholder={t("aiSetting.skills.namePlaceholder")}
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
            />
            <Textarea
              value={skill.prompt}
              maxLength={SKILL_PROMPT_MAX}
              onChange={(event) => update(index, { prompt: event.target.value })}
              placeholder={t("aiSetting.skills.promptPlaceholder")}
              rows={2}
              className="field-sizing-fixed mt-1.5 min-h-0 resize-none border-0 bg-transparent p-0 text-[13px] leading-relaxed text-normal shadow-none focus-visible:ring-0"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={t("aiSetting.skills.remove")}
            className="flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      {skills.length < SKILLS_MAX && (
        <button
          type="button"
          onClick={add}
          className="flex h-12 w-full cursor-pointer items-center gap-2 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Plus className="size-4" />
          {t("aiSetting.skills.add")}
        </button>
      )}
    </div>
  );
};
