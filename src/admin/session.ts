import { canWrite, whoAmI, type Account } from "./github";

/**
 * The admin session: one token, kept on this machine.
 *
 * A fine-grained token scoped to this one repository with Contents
 * read/write is the whole credential. It never leaves the browser except in
 * an Authorization header to api.github.com, it is never committed, and
 * "Sign out" removes it. Revoking it on GitHub kills it everywhere
 * instantly, which is more than can be said for a leaked database key.
 */

const KEY = "quantumeye.admin.token";

export function storedToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    // Private windows and blocked site data both throw here rather than
    // returning null, and an unreadable store is simply a signed-out one.
    return null;
  }
}

export function storeToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* session lasts only as long as the tab, which is still usable */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

export interface SessionCheck {
  ok: boolean;
  account?: Account;
  /** Why it failed, in terms of what to do about it. */
  problem?: string;
}

/** Verifies a token before anything is allowed to depend on it. */
export async function verify(token: string): Promise<SessionCheck> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, problem: "Paste a token to continue." };

  let account: Account;
  try {
    account = await whoAmI(trimmed);
  } catch {
    return {
      ok: false,
      problem:
        "GitHub rejected that token. It may be mistyped, expired, or revoked.",
    };
  }

  let writable = false;
  try {
    writable = await canWrite(trimmed);
  } catch {
    return {
      ok: false,
      problem:
        "That token cannot see quantumeye.in. Check it grants access to this repository.",
    };
  }

  if (!writable) {
    return {
      ok: false,
      account,
      problem:
        "That token can read the repository but not write to it. It needs Contents: read and write.",
    };
  }

  return { ok: true, account };
}
