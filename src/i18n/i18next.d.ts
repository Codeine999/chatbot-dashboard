import "i18next";

/**
 * ตั้ง namespace เริ่มต้นให้ตรงกับตอน init
 *
 * ยังไม่ประกาศ `resources` ที่นี่ เพราะการเช็ค key ตอน compile ของ i18next
 * ต้องเปิด strictNullChecks ใน tsconfig ก่อน (conditional type ภายในใช้ `undefined extends string`
 * ซึ่งถ้าปิด strictNullChecks จะเป็น true เสมอ ทำให้ ParseKeys กลายเป็น never แล้ว t() พังทั้งไฟล์)
 *
 * ถ้าวันไหนเปิด strictNullChecks แล้ว ให้เพิ่มสองบรรทัดนี้เพื่อได้ autocomplete + เช็ค key:
 *
 *   import type { resources } from "./index";
 *   resources: (typeof resources)["th"];
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
  }
}
