import { useCallback, useEffect, useState } from "react";
import {
  bundledContent,
  CONTENT_SHAPE,
  isPortfolioContent,
  type PortfolioContent,
} from "../data/content";
import {
  explainWriteFailure,
  history,
  rawUrl,
  readFile,
  REPO,
  writeFile,
  type Account,
  type Commit,
} from "./github";
import { SectionEditor } from "./Editor";
import { SECTIONS, specFor } from "./schema";
import { clearToken, storeToken, storedToken, verify } from "./session";
import { describeChanges, validate, type Problem } from "./validate";

/**
 * The dashboard.
 *
 * Loaded only when the URL asks for it, so none of this - nor the GitHub
 * client - reaches a visitor's bundle. The repository is the database: content
 * is one JSON file, every publish is a commit, and the live site reads the
 * file from GitHub's CDN without a rebuild.
 *
 * Edits are a draft until published. The draft is kept in this browser, so
 * closing the tab mid-sentence loses nothing, and nothing half-written
 * reaches the site.
 */

type Phase = "checking" | "signed-out" | "ready";

const DRAFT_KEY = "quantumeye.admin.draft";

interface Loaded {
  /** What is live: the published file, or the bundled copy if none exists. */
  published: PortfolioContent;
  /** Blob sha of content.json, or null when the file does not exist yet. */
  sha: string | null;
  source: "repo" | "bundled";
}

function readDraft(sha: string | null): PortfolioContent | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { sha: string | null; content: unknown };
    // A draft built on an older published file would silently undo whatever
    // came after it, so it is dropped rather than merged.
    if (saved.sha !== sha) return null;
    return isPortfolioContent(saved.content) ? saved.content : null;
  } catch {
    return null;
  }
}

function saveDraft(sha: string | null, content: PortfolioContent) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ sha, content }));
  } catch {
    /* a full or blocked store just means no crash recovery */
  }
}

function dropDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to do */
  }
}

