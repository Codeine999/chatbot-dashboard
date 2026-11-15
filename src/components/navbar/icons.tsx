import type { SVGProps } from "react";

/** ไอคอนวาดเองให้ตรงกับดีไซน์ ElevenLabs (ไม่ใช้ lucide) — stroke ตาม currentColor */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** กรอบสี่เหลี่ยมมนมีแถบแนวตั้งสั้นชิดซ้าย */
export const SidebarToggleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="4.5" width="18" height="15" rx="3.5" />
    <path d="M7.5 9.5v5" strokeWidth={2} />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7.25" />
    <path d="m20.5 20.5-4.3-4.3" />
  </svg>
);

/** ลูกศรนำทางทึบ สีฟ้าเหมือนปุ่ม Ask */
export const AskIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      d="M3.4 10.6 19.8 3.2c.8-.35 1.6.45 1.25 1.25L13.6 20.6c-.4.9-1.7.8-1.95-.15l-1.4-5.2a1 1 0 0 0-.7-.7l-5.2-1.4c-.95-.25-1.05-1.55-.15-1.95Z"
      fill="currentColor"
    />
  </svg>
);

export const FolderIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3.5 8.2V7a2.5 2.5 0 0 1 2.5-2.5h3.2c.6 0 1.1.25 1.5.7l.9 1.1c.3.4.8.7 1.4.7H18A2.5 2.5 0 0 1 20.5 9.5v7.5A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
    <path d="M3.5 10.2h17" />
  </svg>
);

export const BellIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5H4.5Z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </svg>
);
