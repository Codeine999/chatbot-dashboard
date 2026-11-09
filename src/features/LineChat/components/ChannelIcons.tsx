type IconProps = { className?: string };

/** โลโก้ช่องทางแบบย่อ ใช้สีประจำแบรนด์ */
export const LineIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="12" r="11" fill="#06C755" />
    <path
      d="M12 5.5c-3.9 0-7 2.5-7 5.7 0 2.9 2.5 5.3 5.9 5.8.2 0 .5.1.6.3v.8l1.6-1.4c2.1-.3 3.9-1.8 3.9-3.5 0-3.2-3.2-5.7-7-5.7z"
      fill="#fff"
    />
  </svg>
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
