import type { PortfolioContent } from "../data/content";
import { SECTIONS } from "./schema";

/**
 * What must hold before anything reaches the live site.
 *
 * The site's rules live here rather than in anyone's memory: every capture
 * carries alt text, slugs are unique and referenced marks resolve, and no copy
 * states a project count - the one claim this rebuild removed on purpose,
 * because the old site published four different totals.
 */

type Rec = Record<string, unknown>;

export interface Problem {
  section: string;
  where: string;
  message: string;
}

const COUNT_WORDS =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s+(projects|apps|case studies)\b/i;

export function validate(content: PortfolioContent): Problem[] {
  const problems: Problem[] = [];

  for (const spec of SECTIONS) {
    const value = content[spec.key];
    const records: Rec[] = Array.isArray(value)
      ? (value as unknown as Rec[])
      : [value as unknown as Rec];

    records.forEach((record, i) => {
      const name = String(
        record[spec.titleKey ?? "title"] ?? `item ${i + 1}`,
      );

      for (const field of spec.fields) {
        if (
          "required" in field &&
          field.required &&
          !String(record[field.key] ?? "").trim()
        ) {
          problems.push({
            section: spec.label,
            where: name,
            message: `${field.label} is required.`,
          });
        }

        if (field.kind === "media") {
          const shots = (record[field.key] as { src: string; alt: string }[]) ?? [];
          shots.forEach((shot, s) => {
            if (!shot.src.trim()) {
              problems.push({
                section: spec.label,
                where: name,
                message: `Capture ${s + 1} has no image path.`,
              });
            }
            if (!shot.alt.trim()) {
              problems.push({
                section: spec.label,
                where: name,
                message: `Capture ${s + 1} has no alt text. Describe what the screen shows.`,
              });
            }
          });
        }
      }

      // Prose that states a total. Counts are derived; typing one is how they
      // drift apart.
      for (const [key, raw] of Object.entries(record)) {
        if (typeof raw === "string" && COUNT_WORDS.test(raw)) {
          problems.push({
            section: spec.label,
            where: name,
            message: `"${key}" states a project count. Counts are derived from the data - rephrase without the number.`,
          });
        }
      }
    });
  }

  // Slugs identify records; two of the same silently shadow one another.
  for (const key of ["caseStudies", "explorations"] as const) {
    const seen = new Set<string>();
    for (const record of content[key] as unknown as Rec[]) {
      const slug = String(record.slug ?? "");
      if (seen.has(slug)) {
        problems.push({
          section: key === "caseStudies" ? "Work" : "Lab",
          where: slug,
          message: "Duplicate slug.",
        });
      }
      seen.add(slug);
    }
  }

  // A client mark reads its name and industry from a case study.
  const slugs = new Set(
    (content.caseStudies as unknown as Rec[]).map((s) => String(s.slug)),
  );
  for (const mark of content.clientMarks as unknown as Rec[]) {
    if (!slugs.has(String(mark.slug))) {
      problems.push({
        section: "Client marks",
        where: String(mark.slug),
        message: "No Work item has this slug, so the name cannot resolve.",
      });
    }
  }

  return problems;
}

/**
 * The commit note, written from what actually changed - so the history reads
 * like a log of edits rather than a wall of "update content".
 */
export function describeChanges(
  before: PortfolioContent,
  after: PortfolioContent,
): string {
  const parts: string[] = [];

  for (const spec of SECTIONS) {
    const a = before[spec.key];
    const b = after[spec.key];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;

    if (!Array.isArray(a) || !Array.isArray(b)) {
      parts.push(spec.label);
      continue;
    }

    // Match records by their stable id, not by the field shown in the list:
    // renaming a title is one edit, and matching on the name would log it as a
    // record removed and another added.
    const was = a as unknown as Rec[];
    const now = b as unknown as Rec[];
    const idKey =
      now.some((r) => "slug" in r) || was.some((r) => "slug" in r)
        ? "slug"
        : (spec.titleKey ?? "title");
    const nameKey = spec.titleKey ?? "title";
    const idOf = (r: Rec) => String(r[idKey] ?? r[nameKey] ?? "");
    const nameOf = (r: Rec) => String(r[nameKey] ?? r[idKey] ?? "untitled");

    const wasById = new Map(was.map((r) => [idOf(r), r]));
    const nowById = new Map(now.map((r) => [idOf(r), r]));

    const added = now.filter((r) => !wasById.has(idOf(r))).map(nameOf);
    const removed = was.filter((r) => !nowById.has(idOf(r))).map(nameOf);
    const changed = now
      .filter((r) => {
        const previous = wasById.get(idOf(r));
        return previous !== undefined && JSON.stringify(previous) !== JSON.stringify(r);
      })
      .map(nameOf);

    const bits = [
      ...added.map((n) => `added ${n}`),
      ...removed.map((n) => `removed ${n}`),
      ...changed,
    ];
    parts.push(`${spec.label} — ${bits.join(", ")}`);
  }

  if (!parts.length) return "Publish: no content change";
  return `Publish: ${parts.join("; ")}`.slice(0, 240);
}
