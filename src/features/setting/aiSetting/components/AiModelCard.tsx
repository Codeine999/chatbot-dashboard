import { useTranslation } from "react-i18next";
import { Box } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingField } from "./SettingField";
import {
  AI_PROVIDER_CATALOG,
  AI_PROVIDER_LABELS,
  AI_PROVIDER_NAMES,
} from "../constants";
import type { AiModelSelection, AiProviderName } from "../type";

/** ชื่อรุ่นซ้ำกันได้ข้าม provider (เช่น gpt-5.6-sol) จึงต้องผูก provider ไปกับค่าใน select */
const toValue = (selection: AiModelSelection) =>
  `${selection.provider}::${selection.model}`;

const fromValue = (value: string): AiModelSelection => {
  const [provider, ...rest] = value.split("::");
  return { provider: provider as AiProviderName, model: rest.join("::") };
};

const ModelSelect = ({
  value,
  onChange,
}: {
  value: AiModelSelection;
  onChange: (next: AiModelSelection) => void;
}) => (
  <Select value={toValue(value)} onValueChange={(next) => onChange(fromValue(next))}>
    <SelectTrigger className="w-full !h-10">
      {/* ใน trigger แสดงเฉพาะชื่อรุ่น ส่วน provider อยู่เป็นหัวข้อในลิสต์ */}
      <SelectValue>{value.model}</SelectValue>
    </SelectTrigger>
    <SelectContent>
      {AI_PROVIDER_NAMES.map((provider) => (
        <SelectGroup key={provider}>
          <SelectLabel>{AI_PROVIDER_LABELS[provider]}</SelectLabel>
          {AI_PROVIDER_CATALOG[provider].map((model) => (
            <SelectItem key={`${provider}::${model}`} value={`${provider}::${model}`}>
              {model}
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </SelectContent>
  </Select>
);

type Props = {
  userModel: AiModelSelection;
  adminModel: AiModelSelection;
  onChangeUserModel: (next: AiModelSelection) => void;
  onChangeAdminModel: (next: AiModelSelection) => void;
};

export const AiModelCard = ({
  userModel,
  adminModel,
  onChangeUserModel,
  onChangeAdminModel,
}: Props) => {
  const { t } = useTranslation("settings");

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Box className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-normal">
              {t("aiSetting.model.title")}
            </p>
            <p className="mt-0.5 text-xs text-mini">{t("aiSetting.model.subtitle")}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SettingField
            label={t("aiSetting.model.userModel")}
            required
            hint={t("aiSetting.model.userModelHint")}
          >
            <ModelSelect value={userModel} onChange={onChangeUserModel} />
          </SettingField>

          <SettingField
            label={t("aiSetting.model.adminModel")}
            required
            hint={t("aiSetting.model.adminModelHint")}
          >
            <ModelSelect value={adminModel} onChange={onChangeAdminModel} />
          </SettingField>
        </div>
      </CardContent>
    </Card>
  );
};
