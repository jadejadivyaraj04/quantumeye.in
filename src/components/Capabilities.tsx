import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";
import SectionHeading from "./SectionHeading";

/**
 * Capabilities as filterable groups.
 *
 * No percentage bars. "Flutter 95%" is unverifiable, invites the question of
 * what the missing 5% is, and reads more junior than years plus context —
 * so each item carries a tenure or a concrete note instead.
 */
export default function Capabilities() {
  const { content } = useContent();
  const { capabilities } = content;

  const [active, setActive] = useState(0);
  // Falls back rather than throwing: a published file could shorten this list
  // under an index this component is already holding.
  const group = capabilities[active] ?? capabilities[0];
  if (!group) return null;

  return (
    <section id="capabilities" className="scroll-mt-24 border-t border-rule band">
      <div className="shell">
        <SectionHeading
          index="05"
          eyebrow="Capabilities"
          title="What I reach for, and how long I have used it."
        />

        {/* Group selector */}
        <div
          role="tablist"
          aria-label="Capability groups"
          className="-mx-5 mb-10 flex gap-1.5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {capabilities.map((g, i) => {
            const on = i === active;
            return (
              <button
                key={g.group}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setActive(i)}
                className={`relative flex h-11 shrink-0 items-center rounded-full px-4 text-[0.85rem] font-medium whitespace-nowrap transition-colors ${
                  on ? "text-ground" : "text-ink-soft hover:text-ink"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="cap-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span className="relative">{g.group}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                <h3 className="mb-3 text-[1.5rem] leading-tight">
                  {group.group}
                </h3>
                {group.blurb && (
                  <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                    {group.blurb}
                  </p>
                )}
                <p className="label-mono mt-6 text-ink-faint tnum">
                  {String(group.items.length).padStart(2, "0")} items
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.ul
              key={group.group}
              className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.045 } },
                exit: { opacity: 0, transition: { duration: 0.15 } },
              }}
            >
              {group.items.map((item) => (
                <motion.li
                  key={item.name}
                  className="group flex items-baseline justify-between gap-4 bg-ground p-5 transition-colors hover:bg-surface"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.34, ease },
                    },
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-[0.98rem] leading-snug font-medium">
                      {item.name}
                    </p>
                    {item.note && (
                      <p className="mt-1 font-mono text-[0.72rem] leading-snug text-ink-faint">
                        {item.note}
                      </p>
                    )}
                  </div>
                  {item.years !== undefined && (
                    <span className="shrink-0 font-display text-[1.05rem] font-semibold text-ink-faint transition-colors group-hover:text-accent-text tnum">
                      {item.years}
                      <span className="ml-0.5 font-mono text-[0.68rem]">yr</span>
                    </span>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        {/* Full list, so nothing is hidden behind a tab for a crawler or a
            visitor who would rather read it all at once. */}
        <motion.details
          className="mt-10 rounded-xl border border-rule bg-surface/40 px-5 py-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={inView}
          transition={{ duration: 0.4 }}
        >
          <summary className="label-mono cursor-pointer text-ink-soft transition-colors hover:text-ink">
            Show everything at once
          </summary>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((g) => (
              <div key={g.group}>
                <p className="label-mono mb-2.5 text-accent-text">{g.group}</p>
                <ul className="space-y-1.5">
                  {g.items.map((i) => (
                    <li key={i.name} className="text-[0.88rem] text-ink-soft">
                      {i.name}
                      {i.years !== undefined && (
                        <span className="text-ink-faint tnum"> · {i.years} yr</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.details>
      </div>
    </section>
  );
}
