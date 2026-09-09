import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trans, useTranslation } from "react-i18next";
import { formatNumber } from "@/i18n/format";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credits: number;
};

export const TopupSuccessDialog = ({ open, onOpenChange, credits }: Props) => {
  const { t } = useTranslation("bill");

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader className="items-center text-center">
        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10">
          <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
        </div>
        <DialogTitle className="text-center">{t("topupSuccess.title")}</DialogTitle>
      </DialogHeader>

      {/* Trans เพราะข้อความมีตัวหนาอยู่ตรงกลาง ตำแหน่งของมันต่างกันในแต่ละภาษา */}
      <p className="text-center text-sm text-mini">
        <Trans
          i18nKey="topupSuccess.message"
          ns="bill"
          values={{ credits: formatNumber(credits) }}
          components={[<span key="0" />, <span key="1" className="font-semibold text-normal" />]}
        />
      </p>

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 dark:bg-amber-500/10">
        <Clock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-[13px] text-normal">
          {t("topupSuccess.waiting")}
        </p>
      </div>

      <DialogFooter>
        <Button className="w-full" onClick={() => onOpenChange(false)}>
          {t("topupSuccess.ok")}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};
