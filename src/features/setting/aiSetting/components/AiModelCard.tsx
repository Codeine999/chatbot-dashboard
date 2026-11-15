import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
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
import { SettingField, SettingSection } from "./SettingField";
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
    <SelectTrigger className="w-full !h-[42px] rounded-[10px]">
      {/* ใน trigger แสดงชื่อ provider เป็นชิป + ชื่อรุ่น */}
      {value && (
        <span className="rounded-md border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {catalog.find((item) => item.provider === value.provider)?.label ?? value.provider}
        </span>
      )}
      <SelectValue className="flex-1 justify-start">
        <span className="text-left font-mono text-[13px]">{value?.model}</span>
      </SelectValue>
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
  const canEdit = user?.role === "dev";
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
    <SettingSection
      title={t("aiSetting.model.title")}
      description={canEdit ? t("aiSetting.model.subtitle") : t("aiSetting.model.readOnly")}
    >
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
    </SettingSection>
  );
};
