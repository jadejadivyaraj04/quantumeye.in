import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { type Exploration } from "../data/portfolio";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";
import ExplorationDialog from "./ExplorationDialog";
import SectionHeading from "./SectionHeading";

/**
 * Self-directed R&D, deliberately not in Work.
 *
 * Work is client delivery with named clients and real users. Mixing these in
 * would cost both: the client grid loses force beside unshipped prototypes,
 * and the prototypes read as if they were pretending. Kept apart and labelled
 * with a status, the same builds read as curiosity instead of padding.
 *
 * Four equal cards, detail behind a dialog. The first pass put everything on
 * the page - question, list, constraint and a capture strip per project - and
 * four of those ran longer than the nine case studies above them. The reading
 * is the same, it just no longer costs three screens of scroll to pass.
 */

/** The tinted lid of a card: the work's own screens, or its stack when there
 *  are none. Never a drawn interface. */
function Lid({ item }: { item: Exploration }) {
  const tint = {
    background: `linear-gradient(168deg, hsl(${item.hue} 44% 94%), hsl(${item.hue} 30% 97.5%))`,
  };

  if (!item.media.length) {
    return (
      <div
        className="relative flex h-[11.5rem] flex-wrap content-center justify-center gap-x-4 gap-y-1.5 overflow-hidden px-8"
        style={tint}
      >
        {item.stack.map((t) => (
          <span
            key={t}
            className="font-mono text-[0.78rem]"
            style={{ color: `hsl(${item.hue} 28% 40% / 0.85)` }}
          >
            {t}
          </span>
        ))}
      </div>
    );
  }

  const wide = item.mediaLayout === "wide";

  return (
    <div className="relative h-[11.5rem] overflow-hidden" style={tint}>
      {wide ? (
        <img
          src={item.media[0].src}
          alt={item.media[0].alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-x-6 top-6 rounded-lg border border-rule shadow-lift"
        />
      ) : (
        <>
          {/* Second screen set behind and lower, so the lid reads as a stack
              of real captures rather than one floating picture. */}
          {item.media[1] && (
            <img
              src={item.media[1].src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute top-12 left-1/2 w-[6.25rem] -translate-x-[115%] rounded-lg border border-rule opacity-70 shadow-card"
            />
          )}
          <img
            src={item.media[0].src}
            alt={item.media[0].alt}
            loading="lazy"
            decoding="async"
            className="absolute top-8 left-1/2 w-[7.25rem] -translate-x-1/2 rounded-xl border border-rule shadow-lift"
          />
          {item.media[2] && (
            <img
              src={item.media[2].src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute top-12 left-1/2 w-[6.25rem] translate-x-[15%] rounded-lg border border-rule opacity-70 shadow-card"
            />
          )}
        </>
      )}
    </div>
  );
}

export default function Lab() {
  const { content } = useContent();
  const { explorations } = content;

  const [open, setOpen] = useState<Exploration | null>(null);

  return (
    <section id="lab" className="scroll-mt-24 py-24 sm:py-32">
      <div className="shell">
        <SectionHeading
          index="02"
          eyebrow="Lab"
          title="Where I find out what the tooling can actually do."
          intro="Self-directed R&D, not client work. Each one started as a question about how much a model can carry on its own; open any of them for what it answered."
        />

        <motion.div
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {explorations.map((item) => (
            <motion.article
              key={item.slug}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(item)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-rule bg-surface/40 text-left transition-all duration-300 hover:-translate-y-1 hover:border-rule-strong hover:shadow-card"
              >
                <Lid item={item} />

                <div className="flex flex-1 flex-col p-5">
                  <span
                    className="label-mono mb-3 self-start rounded-full px-2.5 py-1"
                    style={{
                      color: `hsl(${item.hue} 42% 30%)`,
                      background: `hsl(${item.hue} 40% 46% / 0.12)`,
                    }}
                  >
                    {item.status}
                  </span>

                  <h3 className="mb-2 text-[1.15rem] leading-tight">
                    {item.title}
                  </h3>

                  <p className="mb-5 line-clamp-3 text-[0.88rem] leading-relaxed text-ink-soft">
                    {item.summary}
                  </p>

                  <span className="label-mono mt-auto inline-flex items-center gap-1.5 text-accent-text">
                    What it answered
                    <ArrowRight
                      size={13}
                      strokeWidth={2.4}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </button>
            </motion.article>
          ))}
        </motion.div>
      </div>

      <ExplorationDialog item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
