import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { MOTION_SPRING } from "@/lib/motion";
import {
  UNANSWERED_QUESTIONS_LIMIT,
  UNANSWERED_QUESTIONS_MOCK,
  type UnansweredQuestion,
} from "../mock/unansweredQuestions.mock";

/** คำถามที่ AI ตอบไม่ได้ กดเพิ่มเป็นความรู้ให้ AI ใช้ตอบได้ในครั้งถัดไป (ตอนนี้แสดงข้อมูล mock ทั้งหมด) */
const UnansweredQuestionsCard = () => {
  const { t } = useTranslation("home");
  const prefersReduced = useReducedMotion();
  const list: UnansweredQuestion[] = UNANSWERED_QUESTIONS_MOCK.slice(
    0,
    UNANSWERED_QUESTIONS_LIMIT
  );

  return (
    <section className="min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">
            {t("unanswered.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("unanswered.subtitle")}
          </p>
        </div>
        <Link
          to="/ai-answer"
          className="shrink-0 text-sm font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          {t("unanswered.library")}
        </Link>
      </div>

      <StaggerGroup
        as="ul"
        inView
        stagger={0.065}
        delayChildren={0.09}
        className="mt-5 divide-y border-t"
      >
        {list.map((item) => (
          <StaggerItem
            key={item.id}
            as="li"
            y={12}
            className="group -mx-2 flex items-center justify-between gap-4 rounded-xl px-2 py-4 transition-colors duration-250 hover:bg-accent/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm font-semibold text-amber-700 transition-transform duration-300 ease-out group-hover:scale-105 dark:bg-amber-500/10 dark:text-amber-400">
                ?
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] text-foreground">
                  {item.question}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {item.meta}
                </p>
              </div>
            </div>
            <motion.div
              whileTap={prefersReduced ? undefined : { scale: 0.96 }}
              transition={MOTION_SPRING.snappy}
              className="shrink-0"
            >
              <Button
                variant="outline"
                className="group/btn shrink-0 rounded-full px-4"
              >
                <Plus className="size-4 transition-transform duration-300 ease-out group-hover/btn:rotate-90" />
                {t("unanswered.add")}
              </Button>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
};

export default UnansweredQuestionsCard;
