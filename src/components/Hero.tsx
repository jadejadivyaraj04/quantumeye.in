import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, ArrowUpRight, FileText } from "lucide-react";
import { useContent } from "../lib/content";

/**
 * Opening spread.
 *
 * Sized to its content, not the viewport, and the name is set with clamp() —
 * the previous build rendered a fixed 60px h1 that overflowed its own
 * container by 9px on both sides at 375px.
 *
 * No blurred accent glow and no grid field behind the type. Both are the
 * house style of generated portfolio pages; the photograph carries this
 * composition instead.
 *
 * Entrances here are the CSS classes from index.css rather than Framer
 * variants. This is above the fold, and a JS-driven fade that a throttled
 * renderer freezes half-way is the one failure this page cannot afford.
 * Framer keeps the scroll parallax, which degrades to no movement.
 */
export default function Hero() {
  const { content, stats } = useContent();
  const { contact, identity } = content;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const plateY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);

  const words = [identity.firstName, identity.lastName];
  const hasResume = Boolean(identity.resumeUrl);

  const counts = [
    { k: "Years shipping", v: stats.years },
    { k: "Technologies", v: stats.technologies },
    { k: "Articles", v: stats.articles },
  ];

  return (
    <section id="top" ref={ref} className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-28">
      <div className="shell">
        <div className="grid items-start gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16">
          {/* ── Type column ────────────────────────────────────────── */}
          <div className="min-w-0">
            {/* The dot must not stop the label wrapping: it sits in its own
                non-shrinking cell and the text gets min-w-0, so on a narrow
                phone this runs to two lines instead of one long line. */}
            <div
              className="rise mb-7 flex items-start gap-2"
              style={{ animationDelay: "0.15s" }}
            >
              <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-ok animate-soft-pulse" />
              <span className="label-mono min-w-0 leading-[1.5] text-ink-soft">
                {identity.availableNote}
              </span>
            </div>

            <h1 className="mb-8 font-display text-[clamp(2.7rem,9.2vw,5.4rem)] leading-[0.94] font-bold tracking-[-0.042em]">
              {words.map((word, i) => (
                <span key={word} className="block overflow-hidden pb-[0.05em]">
                  <span
                    className="mask-up block"
                    style={{ animationDelay: `${0.24 + i * 0.1}s` }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h1>

            <div className="rise" style={{ animationDelay: "0.56s" }}>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-9 bg-accent" />
                <p className="label-mono text-accent-text">{identity.role}</p>
              </div>

              <p className="mb-9 max-w-[42ch] text-[1.08rem] leading-[1.6] text-ink-soft sm:text-[1.18rem]">
                {identity.positioning}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={identity.resumeUrl ?? "#contact"}
                  {...(hasResume ? { download: true } : {})}
                  className="group relative flex h-12 items-center gap-2.5 overflow-hidden rounded-full bg-ink px-6 text-[0.9rem] font-medium text-ground"
                >
                  <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0" />
                  <FileText size={15} className="relative" strokeWidth={2.2} />
                  <span className="relative">
                    {hasResume ? "Download résumé" : "Request résumé"}
                  </span>
                </a>

                <a
                  href="#work"
                  className="group flex h-12 items-center gap-2 rounded-full border border-rule-strong px-6 text-[0.9rem] font-medium transition-colors hover:border-ink"
                >
                  See the work
                  <ArrowDown
                    size={15}
                    strokeWidth={2.2}
                    className="transition-transform duration-300 group-hover:translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* ── Portrait ───────────────────────────────────────────── */}
          <motion.figure
            className="fade m-0 max-w-[24rem] lg:max-w-none lg:pt-2"
            style={{ y: plateY }}
          >
            <div className="studio-plate relative overflow-hidden rounded-[1.75rem] shadow-plate">
              <img
                src="/portrait.jpg"
                srcSet="/portrait-sm.jpg 668w, /portrait.jpg 1336w"
                sizes="(max-width: 1023px) calc(100vw - 2.5rem), 27rem"
                width={1336}
                height={1400}
                alt="Divyarajsinh Jadeja"
                fetchPriority="high"
                decoding="async"
                className="block aspect-[5/6] w-full object-cover object-[50%_12%]"
              />
              {/* Barely-there falloff at the base, following the direction the
                  photograph's own backdrop already darkens. Kept light: any
                  heavier and it greys out his forearms. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#b9aea9]/20"
              />
            </div>

            {/* Magazine-style credit line. */}
            <figcaption className="mt-3.5 flex items-baseline justify-between gap-4">
              <span className="label-mono text-ink-faint">
                {identity.location}
              </span>
              <span className="label-mono text-ink-faint tnum">
                {identity.timezone}
              </span>
            </figcaption>
          </motion.figure>
        </div>

        {/* ── Derived counts ───────────────────────────────────────── */}
        <dl className="mt-16 grid grid-cols-3 gap-x-5 gap-y-8 border-t border-rule pt-9 sm:mt-20 sm:gap-x-6">
          {counts.map((s, i) => (
            <div
              key={s.k}
              className="rise"
              style={{ animationDelay: `${0.8 + i * 0.08}s` }}
            >
              <dd className="font-display text-[2.2rem] leading-none font-bold tracking-tight tnum">
                {s.v}
              </dd>
              <dt className="label-mono mt-2.5 text-ink-faint">{s.k}</dt>
            </div>
          ))}
        </dl>

        {/* Dated line — the cheapest proof the site is maintained. The old
            footer still read 2025 in September 2026. */}
        <div
          className="rise mt-14 flex max-w-3xl items-start gap-4 border-l-2 border-accent pl-5"
          style={{ animationDelay: "1.05s" }}
        >
          <p className="text-[0.97rem] leading-relaxed text-ink-soft">
            <span className="label-mono mr-2 text-accent-text">Now</span>
            {identity.currently.note}{" "}
            <span className="label-mono ml-1 whitespace-nowrap text-ink-faint">
              {identity.currently.since}
            </span>
          </p>
        </div>

        <a
          href={`mailto:${contact.email}`}
          className="rise group mt-9 inline-flex items-center gap-1.5 text-[0.9rem] text-ink-soft transition-colors hover:text-accent-text"
          style={{ animationDelay: "1.2s" }}
        >
          Or just email me
          <ArrowUpRight
            size={14}
            strokeWidth={2.2}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </section>
  );
}
