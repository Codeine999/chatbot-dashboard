import lineIconUrl from "@/assets/icon/line-icon.png";

type IconProps = { className?: string };

/** โลโก้ช่องทางแบบย่อ ใช้สีประจำแบรนด์ */
export const LineIcon = ({ className }: IconProps) => (
  <img src={lineIconUrl} alt="" aria-hidden className={`${className ?? ""} rounded-full object-cover`} />
);

export const MessengerIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M12 1.5C6 1.5 1.5 6 1.5 11.6c0 2.9 1.2 5.4 3.1 7.2V23l2.8-1.6c1 .3 2 .4 3.1.4 6 0 10.5-4.5 10.5-10.2S18 1.5 12 1.5z"
      fill="#0084FF"
    />
    <path d="M5.8 14.2l3.1-4.9 2.4 2.4 4.6-2.4-3.1 4.9-2.4-2.4z" fill="#fff" />
  </svg>
);

export const TikTokIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="12" r="11" fill="#000" />
    <path
      d="M13.2 6h2.1c.2 1.8 1.3 3 3.1 3.2v2.1c-1.1 0-2.1-.3-3.1-.9v4.3c0 2.4-1.9 4.3-4.3 4.3S6.7 17 6.7 14.6s1.9-4.3 4.3-4.3c.2 0 .4 0 .6.1v2.2c-.2-.1-.4-.1-.6-.1-1.2 0-2.1.9-2.1 2.1s.9 2.1 2.1 2.1 2.1-.9 2.1-2.1V6z"
      fill="#fff"
    />
  </svg>
);

/** ช่องทางของแอปเอง (ไม่ใช่แพลตฟอร์มภายนอก) */
export const ApplicationIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="12" r="11" fill="#F97316" />
    <rect x="8.5" y="6" width="7" height="12" rx="1.8" fill="none" stroke="#fff" strokeWidth="1.6" />
    <path d="M11 15.8h2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** ไอคอน LINE แบบสี่เหลี่ยมมน ใช้ในชิปช่องทางของ Inbox */
export const LineSquareIcon = ({ className }: IconProps) => (
  <img src={lineIconUrl} alt="" aria-hidden className={`${className ?? ""} rounded-[7px] object-cover`} />
);

/** Messenger ที่ยังไม่เปิดใช้ — โทนม่วงอ่อนซีด */
export const MessengerSoonIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <defs>
      <linearGradient id="messenger-soon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b8bfe6" />
        <stop offset="1" stopColor="#d3c4e3" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="12" fill="url(#messenger-soon)" />
    <path d="M6.5 14.6l3.4-4.6 2.5 2.4 4.1-2.8-3.3 4.7-2.5-2.4z" fill="#fff" fillOpacity=".85" />
  </svg>
);

/** TikTok ที่ยังไม่เปิดใช้ — เทาทึบ */
export const TikTokSoonIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <rect width="24" height="24" rx="7" fill="#9b9b9b" />
    <path
      d="M13 6.2h1.9c.2 1.6 1.2 2.7 2.8 2.9v1.9c-1 0-1.9-.3-2.8-.8v3.9c0 2.2-1.7 3.9-3.9 3.9s-3.9-1.7-3.9-3.9 1.7-3.9 3.9-3.9h.5v2c-.2 0-.3-.1-.5-.1-1.1 0-1.9.8-1.9 1.9s.8 1.9 1.9 1.9 1.9-.8 1.9-1.9V6.2z"
      fill="#fff"
    />
  </svg>
);
