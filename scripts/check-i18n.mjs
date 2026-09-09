/**
 * ตรวจว่าไฟล์แปลของทุกภาษามี key ครบตรงกัน
 *
 * รันด้วย: bun run i18n:check
 * ใช้กันกรณีเพิ่มข้อความใหม่ในภาษาไทยแล้วลืมเพิ่มในภาษาอังกฤษ
 * ซึ่งจะทำให้หน้าจอโผล่ key ดิบ ๆ ออกมาแทนข้อความ
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "src/i18n/locales";

// ไทยมี plural category เดียว (_other) ส่วนอังกฤษมี _one/_other
// จึงต้องตัด suffix ออกก่อนเทียบ ไม่งั้นจะฟ้องผิดทุกครั้งที่ใช้ count
const PLURAL_SUFFIXES = ["_zero", "_one", "_two", "_few", "_many", "_other"];

const flatten = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) =>
    child !== null && typeof child === "object"
      ? flatten(child, `${prefix}${key}.`)
      : [[`${prefix}${key}`, child]]
  );

const baseKey = (key) => {
  const suffix = PLURAL_SUFFIXES.find((item) => key.endsWith(item));
  return suffix ? key.slice(0, -suffix.length) : key;
};

const placeholders = (value) =>
  new Set([...String(value).matchAll(/\{\{(\w+)/g)].map((match) => match[1]));

const read = (lang, ns) =>
  new Map(
    flatten(JSON.parse(readFileSync(join(BASE, lang, `${ns}.json`), "utf-8")))
  );

// ใช้ไทยเป็นตัวตั้ง เพราะเป็นภาษาหลักที่เขียนข้อความใหม่ก่อนเสมอ
const REFERENCE_LANGUAGE = "th";

const languages = readdirSync(BASE).sort();
const reference = languages.includes(REFERENCE_LANGUAGE)
  ? REFERENCE_LANGUAGE
  : languages[0];
const others = languages.filter((lang) => lang !== reference);
const namespaces = readdirSync(join(BASE, reference))
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, ""))
  .sort();

let problems = 0;
const report = (message) => {
  console.error(message);
  problems += 1;
};

for (const ns of namespaces) {
  const entries = Object.fromEntries(
    languages.map((lang) => [lang, read(lang, ns)])
  );
  const keys = Object.fromEntries(
    languages.map((lang) => [lang, new Set([...entries[lang].keys()].map(baseKey))])
  );

  for (const lang of others) {
    for (const key of keys[reference]) {
      if (!keys[lang].has(key)) report(`[${ns}] ขาดใน ${lang}: ${key}`);
    }
    for (const key of keys[lang]) {
      if (!keys[reference].has(key)) report(`[${ns}] เกินมาใน ${lang}: ${key}`);
    }
  }

  // ตัวแปรใน {{...}} ต้องเหมือนกันทุกภาษา ไม่งั้นข้อความจะขาดค่าไปเฉย ๆ
  for (const [key, value] of entries[reference]) {
    for (const lang of others) {
      const match = [...entries[lang].keys()].find(
        (candidate) => baseKey(candidate) === baseKey(key)
      );
      if (!match) continue;

      const expected = placeholders(value);
      const actual = placeholders(entries[lang].get(match));
      if (expected.size !== actual.size || [...expected].some((item) => !actual.has(item))) {
        report(
          `[${ns}] placeholder ไม่ตรง ${baseKey(key)}: ` +
            `${reference}={${[...expected]}} ${lang}={${[...actual]}}`
        );
      }
    }
  }
}

if (problems > 0) {
  console.error(`\nพบปัญหา ${problems} จุด`);
  process.exit(1);
}

console.log(`ไฟล์แปลครบตรงกันทุกภาษา (${languages.join(", ")} / ${namespaces.length} namespace)`);
