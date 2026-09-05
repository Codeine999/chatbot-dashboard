import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

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
import { Form } from "@/components/ui/form";
import {
  ownerRegisterSchema,
  accountFieldNames,
  profileFieldNames,
  type OwnerRegisterForm,
} from "./type";
import { loadOwnerRegisterDraft, saveOwnerRegisterDraft } from "./ownerRegister.draft";
import { ownerRegisterApi } from "./services/ownerRegister.service";
import { useCompleteOwnerRegistration } from "./hooks/useOwnerRegister";
import { RegisterStepper } from "./components/RegisterStepper";
import { StepAccount } from "./components/StepAccount";
import { StepProfile } from "./components/StepProfile";
import { StepCompany } from "./components/StepCompany";
import { Background } from "@/components/BackGround";

const stepHeaders = {
  1: {
    title: "สมัครสมาชิกครั้งแรก",
    subtitle: "Step 1 of 3: Account Credentials",
    description:
      "กรุณากรอก username และ password เพื่อสมัครสมาชิก",
  },
  2: {
    title: "Personal Information",
    subtitle: "Step 2 of 3: Personal Information",
    description: "กรุณากรอก ชื่อ และ นามสกุล ของคุณ",
  },
  3: {
    title: "Company Information",
    subtitle: "Step 3 of 3: Company Information",
    description: "กรุณากรอก ชื่อ บริษัท และ ประเภทธุรกิจ ของคุณ",
  },
} as const;

const draft = loadOwnerRegisterDraft();

export const OwnerRegister = () => {
  const { mutate: completeRegistration, isPending: isSubmitting } =
    useCompleteOwnerRegistration();
  const [step, setStep] = useState<1 | 2 | 3>(draft?.step ?? 1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const form = useForm<OwnerRegisterForm>({
    resolver: zodResolver(ownerRegisterSchema),
    mode: "onChange",
    defaultValues: {
      username: draft?.data.username ?? "",
      email: draft?.data.email ?? "",
      phone: draft?.data.phone ?? "",
      password: "",
      confirmPassword: "",
      firstName: draft?.data.firstName ?? "",
      lastName: draft?.data.lastName ?? "",
      avatar: draft?.data.avatar ?? "",
      companyName: draft?.data.companyName ?? "",
      companyType: draft?.data.companyType ?? "",
    },
  });

  const handleContinueAccount = async () => {
    const valid = await form.trigger(accountFieldNames);
    if (!valid) return;

    const { username, email, phone } = form.getValues();

    setIsAuditing(true);
    try {
      const result = await ownerRegisterApi.auditOwner({ username, email, phone });
      if (result.data) {
        setAuditError(result.message || "ข้อมูลนี้ไม่สามารถใช้งานได้ กรุณาตรวจสอบอีกครั้ง");
        return;
      }

      saveOwnerRegisterDraft(2, { username, email, phone });
      setStep(2);
    } catch (error) {
      setAuditError(
        getApiErrorMessage(error, "ไม่สามารถตรวจสอบข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
      );
    } finally {
      setIsAuditing(false);
    }
  };

  const handleContinueProfile = async () => {
    const valid = await form.trigger(profileFieldNames);
    if (!valid) return;

    const { firstName, lastName, avatar } = form.getValues();
    saveOwnerRegisterDraft(3, { firstName, lastName, avatar });
    setStep(3);
  };

  const handleBack = () => setStep((s) => (s === 3 ? 2 : 1));

  const onInvalid = (errors: FieldErrors<OwnerRegisterForm>) => {
    const errorFields = Object.keys(errors);
    if (accountFieldNames.some((f) => errorFields.indexOf(f) !== -1)) setStep(1);
    else if (profileFieldNames.some((f) => errorFields.indexOf(f) !== -1)) setStep(2);
  };

  const onSubmit = (data: OwnerRegisterForm) => {
    completeRegistration(data);
  };

  const header = stepHeaders[step];

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#fcf8f7]">
      <Background />
      <div className="flex justify-center items-center min-h-screen py-10">
        <div className="bg-white w-full max-w-[650px] h-[800px] rounded-4xl p-10 px-18">
          <RegisterStepper step={step} />

          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center">
              <h1 className="text-xl font-bold">{header.title}</h1>
              <p className="mt-2 text-gray-400 text-[13px]">
                {header.subtitle}
                <br />
                {header.description}
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                  className="mt-8 text-left"
                >
                  {step === 1 && (
                    <StepAccount
                      form={form}
                      showPassword={showPassword}
                      showConfirmPassword={showConfirmPassword}
                      onToggleShowPassword={() => setShowPassword((v) => !v)}
                      onToggleShowConfirmPassword={() =>
                        setShowConfirmPassword((v) => !v)
                      }
                    />
                  )}
                  {step === 2 && <StepProfile form={form} />}
                  {step === 3 && <StepCompany form={form} />}

                  <div className="flex gap-3 pt-6">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="w-[120px] h-[45px] rounded-2xl"
                      >
                        <ArrowLeft className="size-4" />
                        Back
                      </Button>
                    )}

                    {step === 1 && (
                      <Button
                        type="button"
                        onClick={handleContinueAccount}
                        disabled={isAuditing}
                        className="flex-1 h-[45px] rounded-lg mt-6"
                      >
                        {isAuditing ? "กำลังตรวจสอบ..." : "Continue"}
                        <ArrowRight className="size-4" />
                      </Button>
                    )}
                    {step === 2 && (
                      <Button
                        type="button"
                        onClick={handleContinueProfile}
                        className="flex-1 h-[45px] rounded-lg"
                      >
                        Continue
                        <ArrowRight className="size-4" />
                      </Button>
                    )}
                    {step === 3 && (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-[45px] rounded-lg"
                      >
                        <CheckCircle2 className="size-4" />
                        {isSubmitting ? "Creating..." : "Complete Registration"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={!!auditError} onOpenChange={(open) => !open && setAuditError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ไม่สามารถดำเนินการต่อได้</DialogTitle>
            <DialogDescription>{auditError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAuditError(null)}>ตกลง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
