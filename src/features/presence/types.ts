/** ตรงกับ contract ฝั่ง backend (docs/admin-presence-socket.md) */
export type PresenceChannel = "LINE" | "APP" | "FACEBOOK";

export type PresenceViewer = {
  adminId: string;
  /** ชื่อที่แสดง (ไม่ log ลง console ใน production) */
  name: string;
  typing: boolean;
};

export type PresenceRoom = {
  channel: PresenceChannel;
  conversationId: string;
  /** เรียงตาม adminId; รวมตัวเองด้วย (กรองออกตอนแสดงผล) */
  viewers: PresenceViewer[];
};

export type PresenceFailure =
  | "DISABLED"
  | "UNAUTHORIZED"
  | "INVALID_PAYLOAD"
  | "NOT_FOUND"
  | "NOT_JOINED"
  | "TOO_MANY_ROOMS"
  | "UNAVAILABLE";

type PresenceAckOk<T> = T & { ok: true };
type PresenceAckFail = { ok: false; reason: PresenceFailure };

export type PresenceAck<T = Record<never, never>> = PresenceAckOk<T> | PresenceAckFail;

/**
 * type guard แทน `if (!ack.ok)`: tsconfig ไม่เปิด strictNullChecks จึงไม่ narrow ด้วย discriminant
 */
export const isPresenceFailure = <T extends object>(
  ack: PresenceAck<T>
): ack is PresenceAckFail => !ack.ok;
