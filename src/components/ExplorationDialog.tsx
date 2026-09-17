import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { Exploration } from "../data/portfolio";
import { useEscape, useScrollLock } from "../lib/hooks";
import { ease } from "../lib/motion";

/**
 * The detail behind a Lab card.
 *
 * The question, what it does and the hard part are worth reading but not worth
 * four screens of scroll in the section itself, which is what the first design
 * turned into. Same dialog pattern as the case studies, tinted with the
 * project's own hue instead of the site accent so Lab stays visibly separate
 * from client work.
 */
export default function ExplorationDialog({
  item,
  onClose,
}: {
  item: Exploration | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = item !== null;

  useScrollLock(open);
  useEscape(onClose, open);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lab-title"
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-rule bg-ground shadow-lift sm:max-h-[88vh] sm:rounded-[28px]"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: 0.34, ease }}
          >
            <div
              className="relative px-6 pt-7 pb-6 sm:px-9 sm:pt-9"
              style={{
                background: `linear-gradient(160deg, hsl(${item.hue} 42% 46% / 0.14), transparent 72%)`,
              }}
            >
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-ground/70 text-ink-soft transition-colors hover:text-ink"
              >
                <X size={16} strokeWidth={2.3} />
              </button>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pr-12">
                <span
                  className="label-mono rounded-full px-2.5 py-1"
                  style={{
                    color: `hsl(${item.hue} 42% 30%)`,
                    background: `hsl(${item.hue} 40% 46% / 0.14)`,
                  }}
                >
                  {item.status}
                </span>
                <span className="label-mono text-ink-faint">Self-directed</span>
              </div>

              <h3
                id="lab-title"
                className="mt-3 text-[clamp(1.5rem,4.5vw,2.2rem)] leading-[1.06]"
              >
                {item.title}
              </h3>
              <p className="mt-2.5 max-w-[56ch] text-[0.95rem] leading-relaxed text-ink-soft">
                {item.summary}
              </p>
            </div>

            <div className="space-y-8 px-6 pt-7 pb-9 sm:px-9">
              <div
                className="border-l-2 pl-4"
                style={{ borderColor: `hsl(${item.hue} 40% 46%)` }}
              >
                <p className="label-mono mb-2 text-ink-faint">The question</p>
                <p className="text-[1.02rem] leading-relaxed">{item.question}</p>
              </div>

              <div>
                <p className="label-mono mb-3 text-ink-faint">What it does</p>
                <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-8">
                  {item.built.map((line) => (
                    <li key={line} className="flex gap-3 text-[0.95rem]">
                      <span
                        className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full"
                        style={{ background: `hsl(${item.hue} 34% 48%)` }}
                      />
                      <span className="text-ink-soft">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="label-mono mb-2 text-ink-faint">The hard part</p>
                <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                  {item.constraint}
                </p>
              </div>

              <div>
                <p className="label-mono mb-3 text-ink-faint">Stack</p>
                <ul className="flex flex-wrap gap-1.5">
                  {item.stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-rule bg-surface px-2.5 py-1 font-mono text-[0.7rem] text-ink-soft"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {item.media.length > 0 && (
                <div>
                  <p className="label-mono mb-3 text-ink-faint">
                    Screens from the build
                  </p>
                  {/* Phone captures tile small and many; browser captures need
                      the width, so they stack one per row. */}
                  <div
                    className={
                      item.mediaLayout === "wide"
                        ? "space-y-4"
                        : "grid grid-cols-2 gap-3 sm:grid-cols-4"
                    }
                  >
                    {item.media.map((shot) => (
                      <img
                        key={shot.src}
                        src={shot.src}
                        alt={shot.alt}
                        loading="lazy"
                        decoding="async"
                        className="block h-auto w-full rounded-xl border border-rule shadow-card"
                      />
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(item.links).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(item.links).map(([k, href]) => (
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
