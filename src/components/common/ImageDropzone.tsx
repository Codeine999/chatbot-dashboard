import { useState, type ReactNode } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilePicker } from "./FilePicker";
import { IconTile } from "./IconTile";

type Props = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  /** ข้อความหลัก เช่น "ลากรูปมาวางที่นี่ หรือ" */
  label: string;
  /** คำที่ทำเป็นลิงก์ต่อท้าย label เช่น "เลือกไฟล์" */
  browseLabel: string;
  hint?: ReactNode;
  className?: string;
};

/** ลากไฟล์มาวาง หรือกดเพื่อเลือกไฟล์ */
export const ImageDropzone = ({
  accept,
  multiple = true,
  disabled,
  onFiles,
  label,
  browseLabel,
  hint,
  className,
}: Props) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <FilePicker
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      onFiles={onFiles}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        // dragleave ยิงตอนลากผ่านลูกข้างในด้วย นับว่าออกจริงเฉพาะตอนพ้นกรอบนอก
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) onFiles(files);
      }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-slate-300 bg-hover/30 hover:border-primary/50 dark:border-border",
        className
      )}
    >
      <IconTile icon={Upload} size="sm" />
      <p className="mt-3 text-sm text-normal">
        {label}{" "}
        <span className="font-medium text-icons underline underline-offset-2">{browseLabel}</span>
      </p>
      {hint && <p className="mt-1 text-xs text-mini">{hint}</p>}
    </FilePicker>
  );
};
