import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  UNANSWERED_QUESTIONS_LIMIT,
  UNANSWERED_QUESTIONS_MOCK,
  type UnansweredQuestion,
} from "../mock/unansweredQuestions.mock";

type Props = {
  items?: UnansweredQuestion[];
};

/** คำถามที่ AI ตอบไม่ได้ กดเพิ่มเป็นความรู้ให้ AI ใช้ตอบได้ในครั้งถัดไป ไม่มีข้อมูลจริงจะใช้ข้อมูลตัวอย่าง */
const UnansweredQuestionsCard = ({ items }: Props) => {
  const { t } = useTranslation("home");
  const list = (items?.length ? items : UNANSWERED_QUESTIONS_MOCK).slice(0, UNANSWERED_QUESTIONS_LIMIT);

  return (
    <section className="min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{t("unanswered.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("unanswered.subtitle")}</p>
        </div>
        <Link
          to="/ai-answer"
          className="shrink-0 text-sm font-medium text-foreground underline underline-offset-4"
        >
          {t("unanswered.library")}
        </Link>
      </div>

      <ul className="mt-5 divide-y border-t">
        {list.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                ?
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] text-foreground">{item.question}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.meta}</p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0 rounded-full px-4">
              <Plus className="size-4" />
              {t("unanswered.add")}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UnansweredQuestionsCard;
