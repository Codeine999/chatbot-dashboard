import { useTranslation } from "react-i18next";
import { Box, LoaderCircle } from "lucide-react";
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
import { useAuthUser } from "@/features/auth/store/auth.store";
import { SettingField } from "./SettingField";
import {
  useAiProviderCatalog,
  useAiProviderSettings,
  useUpdateAiProviderSetting,
} from "../hooks/useAiProviders";
import type {
  AiModelSelection,
  AiProviderCatalogItem,
  AiProviderName,
  AiProviderScope,
} from "../type";

/** ชื่อรุ่นซ้ำกันได้ข้าม provider จึงต้องผูก provider ไปกับค่าใน select */
const toValue = (selection: AiModelSelection) =>
  `${selection.provider}::${selection.model}`;

const fromValue = (value: string): AiModelSelection => {
  const [provider, ...rest] = value.split("::");
  return { provider: provider as AiProviderName, model: rest.join("::") };
};

type ModelSelectProps = {
  value?: AiModelSelection;
  catalog: AiProviderCatalogItem[];
  disabled: boolean;
  loading: boolean;
  onChange: (next: AiModelSelection) => void;
};

const ModelSelect = ({ value, catalog, disabled, loading, onChange }: ModelSelectProps) => (
  <Select
    value={value ? toValue(value) : ""}
    disabled={disabled}
    onValueChange={(next) => onChange(fromValue(next))}
  >
    <SelectTrigger className="w-full !h-10">
      {/* ใน trigger แสดงเฉพาะชื่อรุ่น ส่วน provider อยู่เป็นหัวข้อในลิสต์ */}
      <SelectValue>{value?.model}</SelectValue>
      {loading && <LoaderCircle className="ml-auto size-4 animate-spin text-mini" />}
    </SelectTrigger>
    <SelectContent>
      {catalog.map((item) => (
        <SelectGroup key={item.provider}>
          <SelectLabel>{item.label}</SelectLabel>
          {item.models.map((model) => (
            <SelectItem
              key={`${item.provider}::${model}`}
              value={`${item.provider}::${model}`}
              disabled={!item.available}
            >
              {model}
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </SelectContent>
  </Select>
);

export const AiModelCard = () => {
  const { t } = useTranslation("settings");
  const user = useAuthUser();
  const catalogQuery = useAiProviderCatalog();
  const settingsQuery = useAiProviderSettings();
  const updateMutation = useUpdateAiProviderSetting();

  const catalog = catalogQuery.data ?? [];
  const settings = settingsQuery.data ?? [];
  const canEdit = user?.role === "dev" || user?.role === "owner";
  const settingOf = (scope: AiProviderScope) =>
    settings.find((setting) => setting.scope === scope);

  const renderSelect = (scope: AiProviderScope) => {
    const setting = settingOf(scope);
    const isSaving =
      updateMutation.isPending && updateMutation.variables?.scope === scope;

    return (
      <ModelSelect
        value={setting && { provider: setting.provider, model: setting.model }}
        catalog={catalog}
        loading={isSaving || settingsQuery.isLoading}
        disabled={!canEdit || isSaving || catalogQuery.isLoading || !setting}
        onChange={(selection) => {
          if (
            selection.provider === setting?.provider &&
            selection.model === setting.model
          ) {
            return;
          }
          updateMutation.mutate({ scope, selection });
        }}
      />
    );
  };

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
            <p className="mt-0.5 text-xs text-mini">
              {canEdit
                ? t("aiSetting.model.subtitle")
                : t("aiSetting.model.readOnly")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SettingField
            label={t("aiSetting.model.userModel")}
            required
            hint={t("aiSetting.model.userModelHint")}
          >
            {renderSelect("USER")}
          </SettingField>

          <SettingField
            label={t("aiSetting.model.adminModel")}
            required
            hint={t("aiSetting.model.adminModelHint")}
          >
            {renderSelect("ADMIN")}
          </SettingField>
        </div>
      </CardContent>
    </Card>
  );
};