export default function Admin() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [token, setToken] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState<PortfolioContent | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [note, setNote] = useState("");
  const [restored, setRestored] = useState(false);
  const [active, setActive] = useState<keyof PortfolioContent>("caseStudies");

  /* Keep the dashboard out of search results even if the URL leaks. */
  useEffect(() => {
    document.title = "Editing — quantumeye.in";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const load = useCallback(async (authToken: string) => {
    const file = await readFile(authToken, REPO.contentPath);

    let next: Loaded;
    if (!file) {
      // Nothing published yet: work from the copy compiled into the site, and
      // offer to commit it as the first version.
      next = { published: bundledContent, sha: null, source: "bundled" };
    } else {
      const parsed: unknown = JSON.parse(file.text);
      const content = (parsed as { content?: unknown }).content;
      if (!isPortfolioContent(content)) {
        throw new Error(
          `${REPO.contentPath} is not valid content. Fix or delete it in the repository.`,
        );
      }
      next = { published: content, sha: file.sha, source: "repo" };
    }

    const saved = readDraft(next.sha);
    setLoaded(next);
    setDraft(saved ?? structuredClone(next.published));
    setRestored(saved !== null);
    setCommits(await history(authToken, REPO.contentPath).catch(() => []));
  }, []);

  const signIn = useCallback(
    async (candidate: string, remember: boolean) => {
      setBusy(true);
      setProblem(null);
      const check = await verify(candidate);
      if (!check.ok) {
        setProblem(check.problem ?? "That token did not work.");
        setBusy(false);
        return;
      }
      try {
        await load(candidate.trim());
        if (remember) storeToken(candidate.trim());
        setToken(candidate.trim());
        setAccount(check.account ?? null);
        setPhase("ready");
      } catch (err) {
        setProblem((err as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  /* A token from a previous visit signs you straight in. */
  useEffect(() => {
    const saved = storedToken();
    if (!saved) {
      setPhase("signed-out");
      return;
    }
    void (async () => {
      const check = await verify(saved);
      if (!check.ok) {
        clearToken();
        setProblem(check.problem ?? null);
        setPhase("signed-out");
        return;
      }
      try {
        await load(saved);
        setToken(saved);
        setAccount(check.account ?? null);
        setPhase("ready");
      } catch (err) {
        setProblem((err as Error).message);
        setPhase("signed-out");
      }
    })();
  }, [load]);

  const signOut = () => {
    clearToken();
    setToken("");
    setAccount(null);
    setLoaded(null);
    setDraft(null);
    setPhase("signed-out");
  };

  const dirty =
    loaded !== null &&
    draft !== null &&
    JSON.stringify(draft) !== JSON.stringify(loaded.published);

  const edit = (key: keyof PortfolioContent, value: unknown) => {
    if (!draft || !loaded) return;
    const next = { ...draft, [key]: value } as PortfolioContent;
    setDraft(next);
    saveDraft(loaded.sha, next);
    setProblems([]);
    setRestored(false);
  };

  const discard = () => {
    if (!loaded) return;
    setDraft(structuredClone(loaded.published));
    dropDraft();
    setProblems([]);
    setRestored(false);
  };

  const publish = async () => {
    if (!draft || !loaded) return;

    // The site's own rules, enforced before anything reaches it.
    const found = validate(draft);
    setProblems(found);
    if (found.length) return;

    setBusy(true);
    setProblem(null);
    try {
      const summary = describeChanges(loaded.published, draft);
      const message = note.trim() ? `${summary}\n\n${note.trim()}` : summary;

      const payload = JSON.stringify(
        {
          shape: CONTENT_SHAPE,
          publishedAt: new Date().toISOString(),
          content: draft,
        },
        null,
        2,
      );

      const sha = await writeFile(token, {
        path: REPO.contentPath,
        text: payload,
        message,
        sha: loaded.sha ?? undefined,
      });

      setLoaded({ published: structuredClone(draft), sha, source: "repo" });
      dropDraft();
      setNote("");
      setCommits(await history(token, REPO.contentPath).catch(() => []));
    } catch (err) {
      setProblem(explainWriteFailure(err));
    } finally {
      setBusy(false);
    }
  };

  if (phase === "checking") {
    return <Centered>Checking your session…</Centered>;
  }

  if (phase === "signed-out") {
    return (
      <SignIn
        token={token}
        setToken={setToken}
        onSubmit={signIn}
        busy={busy}
        problem={problem}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ground text-ink">
      <header className="sticky top-0 z-10 border-b border-rule bg-ground/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
          <span className="label-mono text-accent-text">Editing</span>
          <span className="text-[0.95rem] font-medium">
            {REPO.owner}/{REPO.name}
          </span>
          <span className="label-mono text-ink-faint">
            {dirty
              ? "unpublished changes"
              : loaded?.source === "repo"
                ? "published"
                : "not published yet"}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {account && (
              <span className="label-mono mr-1 text-ink-faint">{account.login}</span>
            )}
            {dirty && (
              <button
                type="button"
                onClick={discard}
                className="label-mono h-9 rounded-full border border-rule px-3 transition-colors hover:border-ink"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={publish}
              disabled={busy || (!dirty && loaded?.source === "repo")}
              className="h-9 rounded-full bg-ink px-4 text-[0.85rem] font-medium text-ground transition-opacity disabled:opacity-40"
            >
              {busy
                ? "Publishing…"
                : loaded?.source === "repo"
                  ? "Publish"
                  : "Publish the current content"}
            </button>
            <a
              href="/"
              className="label-mono rounded-full border border-rule px-3 py-1.5 transition-colors hover:border-ink"
            >
              View site
            </a>
            <button
              type="button"
              onClick={signOut}
              className="label-mono rounded-full border border-rule px-3 py-1.5 transition-colors hover:border-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Content sections">
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.9rem] transition-colors ${
                    active === s.key
                      ? "bg-surface font-medium text-ink"
                      : "text-ink-soft hover:bg-surface/60"
                  }`}
                >
                  {s.label}
                  <span className="label-mono tnum text-ink-faint">
                    {Array.isArray(draft?.[s.key]) ? (draft[s.key] as unknown[]).length : "1"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {problem && (
            <p className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-[0.88rem] leading-relaxed text-accent-text">
              {problem}
            </p>
          )}

          {restored && (
            <p className="rounded-xl border border-rule bg-surface px-4 py-3 text-[0.88rem] text-ink-soft">
              Picked up an unpublished draft from this browser. Publish it, or
              Discard to go back to what is live.
            </p>
          )}

          {problems.length > 0 && (
            <div className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-3">
              <p className="label-mono mb-2 text-accent-text">
                Fix before publishing
              </p>
              <ul className="space-y-1.5">
                {problems.map((p, i) => (
                  <li
                    key={i}
                    className="text-[0.86rem] leading-relaxed text-accent-text"
                  >
                    <span className="font-medium">
                      {p.section} · {p.where}
                    </span>{" "}
                    {p.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <section className="rounded-xl border border-rule p-5">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[1.05rem]">{specFor(active).label}</h2>
              <span className="label-mono text-ink-faint">
                {specFor(active).shape === "single"
                  ? "one record"
                  : `${(draft?.[active] as unknown[])?.length ?? 0} items`}
              </span>
            </div>

            {draft && (
              <SectionEditor
                spec={specFor(active)}
                value={draft[active]}
                onChange={(next) => edit(active, next)}
              />
            )}
          </section>

          {dirty && (
            <section className="rounded-xl border border-rule p-5">
              <label className="label-mono mb-2 block text-ink-faint">
                Note for the history (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why this change, if it is worth remembering"
                className="h-11 w-full rounded-lg border border-rule bg-ground px-3 text-[0.92rem] outline-none focus:border-ink"
              />
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-faint">
                The note listing what changed is written for you either way.
              </p>
            </section>
          )}

          {loaded?.source === "repo" && (
            <section className="rounded-xl border border-rule p-5">
              <h2 className="mb-3 text-[1.05rem]">Published file</h2>
              <p className="mb-4 text-[0.85rem] leading-relaxed text-ink-soft">
                The live site reads{" "}
                <a
                  href={rawUrl(REPO.contentPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-rule-strong underline-offset-2"
                >
                  this file
                </a>
                .
              </p>
              {commits.length > 0 && (
                <ol className="space-y-2">
                  {commits.map((c) => (
                    <li key={c.sha} className="flex flex-wrap gap-x-3 text-[0.85rem]">
                      <span className="label-mono tnum text-ink-faint">
                        {new Date(c.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-ink-soft">{c.message}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ground text-[0.9rem] text-ink-soft">
      {children}
    </div>
  );
}

function SignIn({
  token,
  setToken,
  onSubmit,
  busy,
  problem,
}: {
  token: string;
  setToken: (v: string) => void;
  onSubmit: (token: string, remember: boolean) => void;
  busy: boolean;
  problem: string | null;
}) {
  const [remember, setRemember] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-5 py-12 text-ink">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(token, remember);
        }}
        className="w-full max-w-md rounded-2xl border border-rule bg-surface/40 p-7"
      >
        <span className="label-mono text-accent-text">quantumeye.in</span>
        <h1 className="mt-3 mb-2 text-[1.5rem] leading-tight">Editing</h1>
        <p className="mb-6 text-[0.9rem] leading-relaxed text-ink-soft">
          Paste a GitHub fine-grained token with access to{" "}
          <span className="font-mono text-[0.85rem]">
            {REPO.owner}/{REPO.name}
          </span>{" "}
          and <span className="font-mono text-[0.85rem]">Contents</span>: read
          and write. It stays in this browser and is sent only to GitHub.
        </p>

        <label htmlFor="token" className="label-mono mb-2 block text-ink-faint">
          Token
        </label>
        <input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="github_pat_…"
          className="mb-4 h-11 w-full rounded-lg border border-rule bg-ground px-3 font-mono text-[0.85rem] outline-none focus:border-ink"
        />

        <label className="mb-5 flex items-center gap-2.5 text-[0.88rem] text-ink-soft">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-[var(--c-accent)]"
          />
          Stay signed in on this machine
        </label>

        {problem && (
          <p className="mb-4 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2.5 text-[0.85rem] text-accent-text">
            {problem}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-full bg-ink text-[0.9rem] font-medium text-ground transition-opacity disabled:opacity-50"
        >
          {busy ? "Checking…" : "Continue"}
        </button>

        <p className="mt-5 text-[0.8rem] leading-relaxed text-ink-faint">
          GitHub → Settings → Developer settings → Fine-grained tokens. Give it
          access to this one repository only. Revoking it there signs this
          dashboard out everywhere, immediately.
        </p>
      </form>
    </div>
  );
}
