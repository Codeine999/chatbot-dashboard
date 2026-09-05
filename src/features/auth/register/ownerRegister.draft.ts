import type { OwnerRegisterDraftData } from "./type";

const STORAGE_KEY = "owner-register-draft";

export type OwnerRegisterDraft = {
  step: 1 | 2 | 3;
  data: Partial<OwnerRegisterDraftData>;
};

export function loadOwnerRegisterDraft(): OwnerRegisterDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OwnerRegisterDraft) : null;
  } catch {
    return null;
  }
}

export function saveOwnerRegisterDraft(
  step: OwnerRegisterDraft["step"],
  data: Partial<OwnerRegisterDraftData>
) {
  const existing = loadOwnerRegisterDraft();
  const draft: OwnerRegisterDraft = {
    step,
    data: { ...existing?.data, ...data },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearOwnerRegisterDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
