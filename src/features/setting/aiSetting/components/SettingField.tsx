/** label + ช่องกรอก + คำอธิบายใต้ช่อง ใช้ซ้ำทุก field ของหน้า AI Setting */
export const SettingField = ({
  label,
  required,
  hint,
  /** คำอธิบายที่ต้องอยู่เหนือช่องกรอก เช่น บล็อก skills ที่ไม่ใช่ input เดี่ยว */
  topHint,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  topHint?: string;
  counter?: string;
  children: React.ReactNode;
}) => (
  <div className="min-w-0">
    <p className="mb-1.5 text-sm font-medium text-normal">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </p>

    {topHint && <p className="mb-2 text-xs text-mini">{topHint}</p>}

    {children}

    {(hint || counter) && (
      <div className="mt-1.5 flex items-start justify-between gap-3">
        <p className="text-xs text-mini">{hint}</p>
        {counter && <p className="shrink-0 text-xs text-mini">{counter}</p>}
      </div>
    )}
  </div>
);
