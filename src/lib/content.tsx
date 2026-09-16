import {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  bundledContent,
  CONTENT_SHAPE,
  deriveStats,
  isPortfolioContent,
  resolveClientMarks,
  type PortfolioContent,
  type ResolvedMark,
  type Stats,
} from "../data/content";

/**
 * Where the page gets its words.
 *
 * The bundled copy renders immediately - no request stands between a visitor
 * and the first paint. The published file (one JSON on Firebase Storage,
 * written by the dashboard) is fetched afterwards and swapped in if it is
 * sound. The public bundle therefore carries no Firebase SDK at all: reading
 * a database from every visitor's browser would cost ~85KB gzip, more than
 * this entire app, and it is how the previous build ended up serving a home
 * address through a public key.
 *
 * With VITE_CONTENT_URL unset the fetch never happens and the site behaves
 * exactly as it did before any of this existed.
 */

const CONTENT_URL = import.meta.env.VITE_CONTENT_URL as string | undefined;
const FETCH_TIMEOUT_MS = 6000;

export type ContentSource = "bundled" | "published";

interface ContentValue {
  content: PortfolioContent;
  stats: Stats;
  clientMarks: ResolvedMark[];
  source: ContentSource;
  /** ISO timestamp of the published file in use, when one is. */
  publishedAt: string | null;
}

function build(
  content: PortfolioContent,
  source: ContentSource,
  publishedAt: string | null,
): ContentValue {
  return {
    content,
    stats: deriveStats(content),
    clientMarks: resolveClientMarks(content),
    source,
    publishedAt,
  };
}

const ContentContext = createContext<ContentValue>(
  build(bundledContent, "bundled", null),
);

async function fetchPublished(signal: AbortSignal) {
  if (!CONTENT_URL) return null;

  const res = await fetch(CONTENT_URL, { signal, cache: "no-cache" });
  if (!res.ok) throw new Error(`content ${res.status}`);

  const payload: unknown = await res.json();
  if (
    typeof payload !== "object" ||
    payload === null ||
    (payload as { shape?: unknown }).shape !== CONTENT_SHAPE
  ) {
    throw new Error("content shape mismatch");
  }

  const { content, publishedAt } = payload as {
    content: unknown;
    publishedAt?: unknown;
  };
  if (!isPortfolioContent(content)) throw new Error("content failed validation");

  return {
    content,
    publishedAt: typeof publishedAt === "string" ? publishedAt : null,
  };
}

/**
 * Last line of defence for a bad publish.
 *
 * Validation checks the shape of a published file; it cannot know that some
 * section indexes into a list, or that a future component will assume a field
 * is there. An empty payload published at a running site did exactly that -
 * one component threw on `capabilities[active]` and React unmounted the whole
 * tree, leaving a blank page. Now a render failure under published content
 * reverts to the bundled copy and the site stays up.
 */
class ContentBoundary extends Component<
  { children: ReactNode; onFailure: () => void; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[content] published copy failed to render:", error, info);
    this.props.onFailure();
  }

  componentDidUpdate(prev: { resetKey: string }) {
    // The provider has swapped back to bundled content: try rendering again.
    if (prev.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    content: PortfolioContent;
    source: ContentSource;
    publishedAt: string | null;
  }>({ content: bundledContent, source: "bundled", publishedAt: null });

  useEffect(() => {
    if (!CONTENT_URL) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetchPublished(controller.signal)
      .then((result) => {
        if (result) {
          setState({
            content: result.content,
            source: "published",
            publishedAt: result.publishedAt,
          });
        }
      })
      .catch((err: unknown) => {
        // Never fatal: the bundled copy is already on screen. A warning is
        // enough, because the failure mode that matters (a bad publish) is
        // caught in the dashboard, not here.
        if ((err as Error)?.name !== "AbortError") {
          console.warn("[content] using bundled copy:", err);
        }
      })
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const revertToBundled = useCallback(() => {
    setState((prev) =>
      prev.source === "bundled"
        ? prev
        : { content: bundledContent, source: "bundled", publishedAt: null },
    );
  }, []);

  const value = useMemo(
    () => build(state.content, state.source, state.publishedAt),
    [state],
  );

  return (
    <ContentContext.Provider value={value}>
      <ContentBoundary
        onFailure={revertToBundled}
        resetKey={`${state.source}:${state.publishedAt ?? ""}`}
      >
        {children}
      </ContentBoundary>
    </ContentContext.Provider>
  );
}

/** Everything a component needs to render: the words, and what follows from them. */
export function useContent(): ContentValue {
  return useContext(ContentContext);
}
