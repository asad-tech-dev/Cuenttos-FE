import { CuenttoCreateData } from "./formSchemas/cuentto";

const DRAFT_KEY_PREFIX = "cuentto-draft:";

// Namespaced by promptGroupId so an in-flight draft never resurrects into
// the wrong prompt's session, and different shared-prompt drafts (in the
// unlikely event of more than one in flight in the same tab) don't collide.
const draftKey = (promptGroupId?: string | null) =>
  `${DRAFT_KEY_PREFIX}${promptGroupId ?? "none"}`;

// Saved right before bouncing an unauthenticated guest (writing from a
// shared prompt link) to /login, so the Cuentto they already wrote survives
// the login/register round trip — sessionStorage persists across same-tab
// client-side navigation and reloads, only clearing when the tab closes.
export function saveCuenttoDraft(
  promptGroupId: string | null | undefined,
  draft: CuenttoCreateData,
): void {
  try {
    sessionStorage.setItem(draftKey(promptGroupId), JSON.stringify(draft));
  } catch (error) {
    console.error(error);
  }
}

export function readCuenttoDraft(
  promptGroupId: string | null | undefined,
): CuenttoCreateData | null {
  try {
    const raw = sessionStorage.getItem(draftKey(promptGroupId));
    return raw ? (JSON.parse(raw) as CuenttoCreateData) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function clearCuenttoDraft(promptGroupId: string | null | undefined): void {
  try {
    sessionStorage.removeItem(draftKey(promptGroupId));
  } catch (error) {
    console.error(error);
  }
}
