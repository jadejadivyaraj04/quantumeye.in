import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";
import SectionHeading from "./SectionHeading";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * Writing. Tags here are corrected against the article bodies — the
 * previous build tagged the FVM guide "Provider / Bloc / Riverpod" and the
 * Gemini piece "Firestore", which read as auto-filled.
 */
export default function Writing() {
  const { content } = useContent();
  const { articles, contact } = content;

  const sorted = [...articles].sort((a, b) =>
    b.published.localeCompare(a.published),
  );

  return (
    <section
      id="writing"
      className="scroll-mt-24 border-t border-rule bg-surface/40 band"
    >
      <div className="shell">
        <SectionHeading
          index="06"
          eyebrow="Writing"
          title="Notes on Flutter, mostly about shipping it."
          intro="Published on Medium. Release engineering, tooling, and the parts of mobile work that only show up once an app is in front of users."
        />

        <ul className="grid gap-px overflow-hidden rounded-3xl border border-rule bg-rule md:grid-cols-2">
          {sorted.map((a, i) => (
            <motion.li
              key={a.url}
              className="bg-ground"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.45, delay: (i % 2) * 0.06, ease }}
            >
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-full flex-col p-6 transition-colors duration-300 hover:bg-surface sm:p-7"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="label-mono text-ink-faint tnum">
                    {fmt(a.published)}
                  </span>
                  <span className="h-3 w-px bg-rule-strong" />
                  <span className="label-mono text-ink-faint tnum">
                    {a.readMinutes} min
                  </span>
                </div>

                <h3 className="mb-3 text-[1.15rem] leading-snug transition-colors group-hover:text-accent-text sm:text-[1.22rem]">
                  {a.title}
                </h3>

                <p className="mb-6 text-[0.92rem] leading-relaxed text-ink-soft">
                  {a.excerpt}
                </p>

                <div className="mt-auto flex items-end justify-between gap-4">
                  <ul className="flex flex-wrap gap-1.5">
                    {a.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-rule px-2 py-0.5 font-mono text-[0.7rem] text-ink-faint"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule text-ink-faint transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-ground">
                    <ArrowUpRight size={14} strokeWidth={2.4} />
                  </span>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={inView}
          transition={{ duration: 0.4 }}
        >
          <a
            href={contact.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-[0.9rem] font-medium text-ink-soft transition-colors hover:text-accent-text"
          >
            All articles on Medium
            <ArrowUpRight
              size={14}
              strokeWidth={2.3}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
