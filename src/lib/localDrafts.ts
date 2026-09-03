import { CuenttoCreateData } from "./formSchemas/cuentto";

// There's no backend "Draft" model, so drafts are device-local by design,
// namespaced per user id so switching accounts on the same browser never
// mixes drafts between users.
export interface LocalDraft extends CuenttoCreateData {
  id: string;
  updatedAt: string;
}

const draftsKey = (userId: number) => `cuentto-local-drafts:${userId}`;

function readAll(userId: number): LocalDraft[] {
  try {
    const raw = localStorage.getItem(draftsKey(userId));
    return raw ? (JSON.parse(raw) as LocalDraft[]) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function writeAll(userId: number, drafts: LocalDraft[]): void {
  try {
    localStorage.setItem(draftsKey(userId), JSON.stringify(drafts));
  } catch (error) {
    console.error(error);
  }
}

export function listLocalDrafts(userId: number): LocalDraft[] {
  return readAll(userId).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getLocalDraft(userId: number, id: string): LocalDraft | null {
  return readAll(userId).find((draft) => draft.id === id) ?? null;
}

// Passing the id of a draft already on disk updates it in place; omitting
// it creates a new one. Returns the saved draft so callers get its id.
export function saveLocalDraft(
  userId: number,
  data: CuenttoCreateData,
  id?: string,
): LocalDraft {
  const drafts = readAll(userId);
  const existingIndex = id ? drafts.findIndex((draft) => draft.id === id) : -1;
  const saved: LocalDraft = {
    ...data,
    id: existingIndex >= 0 ? drafts[existingIndex].id : crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    drafts[existingIndex] = saved;
  } else {
    drafts.push(saved);
  }
  writeAll(userId, drafts);
  return saved;
}

export function deleteLocalDraft(userId: number, id: string): void {
  writeAll(
    userId,
    readAll(userId).filter((draft) => draft.id !== id),
  );
}
