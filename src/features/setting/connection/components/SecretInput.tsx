import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

/** ช่องกรอกค่าลับ มีปุ่มตาสลับแสดง/ซ่อน */
export const SecretInput = ({
  value,
  placeholder,
  invalid,
  name,
  onChange,
  onBlur,
}: {
  value: string;
  placeholder: string;
  invalid?: boolean;
  name?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) => {
  const { t } = useTranslation("settings");
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        name={name}
        type={visible ? "text" : "password"}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="!h-11 rounded-xl pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={t(visible ? "connection.line.hide" : "connection.line.show")}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-mini hover:text-normal"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
};
