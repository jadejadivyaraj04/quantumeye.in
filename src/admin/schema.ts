import type { PortfolioContent } from "../data/content";

/**
 * What each section contains, described once.
 *
 * The editors are generated from this rather than hand-written nine times, so
 * adding a field to the site means adding one line here - and the dashboard
 * cannot drift out of step with the data it edits.
 *
 * Deliberately absent: anything derived. There is no field for a project
 * count, years of experience or technology total, because those are computed
 * from the content itself (see deriveStats). A dashboard that let you type
 * them is exactly how the previous site ended up publishing four different
 * totals.
 */

export type Field =
  | { kind: "text"; key: string; label: string; help?: string; required?: boolean }
  | { kind: "textarea"; key: string; label: string; rows?: number; help?: string }
  | { kind: "number"; key: string; label: string; help?: string }
  | { kind: "bool"; key: string; label: string; help?: string }
  | { kind: "select"; key: string; label: string; options: string[]; help?: string }
  | { kind: "list"; key: string; label: string; help?: string; placeholder?: string }
  | { kind: "media"; key: string; label: string; help?: string }
  | { kind: "links"; key: string; label: string; help?: string }
  | { kind: "group"; key: string; label: string; fields: Field[] }
  | { kind: "items"; key: string; label: string; fields: Field[]; help?: string };

export interface SectionSpec {
  key: keyof PortfolioContent;
  label: string;
  /** A single object (identity) or a list of records (case studies). */
  shape: "single" | "collection";
  /** Which field titles a row in the list. */
  titleKey?: string;
  /** Secondary text on a row. */
  subtitleKey?: string;
  fields: Field[];
  /** Blank record used by "Add". */
  blank?: () => Record<string, unknown>;
}

const HUE_HELP = "0-360. Tints that project's accents. Green 160, violet 280.";

