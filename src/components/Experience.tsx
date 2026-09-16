import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { formatPeriod, numberWord } from "../data/portfolio";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";
import SectionHeading from "./SectionHeading";

/** Months between two YYYY-MM strings, rendered as a human tenure. */
function tenure(start: string, end: string | null): string {
  const [ys, ms] = start.split("-").map(Number);
  const e = end ? end.split("-").map(Number) : null;
  const now = new Date();
  const ye = e ? e[0] : now.getFullYear();
  const me = e ? e[1] : now.getMonth() + 1;
  const months = (ye - ys) * 12 + (me - ms);
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr${y > 1 ? "s" : ""}`;
  return `${y} yr${y > 1 ? "s" : ""} ${m} mo`;
}

/**
 * Timeline with a rail that draws itself as the section scrolls. Each role
 * carries its own stack — the previous build printed an identical seven-chip
 * fallback on all four, because the per-role column was null.
 */
export default function Experience() {
  const { content } = useContent();
  const { roles } = content;

  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 72%", "end 55%"],
  });
  const railScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  const railOpacity = useTransform(railScale, [0, 0.05], [0, 1]);

  return (
    <section
      id="experience"
      className="relative scroll-mt-24 border-t border-rule bg-surface/40 py-24 sm:py-32"
    >
      <div className="shell">
        <SectionHeading
          index="04"
          eyebrow="Experience"
          title={`${numberWord(roles.length)} roles, one direction of travel.`}
          intro="Junior Android developer to senior Flutter engineer and team lead, without a gap."
        />

        <div ref={railRef} className="relative">
          {/* Rail */}
          <div className="absolute top-2 bottom-2 left-[7px] w-px bg-rule sm:left-[9px]" />
          <motion.div
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-accent sm:left-[9px]"
            style={{ scaleY: railScale, opacity: railOpacity }}
            aria-hidden="true"
          />

          <ol className="space-y-12">
            {roles.map((role, i) => (
              <motion.li
                key={role.company}
                className="relative pl-9 sm:pl-14"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={inView}
                transition={{ duration: 0.5, delay: i * 0.06, ease }}
              >
                {/* Node */}
                <span className="absolute top-1.5 left-0 flex h-[15px] w-[15px] items-center justify-center sm:h-[19px] sm:w-[19px]">
                  <span
                    className={`h-[9px] w-[9px] rounded-full border-2 sm:h-[11px] sm:w-[11px] ${
                      role.end === null
                        ? "border-accent bg-accent"
                        : "border-rule-strong bg-ground"
                    }`}
                  />
                  {role.end === null && (
                    <span className="absolute h-[15px] w-[15px] rounded-full bg-accent/25 motion-safe:animate-ping sm:h-[19px] sm:w-[19px]" />
                  )}
                </span>

                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="label-mono text-ink-faint tnum">
                    {formatPeriod(role.start, role.end)}
                  </span>
                  <span className="label-mono rounded-full bg-surface px-2 py-0.5 text-ink-faint tnum">
                    {tenure(role.start, role.end)}
                  </span>
                  {role.end === null && (
                    <span className="label-mono text-accent-text">Current</span>
                  )}
                </div>

                <h3 className="text-[1.25rem] leading-snug sm:text-[1.4rem]">
                  {role.position}
                </h3>
                <p className="mt-1 text-[0.95rem] text-ink-soft">
                  {role.company} · {role.location}
                </p>

                <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-soft">
                  {role.summary}
                </p>

                {role.achievements.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {role.achievements.map((a) => (
                      <li
                        key={a}
                        className="flex max-w-[58ch] gap-3 text-[0.93rem] text-ink-soft"
                      >
                        <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {a}
                      </li>
                    ))}
                  </ul>
                )}

                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {role.stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-rule bg-ground px-2.5 py-1 font-mono text-[0.68rem] text-ink-soft"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
