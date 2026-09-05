import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credits: number;
};

export const TopupSuccessDialog = ({ open, onOpenChange, credits }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader className="items-center text-center">
        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10">
          <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
        </div>
        <DialogTitle className="text-center">ส่งคำขอเติมเครดิตสำเร็จ</DialogTitle>
      </DialogHeader>

      <p className="text-center text-sm text-mini">
        คำขอเติม{" "}
        <span className="font-semibold text-normal">
          {credits.toLocaleString()} เครดิต
        </span>{" "}
        ถูกส่งเรียบร้อยแล้ว
      </p>

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 dark:bg-amber-500/10">
        <Clock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-[13px] text-normal">
          รอทีมงานตรวจสอบการชำระเงิน เครดิตจะเข้าบัญชีของคุณหลังตรวจสอบเสร็จสิ้น
        </p>
      </div>

      <DialogFooter>
        <Button className="w-full" onClick={() => onOpenChange(false)}>
          ตกลง
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
