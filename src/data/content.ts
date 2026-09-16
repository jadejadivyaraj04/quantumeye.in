import {
  articles,
  capabilities,
  caseStudies,
  clientMarks,
  contact,
  credentials,
  explorations,
  identity,
  roles,
  CAREER_START,
  type Article,
  type CapabilityGroup,
  type CaseStudy,
  type Contact,
  type Credential,
  type Exploration,
  type Identity,
  type Role,
} from "./portfolio";

/**
 * The editable half of the site.
 *
 * Everything in here is content a person writes: it will live in Firestore and
 * reach the browser as one published JSON file. Everything NOT in here - the
 * nav order, the EmailJS ids, the derived counts below - stays in code,
 * because it is structure or arithmetic rather than words, and a dashboard
 * that let you type a project count by hand would reintroduce the exact bug
 * this rebuild removed (the old site published four different totals).
 */
export interface PortfolioContent {
  identity: Identity;
  contact: Contact;
  clientMarks: { slug: string; note: string; as?: string }[];
  caseStudies: CaseStudy[];
  roles: Role[];
  explorations: Exploration[];
  capabilities: CapabilityGroup[];
  articles: Article[];
  credentials: Credential[];
}

/**
 * Bumped when the shape changes in a way older published files cannot satisfy.
 * A published file carrying a different number is ignored in favour of the
 * bundled copy, so a half-migrated database can never blank the site.
 */
export const CONTENT_SHAPE = 1;

/** What a published content.json looks like. */
export interface PublishedContent {
  shape: number;
  publishedAt: string;
  content: PortfolioContent;
}

/**
 * The copy compiled into the bundle. It paints instantly, it works with no
 * network, and it is what the site falls back to if the published file is
 * missing, stale in shape, or malformed.
 */
export const bundledContent: PortfolioContent = {
  identity,
  contact,
  clientMarks,
  caseStudies,
  roles,
  explorations,
  capabilities,
  articles,
  credentials,
};

/* ──────────────────────────────────────────────────────── derived ──── */

function yearsSince(iso: string): number {
  const [y, m] = iso.split("-").map(Number);
  const now = new Date();
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  return Math.floor(months / 12);
}

export interface Stats {
  years: number;
  clientProjects: number;
  featured: number;
  technologies: number;
  articles: number;
  industries: number;
}

/**
 * Counted from the content, never typed by hand - the old site had four
 * different project totals in four places against an empty table.
 */
export function deriveStats(c: PortfolioContent): Stats {
  return {
    years: yearsSince(CAREER_START),
    clientProjects: c.caseStudies.length,
    featured: c.caseStudies.filter((s) => s.featured).length,
    technologies: new Set(
      c.capabilities.flatMap((g) => g.items.map((i) => i.name)),
    ).size,
    articles: c.articles.length,
    industries: new Set(c.caseStudies.map((s) => s.industry)).size,
  };
}

export interface ResolvedMark {
  slug: string;
  note: string;
  name: string;
  industry: string;
}

/** Client band names resolved against the case studies, so the two cannot drift. */
export function resolveClientMarks(c: PortfolioContent): ResolvedMark[] {
  return c.clientMarks.map((m) => {
    const study = c.caseStudies.find((s) => s.slug === m.slug);
    return {
      slug: m.slug,
      note: m.note,
      name: m.as ?? study?.client ?? m.slug,
      industry: study?.industry ?? "",
    };
  });
}

/* ─────────────────────────────────────────────────────── validation ──── */

const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Deliberately shallow. This runs in every visitor's browser, so it checks the
 * shape enough to know the file is the right kind of thing and not, say, an
 * HTML error page served with a 200 - a mistake this project has already made
 * once, when a missing asset came back as index.html. Field-level validation
 * belongs in the dashboard, before anything is published.
 */
export function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!isObj(value)) return false;

  const lists = [
    "clientMarks",
    "caseStudies",
    "roles",
    "explorations",
    "capabilities",
    "articles",
    "credentials",
  ] as const;
  if (!lists.every((k) => isArr(value[k]))) return false;

  const { identity: id, contact: ct, caseStudies: cs } = value;
  if (!isObj(id) || typeof id.name !== "string" || !id.name) return false;
  if (!isObj(ct) || typeof ct.email !== "string" || !ct.email) return false;

  // Empty lists are plausible database states and terrible pages. Worse, some
  // sections index into theirs (Capabilities reads capabilities[active]), so a
  // thin publish does not degrade - it throws and takes the page with it. Both
  // of these were found by publishing an empty payload at a running site.
  if (!isArr(cs) || cs.length === 0) return false;
  if (!isArr(value.capabilities) || value.capabilities.length === 0) return false;
  if (!isArr(value.roles) || value.roles.length === 0) return false;
  return cs.every((s) => isObj(s) && typeof s.slug === "string");
}
