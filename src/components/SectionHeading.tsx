import { motion } from "framer-motion";
import { inView } from "../lib/motion";

/**
 * Section heading with a rule that draws itself in. The index is real
 * information — sections are ordered by what a visitor should read first —
 * so numbering them encodes the order rather than decorating it.
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
}: {
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mb-12">
      <motion.div
        className="mb-5 flex items-center gap-4"
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.span
          className="label-mono text-accent-text"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          {index} - {eyebrow}
        </motion.span>
        <motion.span
          className="h-px flex-1 origin-left bg-rule"
          variants={{
            hidden: { scaleX: 0 },
            show: {
              scaleX: 1,
              transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        />
      </motion.div>

      <motion.h2
        className="max-w-3xl text-[clamp(1.75rem,4.2vw,2.85rem)] leading-[1.08]"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={inView}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {title}
      </motion.h2>

      {intro && (
        <motion.p
          className="mt-4 max-w-[62ch] text-ink-soft"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {intro}
        </motion.p>
      )}
    </div>
  );
}
