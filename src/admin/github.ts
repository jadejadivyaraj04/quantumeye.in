/**
 * The repository, used as the database.
 *
 * Every write is a commit through the GitHub Contents API - the same kind of
 * HTTP call a database SDK makes, to a different address. What it buys over a
 * database: history, diffs and one-click revert of any published change, at no
 * cost and with no service to keep alive.
 *
 * Nothing here runs on the public site. This module is only imported by the
 * admin chunk, which is loaded on demand.
 */

export const REPO = {
  owner: "jadejadivyaraj04",
  name: "quantumeye.in",
  branch: "main",
  /** Where the published content lives in the repo. */
  contentPath: "content/content.json",
  /** Uploaded captures, referenced from content by their raw URL. */
  mediaDir: "content/media",
} as const;

const API = "https://api.github.com";

/** The public, CDN-backed URL the live site reads. */
export function rawUrl(path: string): string {
  return `https://raw.githubusercontent.com/${REPO.owner}/${REPO.name}/${REPO.branch}/${path}`;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

async function call<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    // GitHub's own message is more useful than anything invented here:
    // "Resource not accessible by personal access token" tells you the scope
    // is wrong, which a generic "failed to save" would hide.
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) detail = body.message;
    } catch {
      /* non-JSON error body */
    }
    throw new GitHubError(detail, res.status);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export interface Account {
  login: string;
  name: string | null;
  avatarUrl: string;
}

/** Who the token belongs to. Fails if the token is invalid or revoked. */
export async function whoAmI(token: string): Promise<Account> {
  const user = await call<{
    login: string;
    name: string | null;
    avatar_url: string;
  }>(token, "/user");
  return { login: user.login, name: user.name, avatarUrl: user.avatar_url };
}

/**
 * Whether this token can actually write to the repo. A token that reads but
 * cannot write looks fine until the first publish fails, so it is checked at
 * sign-in instead.
 */
export async function canWrite(token: string): Promise<boolean> {
  const repo = await call<{ permissions?: { push?: boolean } }>(
    token,
    `/repos/${REPO.owner}/${REPO.name}`,
  );
  return repo.permissions?.push === true;
}

export interface RepoFile {
  /** Decoded UTF-8 text. */
  text: string;
  /** Blob sha - required to update the file without clobbering a newer copy. */
  sha: string;
}

/** Reads a file from the repo. Returns null when it does not exist yet. */
export async function readFile(
  token: string,
  path: string,
): Promise<RepoFile | null> {
  try {
    const file = await call<{ content: string; sha: string; encoding: string }>(
      token,
      `/repos/${REPO.owner}/${REPO.name}/contents/${path}?ref=${REPO.branch}`,
    );
    return { text: decodeBase64(file.content), sha: file.sha };
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Writes a file and returns the new sha.
 *
 * `sha` must be the one read alongside the current content. GitHub rejects the
 * write if the file moved on in between, which is the concurrency guard: two
 * tabs cannot silently overwrite each other.
 */
export async function writeFile(
  token: string,
  args: { path: string; text: string; message: string; sha?: string },
): Promise<string> {
  const res = await call<{ content: { sha: string } }>(
    token,
    `/repos/${REPO.owner}/${REPO.name}/contents/${args.path}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: args.message,
        content: encodeBase64(args.text),
        branch: REPO.branch,
        ...(args.sha ? { sha: args.sha } : {}),
      }),
    },
  );
  return res.content.sha;
}

/** Writes binary content (an uploaded capture). */
export async function writeBinary(
  token: string,
  args: { path: string; bytes: ArrayBuffer; message: string; sha?: string },
): Promise<string> {
  const res = await call<{ content: { sha: string } }>(
    token,
    `/repos/${REPO.owner}/${REPO.name}/contents/${args.path}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: args.message,
        content: bytesToBase64(new Uint8Array(args.bytes)),
        branch: REPO.branch,
        ...(args.sha ? { sha: args.sha } : {}),
      }),
    },
  );
  return res.content.sha;
}

export interface Commit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

/** Recent history for a path - the publish log, shown in the dashboard. */
export async function history(
  token: string,
  path: string,
  limit = 10,
): Promise<Commit[]> {
  const commits = await call<
    {
      sha: string;
      commit: { message: string; author: { name: string; date: string } };
    }[]
  >(
    token,
    `/repos/${REPO.owner}/${REPO.name}/commits?path=${encodeURIComponent(path)}&sha=${REPO.branch}&per_page=${limit}`,
  );
  return commits.map((c) => ({
    sha: c.sha,
    message: c.commit.message.split("\n")[0],
    date: c.commit.author.date,
    author: c.commit.author.name,
  }));
}

/* ─────────────────────────────────────────────────────────── base64 ──── */
/* btoa/atob are byte-oriented; content here is UTF-8 and includes em dashes,
   accents and emoji, so both directions go through TextEncoder/Decoder. */

function encodeBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

function decodeBase64(base64: string): string {
  const clean = base64.replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function bytesToBase64(bytes: Uint8Array): string {
  // Chunked: a single spread of a large array overflows the call stack.
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
