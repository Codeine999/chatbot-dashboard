const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/**
 * base ของไฟล์ static = origin ของ backend
 * backend เสิร์ฟรูปที่ /uploads/... ไม่ได้อยู่ใต้ /api (ยืนยันแล้วว่า /api/uploads/... = 404)
 * ถ้า VITE_API_URL เป็น path relative (เคสใช้ vite proxy) จะได้ "" -> src เป็น relative path
 */
const ASSET_BASE = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return API_URL.replace(/\/api$/, "");
  }
})();

const INLINE_URL = /^(data:|blob:)/i;
const ABSOLUTE_URL = /^https?:\/\//i;

/**
 * แปลง path รูปจาก backend ให้เป็น URL ที่โหลดได้จริง
 * - ไม่มีรูป -> "" (component ใช้ได้เลยโดยไม่ต้องเช็ค null)
 * - data:/blob: หรือรูปจาก host อื่น (CDN) -> คืนค่าเดิม
 * - นอกนั้นต่อ origin ให้ และตัด /api ออกถ้ามีติดมา
 */
export const resolveImageUrl = (path?: string | null): string => {
  if (!path) return "";
  if (INLINE_URL.test(path)) return path;

  let assetPath = path;

  if (ABSOLUTE_URL.test(path)) {
    const url = new URL(path);

    if (!ASSET_BASE || url.origin !== ASSET_BASE) return path;

    assetPath = url.pathname;
  }

  assetPath = assetPath.replace(/^\/+/, "").replace(/^api\//, "");

  return `${ASSET_BASE}/${assetPath}`;
};
