import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";

/**
 * The names that carry weight, directly under the hero — on the previous
 * build these were buried inside card body copy three sections down.
 *
 * Four names alone left most of the band empty and said nothing at rest,
 * since the descriptors only appeared on hover. Each is now a column with
 * what it was and which sector, spread across the full measure, and the
 * header answers the obvious question by linking through to the full set.
 */
export default function ClientMarks() {
  const { clientMarks } = useContent();

  const marks = clientMarks;

  return (
    <section
      aria-label="Selected clients"
      className="border-y border-rule bg-surface/60"
    >
      <div className="shell py-10 sm:py-12">
        {/* Eyebrow, a rule that draws itself across the dead space, and the
            link out to the remaining projects. */}
        <motion.div
          className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span
            className="label-mono shrink-0 text-ink-faint"
            variants={{
              hidden: { opacity: 0, x: -6 },
              show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
            }}
          >
            Shipped for
          </motion.span>

          <motion.span
            className="h-px flex-1 origin-left bg-rule-strong"
            variants={{
              hidden: { scaleX: 0 },
              show: { scaleX: 1, transition: { duration: 0.9, ease } },
            }}
          />

          <motion.a
            href="#work"
            className="group label-mono flex shrink-0 items-center gap-1.5 text-accent-text"
            variants={{
              hidden: { opacity: 0, x: 6 },
              show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
            }}
          >
            All projects
            <ArrowDown
              size={11}
              strokeWidth={2.8}
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            />
          </motion.a>
        </motion.div>

        <motion.ul
          className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-10 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr_auto] lg:gap-y-0"
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
        >
          {marks.map((m) => (
            <motion.li
              key={m.slug}
              className="min-w-0 lg:row-span-4 lg:grid lg:grid-rows-subgrid"
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
              }}
            >
              {/* Short accent tick — gives the row rhythm without wrapping
                  every name in yet another bordered card. */}
              <span className="block h-[2px] w-7 bg-accent" aria-hidden="true" />

              <span className="mt-4 block font-display text-[clamp(1.1rem,3.2vw,1.6rem)] leading-[1.1] font-semibold tracking-tight text-balance">
                {m.name}
              </span>

              <span className="mt-2 block text-[0.9rem] leading-snug text-ink-soft">
                {m.note}
              </span>

              <span className="label-mono mt-3 block text-ink-faint">
                {m.industry}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
