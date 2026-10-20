import { useEffect, useRef, useState } from "react";

export type UploadImage = {
  id: string;
  /** รูปเดิมเป็น URL จาก server ส่วนรูปใหม่เป็น object URL ไว้ preview */
  url: string;
  /** มีเฉพาะรูปที่เพิ่งเลือก ยังไม่ได้อัปโหลด */
  file?: File;
};

export type RejectedImage = {
  file: File;
  reason: "type" | "size" | "limit";
};

type Options = {
  initialUrls?: string[];
  maxCount: number;
  maxSizeMB: number;
  /** MIME type ที่รับ เช่น ["image/png", "image/jpeg"] */
  accept: string[];
  /** เรียกครั้งเดียวต่อการเลือกไฟล์ พร้อมไฟล์ที่ไม่ผ่านทั้งหมด */
  onReject?: (rejected: RejectedImage[]) => void;
};

/**
 * จัดการรายการรูปก่อนอัปโหลด: ตรวจชนิด/ขนาด/จำนวน, สร้าง preview, ลบ, ตั้งรูปหลัก
 * รูปแรกในลิสต์คือรูปหลักเสมอ
 */
export function useImageUpload({
  initialUrls = [],
  maxCount,
  maxSizeMB,
  accept,
  onReject,
}: Options) {
  const [images, setImages] = useState<UploadImage[]>(() =>
    initialUrls.map((url) => ({ id: crypto.randomUUID(), url }))
  );

  // เก็บ object URL ที่สร้างไว้ทั้งหมด เพื่อคืนหน่วยความจำตอนออกจากหน้า
  const objectUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const addFiles = (files: File[]) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    const room = maxCount - images.length;
    const accepted: UploadImage[] = [];
    const rejected: RejectedImage[] = [];

    for (const file of files) {
      if (!accept.includes(file.type)) rejected.push({ file, reason: "type" });
      else if (file.size > maxBytes) rejected.push({ file, reason: "size" });
      else if (accepted.length >= room) rejected.push({ file, reason: "limit" });
      else {
        const url = URL.createObjectURL(file);
        objectUrls.current.add(url);
        accepted.push({ id: crypto.randomUUID(), url, file });
      }
    }

    if (accepted.length > 0) setImages((current) => [...current, ...accepted]);
    if (rejected.length > 0) onReject?.(rejected);
  };

  const remove = (id: string) => {
    const target = images.find((image) => image.id === id);
    if (target?.file) {
      URL.revokeObjectURL(target.url);
      objectUrls.current.delete(target.url);
    }
    setImages((current) => current.filter((image) => image.id !== id));
  };

  const makePrimary = (id: string) =>
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      return target ? [target, ...current.filter((image) => image.id !== id)] : current;
    });

  return {
    images,
    addFiles,
    remove,
    makePrimary,
    canAddMore: images.length < maxCount,
  };
}
