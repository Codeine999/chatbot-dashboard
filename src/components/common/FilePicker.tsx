import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<"label">, "onChange"> & {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
};

/**
 * พื้นที่กดเพื่อเลือกไฟล์ ใช้ label ห่อ input จริงไว้ จึงกดได้ทั้งเมาส์และคีย์บอร์ด
 * โดยไม่ต้องถือ ref ไปสั่ง .click() เอง
 */
export const FilePicker = ({
  accept,
  multiple,
  disabled,
  onFiles,
  className,
  children,
  ...props
}: Props) => (
  <label
    className={cn(
      "cursor-pointer outline-none has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
      disabled && "pointer-events-none opacity-50",
      className
    )}
    {...props}
  >
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className="sr-only"
      onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        // ล้างค่าไว้ ไม่งั้นเลือกไฟล์เดิมซ้ำจะไม่ยิง onChange
        event.target.value = "";
        if (files.length > 0) onFiles(files);
      }}
    />
    {children}
  </label>
);
