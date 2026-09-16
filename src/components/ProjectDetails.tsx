import type { CaseStudy } from "../data/portfolio";

/**
 * Shown in place of a screenshot when a project has no capture.
 *
 * No mock-up, no invented interface — just the facts of the work. A drawn
 * phone screen implies a screenshot exists, and for these projects none
 * does; stating the role and what shipped is both more honest and more
 * useful than a picture of a UI that was never photographed.
 */
export default function ProjectDetails({
  study,
  withConstraint = false,
}: {
  study: CaseStudy;
  /** Compact cards show the constraint nowhere else, so it goes here.
   *  Featured cards already carry it in their narrative column. */
  withConstraint?: boolean;
}) {
  const shown = study.shipped.slice(0, 4);
  const more = study.shipped.length - shown.length;

  return (
    <dl className="flex h-full w-full max-w-[19rem] flex-col self-stretch rounded-xl border border-rule bg-surface/70 p-5">
      <div className="flex items-start gap-3">
        <span
          className="mt-[0.45rem] h-[2px] w-5 shrink-0"
          style={{ background: `hsl(${study.hue} 34% 46%)` }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <dt className="label-mono text-ink-faint">Role</dt>
          <dd className="mt-1 text-[0.95rem] leading-snug font-medium">
            {study.role}
          </dd>
        </div>
      </div>

      <div className="mt-4 border-t border-rule pb-4 pt-4">
        <dt className="label-mono text-ink-faint">What shipped</dt>
        <dd className="mt-2.5">
          <ul className="space-y-2">
            {shown.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span
                  className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full"
                  style={{ background: `hsl(${study.hue} 30% 52%)` }}
                />
                <span className="text-[0.85rem] leading-snug text-ink-soft">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          {more > 0 && (
            <p className="label-mono mt-3 text-ink-faint tnum">
              + {more} more
            </p>
          )}
        </dd>
      </div>

      {withConstraint && (
        <div className="border-t border-rule pt-4">
          <dt className="label-mono text-ink-faint">The hard part</dt>
          <dd className="mt-2 text-[0.85rem] leading-relaxed text-ink-soft">
            {study.constraint}
          </dd>
        </div>
      )}

      {/* Said plainly, rather than papered over with a mock-up. */}
      <p className="label-mono mt-auto border-t border-rule pt-3 text-ink-faint">
        No public capture
      </p>
    </dl>
  );
}
