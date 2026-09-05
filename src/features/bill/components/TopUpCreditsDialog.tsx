import { useEffect, useRef, useState } from "react";
import { Check, Gift, ImagePlus, Lock, Pencil, QrCode, Receipt } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import { formatBaht } from "../format";
import {
  useCalculateCredit,
  useCreateTopup,
  useCreditPackages,
} from "../hooks/useBill";
import type { PaymentMethod } from "../type";

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: typeof QrCode;
  recommended?: boolean;
}[] = [
  {
    value: "qrcode",
    label: "QR Code",
    description: "ชำระผ่าน PromptPay QR Code",
    icon: QrCode,
    recommended: true,
  },
  {
    value: "slip",
    label: "สลิปโอนเงิน",
    description: "อัปโหลดสลิป ตรวจสอบภายใน 1-2 ชั่วโมง",
    icon: Receipt,
  },
];

const CUSTOM_ID = "custom";

const formatCredits = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 6 });

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (credits: number) => void;
};

export const TopUpCreditsDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [debouncedCustomAmount, setDebouncedCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qrcode");
  const [slip, setSlip] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  const packagesQuery = useCreditPackages(open);
  const packages = packagesQuery.data?.packages;
  const isCustom = selectedId === CUSTOM_ID;
  const normalizedCustomAmount = customAmount.trim();
  const customAmountValid =
    /^\d+(?:\.\d{1,6})?$/.test(normalizedCustomAmount) &&
    Number(normalizedCustomAmount) > 0;
  const customQuoteQuery = useCalculateCredit(
    debouncedCustomAmount,
    open && isCustom && customAmountValid
  );
  const customQuoteIsCurrent =
    debouncedCustomAmount === normalizedCustomAmount && customAmountValid;
  const selectedPackage = packages?.find(
    (packageQuote) => packageQuote.packageId === selectedId
  );
  const selectedQuote = isCustom
    ? customQuoteIsCurrent
      ? customQuoteQuery.data
      : undefined
    : selectedPackage;

  const totalPrice = Number(selectedQuote?.paidAmount ?? 0);
  const totalCredits = Number(selectedQuote?.creditAmount ?? 0);

  const { mutate: createTopup, isPending } = useCreateTopup((topup) => {
    onOpenChange(false);
    onSuccess(Number(topup.creditAmount));
  });

  useEffect(() => {
    if (!open || selectedId || !packages?.length) return;
    setSelectedId(packages[0].packageId);
  }, [open, packages, selectedId]);

  useEffect(() => {
    if (!open || !isCustom || !customAmountValid) {
      setDebouncedCustomAmount("");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedCustomAmount(normalizedCustomAmount);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [customAmountValid, isCustom, normalizedCustomAmount, open]);

  useEffect(() => {
    if (!slip) {
      setSlipPreview(null);
      return;
    }

    const url = URL.createObjectURL(slip);
    setSlipPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [slip]);

  // ล้างค่าที่กรอกไว้ทุกครั้งที่ปิด เพื่อไม่ให้ค้างมาถึงรอบถัดไป
  useEffect(() => {
    if (open) return;

    setSelectedId(null);
    setCustomAmount("");
    setDebouncedCustomAmount("");
    setPaymentMethod("qrcode");
    setSlip(null);
  }, [open]);

  const handleSlipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlip(await compressImage(file));
  };

  const handleSubmit = () => {
    if (!selectedQuote || totalPrice <= 0 || totalCredits <= 0) {
      toast.error("กรุณาระบุยอดเงินที่ต้องการเติม");
      return;
    }

    if (!slip) {
      toast.error("กรุณาแนบหลักฐานการชำระเงิน");
      return;
    }

    const type = paymentMethod === "slip" ? "Slip" : "QRcode";

    if (isCustom) {
      createTopup({ paidAmount: selectedQuote.paidAmount, type, slip });
      return;
    }

    if (!selectedQuote.packageId) {
      toast.error("ไม่พบแพ็กเกจที่เลือก กรุณาเลือกใหม่อีกครั้ง");
      return;
    }

    createTopup({
      packageId: selectedQuote.packageId,
      type,
      slip,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[88vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Top Up Credits</DialogTitle>
          <DialogDescription>
            Add credits to your account to continue using all features.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 -mx-1 px-1">
          <section className="space-y-2">
          <p className="text-sm font-semibold text-normal">1. Select amount</p>

          <div className="space-y-2">
            {packagesQuery.isLoading && (
              <div className="rounded-xl border p-4 text-center text-sm text-mini">
                กำลังโหลดแพ็กเกจเครดิต...
              </div>
            )}

            {packagesQuery.isError && (
              <div className="rounded-xl border border-destructive/30 p-4 text-center">
                <p className="text-sm text-destructive">
                  {getApiErrorMessage(
                    packagesQuery.error,
                    "โหลดแพ็กเกจเครดิตไม่สำเร็จ"
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => packagesQuery.refetch()}
                >
                  ลองใหม่
                </Button>
              </div>
            )}

            {packages?.map((packageQuote) => {
              const isSelected = selectedId === packageQuote.packageId;

              return (
                <button
                  key={packageQuote.packageId ?? packageQuote.paidAmount}
                  type="button"
                  onClick={() => setSelectedId(packageQuote.packageId)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      isSelected ? "border-primary bg-primary" : "border-input"
                    )}
                  >
                    {isSelected && (
                      <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                    )}
                  </span>

                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-normal">
                        {formatCredits(Number(packageQuote.creditAmount))} credits
                      </span>
                      {packageQuote.popular && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Popular
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-mini">
                      ฿{Number(packageQuote.pricePerCredit).toFixed(6)} / credit
                    </span>
                  </span>

                  <span className="text-md font-semibold text-normal">
                    {formatBaht(Number(packageQuote.paidAmount))}
                  </span>
                </button>
              );
            })}

            <div
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 transition-colors",
                isCustom ? "border-primary bg-primary/5" : ""
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedId(CUSTOM_ID)}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border cursor-pointer",
                  isCustom ? "border-primary bg-primary" : "border-input"
                )}
              >
                {isCustom && (
                  <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                )}
              </button>

              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-medium text-normal">
                  <Pencil className="size-3.5 text-mini" />
                  Custom amount
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs text-mini",
                    isCustom && customQuoteQuery.isError && "text-destructive"
                  )}
                >
                  {!isCustom || !normalizedCustomAmount
                    ? "ระบุยอดเงินที่ต้องการเติมเอง"
                    : !customAmountValid
                      ? "กรอกจำนวนบวก ทศนิยมได้ไม่เกิน 6 ตำแหน่ง"
                      : customQuoteQuery.isFetching || !customQuoteIsCurrent
                        ? "กำลังคำนวณเครดิต..."
                        : customQuoteQuery.isError
                          ? getApiErrorMessage(
                              customQuoteQuery.error,
                              "คำนวณเครดิตไม่สำเร็จ"
                            )
                          : `≈ ${formatCredits(totalCredits)} credits`}
                </p>
              </div>

              <Input
                type="number"
                min="0.000001"
                step="0.01"
                placeholder="Enter amount"
                value={customAmount}
                onFocus={() => setSelectedId(CUSTOM_ID)}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="h-9 w-32 bg-gray-50 text-right text-sm"
              />
            </div>
          </div>

          {packagesQuery.data && (
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5">
              <Gift className="size-4 shrink-0 text-primary" />
              <p className="text-[13px] text-normal">
                อัตราปัจจุบัน 1 บาท = {formatCredits(
                  Number(packagesQuery.data.creditsPerThb)
                )} เครดิต
              </p>
            </div>
          )}
        </section>

        <section className="space-y-2">
          <p className="text-sm font-semibold text-normal">2. Payment method</p>

          {paymentMethods.map((method) => {
            const isSelected = paymentMethod === method.value;

            return (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                  isSelected ? "border-primary bg-primary/5" : "hover:border-primary/40"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border",
                    isSelected ? "border-primary bg-primary" : "border-input"
                  )}
                >
                  {isSelected && (
                    <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                  )}
                </span>

                <method.icon className="size-5 shrink-0 text-mini" />

                <span className="flex-1">
                  <span className="block text-sm font-medium text-normal">
                    {method.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-mini">
                    {method.description}
                  </span>
                </span>

                {method.recommended && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                    Recommended
                  </span>
                )}
              </button>
            );
          })}

          <div className="rounded-xl border border-dashed p-3">
            <button
              type="button"
              onClick={() => slipInputRef.current?.click()}
              className="flex w-full items-center gap-3 text-left cursor-pointer"
            >
              {slipPreview ? (
                <img
                  src={slipPreview}
                  alt="หลักฐานการชำระเงิน"
                  className="size-14 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <ImagePlus className="size-5 text-mini" />
                </span>
              )}

              <span className="flex-1">
                <span className="block text-sm font-medium text-normal">
                  {slip
                    ? "เปลี่ยนหลักฐานการชำระเงิน"
                    : paymentMethod === "slip"
                      ? "แนบสลิปโอนเงิน"
                      : "แนบหลักฐานการชำระผ่าน QR Code"}
                  <span className="ml-1 text-destructive">*</span>
                </span>
                <span className="mt-0.5 block text-xs text-mini">
                  {slip ? slip.name : "รองรับไฟล์ JPG, PNG และ WebP ไม่เกิน 5 MB"}
                </span>
              </span>
            </button>

            <input
              ref={slipInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleSlipChange}
            />
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-semibold text-normal">3. Order summary</p>

          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-mini">
              <span>Amount</span>
              <span className="text-normal">
                {formatCredits(totalCredits)} credits
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold text-normal">
              <span>Total</span>
              <span className="text-primary">{formatBaht(totalPrice)}</span>
            </div>
          </div>
        </section>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isPending ||
              packagesQuery.isLoading ||
              (isCustom &&
                (customQuoteQuery.isFetching || !customQuoteIsCurrent))
            }
            className="flex-1"
          >
            {isPending ? "กำลังส่งคำขอ..." : "Proceed to Payment"}
            <Lock className="size-3.5" />
          </Button>
        </DialogFooter>

        <p className="flex items-center justify-center gap-1.5 text-xs text-mini">
          <Lock className="size-3" />
          ชำระเงินอย่างปลอดภัย ตรวจสอบยอดโดยทีมงาน
        </p>
      </DialogContent>
    </Dialog>
  );
};
