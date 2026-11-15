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
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <p className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </p>
      {counter && (
        <p className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{counter}</p>
      )}
    </div>

    {topHint && <p className="mb-2 text-xs text-muted-foreground">{topHint}</p>}

    {children}

    {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

/** แถวหนึ่งของหน้าตั้งค่า: คอลัมน์ซ้าย = หัวข้อ+คำอธิบาย, ขวา = ช่องกรอก */
export const SettingSection = ({
  title,
  description,
  note,
  children,
}: {
  title: string;
  description?: string;
  note?: string;
  children: React.ReactNode;
}) => (
  <section className="grid gap-6 border-t py-8 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:gap-12">
    <div>
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
      {note && <p className="mt-3 font-mono text-xs text-muted-foreground">{note}</p>}
    </div>
    <div className="flex min-w-0 flex-col gap-6">{children}</div>
  </section>
);
