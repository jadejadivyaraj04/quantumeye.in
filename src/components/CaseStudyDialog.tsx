import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { CaseStudy } from "../data/portfolio";
import { useEscape, useScrollLock } from "../lib/hooks";
import { ease } from "../lib/motion";
import ProjectVisual from "./ProjectVisual";

/**
 * Full case study in a dialog. The five-part structure — problem, role,
 * constraint, shipped, result — is the whole point: the previous build gave
 * each project one sentence naming the technology and nothing else.
 *
 * `outcome` is null across the board until real numbers land, so the Result
 * block renders a stated gap rather than an invented figure.
 */
export default function CaseStudyDialog({
  study,
  onClose,
}: {
  study: CaseStudy | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = study !== null;

  const shots = study?.media ?? [];
  const [shot, setShot] = useState(0);
  useEffect(() => setShot(0), [study?.slug]);

  useScrollLock(open);
  useEscape(onClose, open);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {study && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cs-title"
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-rule bg-ground shadow-lift sm:max-h-[88vh] sm:rounded-3xl"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: 0.34, ease }}
          >
            {/* Header band tinted with the project's own hue */}
            <div
              className="relative overflow-hidden px-6 pt-7 pb-6 sm:px-9 sm:pt-9"
              style={{
                background: "linear-gradient(160deg, var(--c-accent-soft), transparent 72%)",
              }}
            >
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-ground/70 text-ink-soft transition-colors hover:text-ink"
              >
                <X size={16} strokeWidth={2.3} />
              </button>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pr-12">
                <span className="label-mono text-accent-text">
                  {study.client}
                </span>
                <span className="label-mono text-ink-faint">
                  {study.industry}
                </span>
                {study.period && (
                  <span className="label-mono text-ink-faint">
                    {study.period}
                  </span>
                )}
              </div>

              <h3
                id="cs-title"
                className="mt-3 text-[clamp(1.5rem,4.5vw,2.2rem)] leading-[1.06]"
              >
                {study.title}
              </h3>
              <p className="mt-2.5 text-[0.9rem] text-ink-soft">{study.role}</p>
            </div>

            <div className="grid gap-9 px-6 pt-2 pb-9 sm:px-9 md:grid-cols-[1fr_auto] md:gap-12">
              <div className="order-2 min-w-0 space-y-7 md:order-1">
                <Block label="Problem">{study.problem}</Block>
                <Block label="My role">{study.contribution}</Block>
                <Block label="Constraint" accent>
                  {study.constraint}
                </Block>

                <div>
                  <p className="label-mono mb-3 text-ink-faint">What shipped</p>
                  <ul className="space-y-2">
                    {study.shipped.map((s) => (
                      <li key={s} className="flex gap-3 text-[0.95rem]">
                        <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span className="text-ink-soft">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="label-mono mb-3 text-ink-faint">Result</p>
                  {study.outcome ? (
                    <p className="text-[0.95rem] text-ink-soft">
                      {study.outcome}
                    </p>
                  ) : (
                    <p className="rounded-lg border border-dashed border-rule-strong px-4 py-3 text-[0.88rem] text-ink-faint">
                      Not yet published - a verifiable number goes here.
                    </p>
                  )}
                </div>

                <div>
                  <p className="label-mono mb-3 text-ink-faint">Stack</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {study.stack.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-rule bg-surface px-2.5 py-1 font-mono text-[0.7rem] text-ink-soft"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {(study.links.store || study.links.play || study.links.site) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(study.links).map(([k, href]) => (
                      <a
                        key={k}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center gap-1.5 rounded-full border border-rule-strong px-4 text-[0.85rem] transition-colors hover:border-ink"
                      >
                        {k === "store"
                          ? "App Store"
                          : k === "play"
                            ? "Google Play"
                            : k === "repo"
                              ? "Repository"
                              : "Website"}
                        <ArrowUpRight size={13} strokeWidth={2.3} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="order-1 flex flex-col items-center gap-4 md:order-2 md:pt-4">
                {shots.length > 0 ? (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-rule bg-studio shadow-plate">
                      <img
                        key={shots[shot].src}
                        src={shots[shot].src}
                        alt={shots[shot].alt}
                        width={600}
                        height={1299}
                        loading="lazy"
                        decoding="async"
                        className="fade block w-[14rem] sm:w-[15rem] md:w-[15.5rem]"
                      />
                    </div>

                    {shots.length > 1 && (
                      <div
                        className="flex gap-2"
                        role="tablist"
                        aria-label={`${study.title} screenshots`}
                      >
                        {shots.map((m, i) => (
                          <button
                            key={m.src}
                            type="button"
                            role="tab"
                            aria-selected={i === shot}
                            aria-label={`Screenshot ${i + 1} of ${shots.length}`}
                            onClick={() => setShot(i)}
                            className={`h-[5.75rem] w-12 overflow-hidden rounded-md border transition-all duration-200 ${
                              i === shot
                                ? "border-accent ring-2 ring-accent/25"
                                : "border-rule opacity-55 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={m.src}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <ProjectVisual study={study} size="lg" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Block({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={accent ? "border-l-2 border-accent pl-4" : undefined}>
      <p className="label-mono mb-2 text-ink-faint">{label}</p>
      <p className="text-[0.98rem] leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