export const SECTIONS: SectionSpec[] = [
  {
    key: "identity",
    label: "Identity",
    shape: "single",
    fields: [
      { kind: "text", key: "name", label: "Name", required: true },
      { kind: "text", key: "firstName", label: "First name" },
      { kind: "text", key: "lastName", label: "Last name" },
      { kind: "text", key: "role", label: "Role", required: true },
      {
        kind: "textarea",
        key: "positioning",
        label: "Positioning",
        rows: 3,
        help: "The hero sentence. Name clients; avoid adjectives.",
      },
      { kind: "text", key: "location", label: "Location" },
      { kind: "text", key: "timezone", label: "Timezone" },
      { kind: "text", key: "availableNote", label: "Availability note" },
      { kind: "text", key: "portraitUrl", label: "Portrait URL" },
      {
        kind: "text",
        key: "resumeUrl",
        label: "Résumé URL",
        help: "Empty shows a Request résumé button instead of a download.",
      },
      {
        kind: "group",
        key: "currently",
        label: "Currently",
        fields: [
          { kind: "textarea", key: "note", label: "What you are working on", rows: 3 },
          { kind: "text", key: "since", label: "Since" },
        ],
      },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    shape: "single",
    fields: [
      { kind: "text", key: "email", label: "Email", required: true },
      { kind: "text", key: "phone", label: "Phone" },
      {
        kind: "text",
        key: "location",
        label: "Location",
        help: "City and region only. Never a street address - this file is public.",
      },
      { kind: "text", key: "linkedin", label: "LinkedIn" },
      { kind: "text", key: "github", label: "GitHub" },
      { kind: "text", key: "medium", label: "Medium" },
    ],
  },
  {
    key: "caseStudies",
    label: "Work",
    shape: "collection",
    titleKey: "title",
    subtitleKey: "client",
    blank: () => ({
      slug: "",
      title: "",
      client: "",
      role: "",
      industry: "",
      period: null,
      featured: false,
      summary: "",
      problem: "",
      contribution: "",
      constraint: "",
      shipped: [],
      outcome: null,
      stack: [],
      hue: 200,
      media: [],
      links: {},
    }),
    fields: [
      { kind: "text", key: "slug", label: "Slug", required: true, help: "Lowercase, hyphenated. Used as the record's id." },
      { kind: "text", key: "title", label: "Title", required: true },
      { kind: "text", key: "client", label: "Client", required: true },
      { kind: "text", key: "role", label: "Your role" },
      { kind: "text", key: "industry", label: "Industry" },
      { kind: "text", key: "period", label: "Period" },
      { kind: "bool", key: "featured", label: "Featured", help: "Featured projects get the wide rows at the top of Work." },
      { kind: "textarea", key: "summary", label: "Summary", rows: 2, help: "One line for the card face." },
      { kind: "textarea", key: "problem", label: "Problem", rows: 4 },
      { kind: "textarea", key: "contribution", label: "What you owned", rows: 4 },
      { kind: "textarea", key: "constraint", label: "The constraint", rows: 4, help: "The engineering problem that earns the read." },
      { kind: "list", key: "shipped", label: "What shipped", placeholder: "One item per line" },
      { kind: "textarea", key: "outcome", label: "Result", rows: 2, help: "A verifiable number, or leave empty." },
      { kind: "list", key: "stack", label: "Stack" },
      { kind: "number", key: "hue", label: "Hue", help: HUE_HELP },
      { kind: "media", key: "media", label: "Captures" },
      { kind: "links", key: "links", label: "Links" },
    ],
  },
  {
    key: "explorations",
    label: "Lab",
    shape: "collection",
    titleKey: "title",
    subtitleKey: "status",
    blank: () => ({
      slug: "",
      title: "",
      status: "R&D prototype",
      summary: "",
      question: "",
      built: [],
      constraint: "",
      stack: [],
      hue: 200,
      mediaLayout: "phones",
      media: [],
      links: {},
    }),
    fields: [
      { kind: "text", key: "slug", label: "Slug", required: true },
      { kind: "text", key: "title", label: "Title", required: true },
      {
        kind: "select",
        key: "status",
        label: "Status",
        options: ["R&D prototype", "In progress", "Published"],
        help: "Shown as the chip. Says plainly how far it got.",
      },
      { kind: "textarea", key: "summary", label: "Summary", rows: 3 },
      { kind: "textarea", key: "question", label: "The question", rows: 3, help: "What the build set out to answer." },
      { kind: "list", key: "built", label: "What it does" },
      { kind: "textarea", key: "constraint", label: "The hard part", rows: 5 },
      { kind: "list", key: "stack", label: "Stack" },
      { kind: "number", key: "hue", label: "Hue", help: HUE_HELP },
      {
        kind: "select",
        key: "mediaLayout",
        label: "Capture layout",
        options: ["phones", "wide"],
        help: "phones: a strip of phone screens. wide: browser captures, two up.",
      },
      { kind: "media", key: "media", label: "Captures" },
      { kind: "links", key: "links", label: "Links" },
    ],
  },
  {
    key: "roles",
    label: "Experience",
    shape: "collection",
    titleKey: "company",
    subtitleKey: "position",
    blank: () => ({
      company: "",
      position: "",
      location: "",
      start: "",
      end: null,
      summary: "",
      achievements: [],
      stack: [],
    }),
    fields: [
      { kind: "text", key: "company", label: "Company", required: true },
      { kind: "text", key: "position", label: "Position", required: true },
      { kind: "text", key: "location", label: "Location" },
      { kind: "text", key: "start", label: "Start", required: true, help: "YYYY-MM, e.g. 2023-11" },
      { kind: "text", key: "end", label: "End", help: "YYYY-MM, or empty for Present" },
      { kind: "textarea", key: "summary", label: "Summary", rows: 3 },
      { kind: "list", key: "achievements", label: "Achievements" },
      { kind: "list", key: "stack", label: "Stack" },
    ],
  },
  {
    key: "capabilities",
    label: "Capabilities",
    shape: "collection",
    titleKey: "group",
    subtitleKey: "blurb",
    blank: () => ({ group: "", blurb: "", items: [] }),
    fields: [
      { kind: "text", key: "group", label: "Group", required: true },
      { kind: "text", key: "blurb", label: "Blurb" },
      {
        kind: "items",
        key: "items",
        label: "Technologies",
        help: "Years or a note, never a percentage.",
        fields: [
          { kind: "text", key: "name", label: "Name", required: true },
          { kind: "number", key: "years", label: "Years" },
          { kind: "text", key: "note", label: "Note" },
        ],
      },
    ],
  },
  {
    key: "articles",
    label: "Writing",
    shape: "collection",
    titleKey: "title",
    subtitleKey: "published",
    blank: () => ({
      title: "",
      excerpt: "",
      url: "",
      published: "",
      readMinutes: 5,
      tags: [],
    }),
    fields: [
      { kind: "text", key: "title", label: "Title", required: true },
      { kind: "textarea", key: "excerpt", label: "Excerpt", rows: 3 },
      { kind: "text", key: "url", label: "URL", required: true },
      { kind: "text", key: "published", label: "Published", help: "YYYY-MM-DD" },
      { kind: "number", key: "readMinutes", label: "Read minutes" },
      { kind: "list", key: "tags", label: "Tags" },
    ],
  },
  {
    key: "credentials",
    label: "Education",
    shape: "collection",
    titleKey: "qualification",
    subtitleKey: "institution",
    blank: () => ({
      institution: "",
      qualification: "",
      field: "",
      graduated: "",
      location: "",
      affiliation: "",
    }),
    fields: [
      { kind: "text", key: "qualification", label: "Qualification", required: true },
      { kind: "text", key: "field", label: "Field" },
      { kind: "text", key: "institution", label: "Institution", required: true },
      { kind: "text", key: "affiliation", label: "Awarding university" },
      { kind: "text", key: "graduated", label: "Graduated" },
      { kind: "text", key: "location", label: "Location" },
    ],
  },
  {
    key: "clientMarks",
    label: "Client marks",
    shape: "collection",
    titleKey: "slug",
    subtitleKey: "note",
    blank: () => ({ slug: "", note: "", as: "" }),
    fields: [
      {
        kind: "text",
        key: "slug",
        label: "Case study slug",
        required: true,
        help: "Must match a Work slug - the name and industry are read from it.",
      },
      { kind: "text", key: "note", label: "Note" },
      { kind: "text", key: "as", label: "Display name", help: "Overrides the client name from the case study." },
    ],
  },
];

export function specFor(key: keyof PortfolioContent): SectionSpec {
  const spec = SECTIONS.find((s) => s.key === key);
  if (!spec) throw new Error(`No editor defined for ${String(key)}`);
  return spec;
}
