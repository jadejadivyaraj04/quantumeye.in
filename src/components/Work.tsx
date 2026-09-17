import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { type CaseStudy } from "../data/portfolio";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";
import CaseStudyDialog from "./CaseStudyDialog";
import ProjectVisual from "./ProjectVisual";
import SectionHeading from "./SectionHeading";

/**
 * One Work section. The previous build rendered these same six projects
 * twice — a "Project Gallery" and a "Projects" section — plus three filler
 * cards, so six projects read as padding.
 */
export default function Work() {
  const { content } = useContent();
  const { caseStudies } = content;

  const [openStudy, setOpenStudy] = useState<CaseStudy | null>(null);
  const featured = caseStudies.filter((c) => c.featured);
  const rest = caseStudies.filter((c) => !c.featured);

  return (
    <section id="work" className="scroll-mt-24 band">
      <div className="shell">
        <SectionHeading
          index="01"
          eyebrow="Work"
          title="Built for teams who ship to real users."
          intro="Each opens into what the client needed, what I owned, and the constraint that made it interesting."
        />

        {/* Featured — alternating rows */}
        <div className="space-y-5">
          {featured.map((study, i) => (
            <motion.article
              key={study.slug}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
            >
              <button
                type="button"
                onClick={() => setOpenStudy(study)}
                className="group relative block w-full overflow-hidden rounded-3xl border border-rule bg-surface text-left shadow-card transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-lift motion-reduce:hover:translate-y-0"
              >
                {/* Hue wash, revealed on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(120% 90% at ${
                      i % 2 === 0 ? "12%" : "88%"
                    } 20%, var(--c-accent-soft), transparent 64%)`,
                  }}
                />

                <div
                  className={`relative flex flex-col gap-8 p-6 sm:p-9 md:items-center md:gap-12 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="flex shrink-0 justify-center pb-6 md:pb-0">
                    <motion.div
                      whileHover={{ scale: 1.03, rotate: i % 2 === 0 ? -1.2 : 1.2 }}
                      transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    >
                      <ProjectVisual study={study} size="lg" />
                    </motion.div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="label-mono text-accent-text">{study.client}</span>
                      <span className="h-3 w-px bg-rule-strong" />
                      <span className="label-mono text-ink-faint">
                        {study.industry}
                      </span>
                    </div>

                    <h3 className="mb-3 text-[clamp(1.35rem,3.4vw,2rem)] leading-[1.1]">
                      {study.title}
                    </h3>

                    <p className="mb-5 max-w-[46ch] text-[1rem] leading-relaxed text-ink-soft">
                      {study.summary}
                    </p>

                    <p className="mb-6 max-w-[52ch] border-l-2 border-rule pl-4 text-[0.9rem] leading-relaxed text-ink-faint">
                      {study.constraint}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <span className="inline-flex items-center gap-1.5 text-[0.88rem] font-medium text-accent-text">
                        Read the case study
                        <ArrowRight
                          size={14}
                          strokeWidth={2.4}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                      <ul className="flex flex-wrap gap-1.5">
                        {study.stack.slice(0, 3).map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-rule px-2 py-0.5 font-mono text-[0.7rem] text-ink-faint"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            </motion.article>
          ))}
        </div>

        {/* Remaining three — compact */}
        <motion.div
          className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {rest.map((study) => (
            <motion.article
              key={study.slug}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
              }}
            >
              <button
                type="button"
                onClick={() => setOpenStudy(study)}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-rule bg-surface p-6 text-left shadow-card transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-lift motion-reduce:hover:translate-y-0"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "radial-gradient(80% 100% at 50% 0%, var(--c-accent-soft), transparent)",
                  }}
                />

                <div className="relative mb-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="label-mono block text-accent-text">
                      {study.client}
                    </span>
                    <span className="label-mono mt-1 block text-ink-faint">
                      {study.industry}
                    </span>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule text-ink-faint transition-all duration-300 group-hover:rotate-90 group-hover:border-accent group-hover:text-accent-text">
                    <Plus size={14} strokeWidth={2.4} />
                  </span>
                </div>

                {/* flex-1 so the visual area absorbs the card's slack.
                    Captures and panels differ in height, and without this
                    the difference piles up as dead space above the chips. */}
                <div className="relative mb-6 flex flex-1 items-center justify-center">
                  <ProjectVisual study={study} />
                </div>

                <h3 className="relative mt-2 mb-2 text-[1.15rem] leading-tight">
                  {study.title}
                </h3>
                <p className="relative mb-5 text-[0.9rem] leading-relaxed text-ink-soft">
                  {study.summary}
                </p>

                <ul className="relative mt-auto flex flex-wrap gap-1.5">
                  {study.stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-rule px-2 py-0.5 font-mono text-[0.7rem] text-ink-faint"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </button>
            </motion.article>
          ))}
        </motion.div>
      </div>

      <CaseStudyDialog study={openStudy} onClose={() => setOpenStudy(null)} />
    </section>
  );
}
