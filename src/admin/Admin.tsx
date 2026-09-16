import { useCallback, useEffect, useState } from "react";
import {
  bundledContent,
  CONTENT_SHAPE,
  isPortfolioContent,
  type PortfolioContent,
} from "../data/content";
import {
  history,
  rawUrl,
  readFile,
  REPO,
  writeFile,
  type Account,
  type Commit,
} from "./github";
import { clearToken, storeToken, storedToken, verify } from "./session";

/**
 * The dashboard.
 *
 * Loaded only when the URL asks for it, so none of this - nor the GitHub
 * client - reaches a visitor's bundle. The repository is the database: content
 * is one JSON file, every save is a commit, and the live site reads the file
 * from GitHub's CDN without a rebuild.
 */

type Phase = "checking" | "signed-out" | "ready";

interface Loaded {
  content: PortfolioContent;
  /** Blob sha of content.json, or null when the file does not exist yet. */
  sha: string | null;
  source: "repo" | "bundled";
}

const SECTIONS: { key: keyof PortfolioContent; label: string }[] = [
  { key: "identity", label: "Identity" },
  { key: "contact", label: "Contact" },
  { key: "caseStudies", label: "Work" },
  { key: "explorations", label: "Lab" },
  { key: "roles", label: "Experience" },
  { key: "capabilities", label: "Capabilities" },
  { key: "articles", label: "Writing" },
  { key: "credentials", label: "Education" },
  { key: "clientMarks", label: "Client marks" },
];

function count(content: PortfolioContent, key: keyof PortfolioContent): string {
  const value = content[key];
  return Array.isArray(value) ? String(value.length) : "1";
}

export default function Admin() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [token, setToken] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
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

    if (!file) {
      // Nothing published yet: work from the copy compiled into the site, and
      // offer to commit it as the first version.
      setLoaded({ content: bundledContent, sha: null, source: "bundled" });
    } else {
      const parsed: unknown = JSON.parse(file.text);
      const content = (parsed as { content?: unknown }).content;
      if (!isPortfolioContent(content)) {
        throw new Error(
          `${REPO.contentPath} is not valid content. Fix or delete it in the repository.`,
        );
      }
      setLoaded({ content, sha: file.sha, source: "repo" });
    }

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
    setPhase("signed-out");
  };

  const seed = async () => {
    if (!loaded) return;
    setBusy(true);
    setProblem(null);
    try {
      const payload = JSON.stringify(
        {
          shape: CONTENT_SHAPE,
          publishedAt: new Date().toISOString(),
          content: loaded.content,
        },
        null,
        2,
      );
      const sha = await writeFile(token, {
        path: REPO.contentPath,
        text: payload,
        message: "Publish: seed content from the bundled copy",
        sha: loaded.sha ?? undefined,
      });
      setLoaded({ ...loaded, sha, source: "repo" });
      setCommits(await history(token, REPO.contentPath).catch(() => []));
    } catch (err) {
      setProblem((err as Error).message);
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
            {loaded?.source === "repo" ? "from the repository" : "not published yet"}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {account && (
              <span className="label-mono text-ink-faint">{account.login}</span>
            )}
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
                    {loaded ? count(loaded.content, s.key) : "-"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {problem && (
            <p className="rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-[0.9rem] text-accent-text">
              {problem}
            </p>
          )}

          {loaded?.source === "bundled" && (
            <section className="rounded-xl border border-dashed border-rule-strong p-5">
              <h2 className="mb-2 text-[1.05rem]">Nothing published yet</h2>
              <p className="mb-4 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-soft">
                The site is running on the copy compiled into it. Publishing
                that copy as <code className="font-mono">{REPO.contentPath}</code>{" "}
                makes it the live source, and every later edit becomes a commit
                on top of it. Nothing on the site changes: the words are
                identical.
              </p>
              <button
                type="button"
                onClick={seed}
                disabled={busy}
                className="h-11 rounded-full bg-ink px-5 text-[0.9rem] font-medium text-ground transition-opacity disabled:opacity-50"
              >
                {busy ? "Publishing…" : "Publish the current content"}
              </button>
            </section>
          )}

          <section className="rounded-xl border border-rule p-5">
            <h2 className="mb-1 text-[1.05rem]">
              {SECTIONS.find((s) => s.key === active)?.label}
            </h2>
            <p className="mb-4 text-[0.85rem] text-ink-faint">
              {loaded ? count(loaded.content, active) : "-"} item
              {loaded && count(loaded.content, active) === "1" ? "" : "s"}
            </p>
            <Preview content={loaded?.content} section={active} />
          </section>

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

/** Read-only for now: the editors land on top of this in the next step. */
function Preview({
  content,
  section,
}: {
  content?: PortfolioContent;
  section: keyof PortfolioContent;
}) {
  if (!content) return null;
  const value = content[section];

  if (!Array.isArray(value)) {
    return (
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[12rem_minmax(0,1fr)]">
        {Object.entries(value as unknown as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="label-mono text-ink-faint">{k}</dt>
            <dd className="mb-2 min-w-0 truncate text-[0.9rem] text-ink-soft sm:mb-0">
              {typeof v === "object" && v !== null
                ? JSON.stringify(v)
                : String(v ?? "-")}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <ul className="divide-y divide-rule">
      {(value as unknown as Record<string, unknown>[]).map((item, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-x-3 py-2.5">
          <span className="text-[0.95rem]">
            {String(item.title ?? item.company ?? item.group ?? item.slug ?? i)}
          </span>
          <span className="min-w-0 truncate text-[0.85rem] text-ink-faint">
            {String(item.summary ?? item.position ?? item.blurb ?? item.note ?? "")}
          </span>
        </li>
      ))}
    </ul>
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
