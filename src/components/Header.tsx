import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { sections } from "../data/portfolio";
import { useContent } from "../lib/content";
import Logo from "./Logo";
import { useActiveSection, useCondensed, useScrolled } from "../lib/hooks";
import { ease } from "../lib/motion";

/**
 * Sticky header. Every nav item is a real anchor with an href — the previous
 * build used click-handling divs, which meant none of the navigation was
 * reachable by keyboard or openable in a new tab.
 */
export default function Header() {
  const { content } = useContent();
  const { identity } = content;
  /* The hero is tracked as well, even though it has no nav item. Without it
     nothing intersects the detection band at the top of the page, the tracker
     holds whatever section you last passed, and the header keeps announcing
     "Lab" while you are looking at the hero. */
  const active = useActiveSection(["top", ...sections.map((s) => s.id)]);
  const scrolled = useScrolled(20);
  /* Past the hero the header condenses: less height, a smaller mark, and the
     name swapped for where you actually are. Coming back to the top restores
     it, which is why the hook has two thresholds rather than one. */
  const condensed = useCondensed();
  const here = sections.find((s) => s.id === active)?.label ?? "";
  const [open, setOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 34,
    restDelta: 0.0005,
  });

  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ground"
      >
        Skip to content
      </a>

      <header
        className={`drop-in fixed inset-x-0 top-0 z-50 transition-colors duration-[650ms] ${
          condensed
            ? "border-b border-transparent"
            : scrolled
              ? "glass border-x-0 border-t-0"
              : "border-b border-transparent"
        }`}
      >
        {/* One element in two shapes, and the change between them has to be
            watchable rather than a swap - so nothing here is content-sized.
            A pill that hugs its content needs width:fit-content, which does
            not interpolate: the bar would jump to pill width and only the
            colour would animate. Both states run on the same track with an
            explicit max-width, so width, padding, colour, radius and shadow
            all travel together. */}
        <nav
          aria-label="Primary"
          className={`mx-auto flex w-full items-center justify-between transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            condensed
              ? "glass-strong mt-2.5 max-w-[calc(100%-1.5rem)] gap-1 rounded-full px-2.5 py-2 shadow-lift md:max-w-[55rem]"
              : "mt-0 max-w-[88rem] rounded-none border-transparent bg-transparent px-5 py-3.5 shadow-none sm:px-7 lg:px-10"
          }`}
        >
          <a
            href="#top"
            className="group flex h-11 items-center gap-2.5 pl-1.5 text-ink"
            aria-label="Back to top"
          >
            <span
              className={`flex items-center transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                condensed ? "scale-[0.84]" : "scale-100"
              }`}
            >
              <Logo />
            </span>

            {/* Name and place, stacked in one cell and crossfaded. The place
                only replaces the name below md, where the nav is behind a
                menu button and nothing else says where you are; beside a
                visible nav it would only repeat the highlighted item. */}
            <span className="grid">
              <span
                className={`col-start-1 row-start-1 font-display text-[0.94rem] font-semibold tracking-tight whitespace-nowrap transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  condensed && here
                    ? "max-md:-translate-y-1.5 max-md:opacity-0"
                    : ""
                }`}
              >
                {identity.firstName}
                <span
                  className={`hidden sm:inline ${
  "text-ink-soft"
                  }`}
                >
                  {" "}
                  {identity.lastName}
                </span>
              </span>

              <span
                className={`label-mono col-start-1 row-start-1 self-center whitespace-nowrap transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
"text-ink-soft"
                } ${
                  condensed && here
                    ? "translate-y-0 opacity-100"
                    : "translate-y-1.5 opacity-0"
                }`}
                aria-hidden={!condensed || !here}
              >
                {here}
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <ul className={`hidden items-center gap-1 md:flex ${condensed ? "px-1" : ""}`}>
            {sections
              .filter((s) => s.id !== "contact")
              .map((s) => {
              const on = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={on ? "true" : undefined}
                    className={`relative flex items-center transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      condensed
                        ? `h-9 px-3 text-[0.82rem] font-medium ${on ? "text-ink" : "text-ink-soft hover:text-ink"}`
                        : `h-11 px-3.5 text-[0.86rem] font-medium ${on ? "text-ink" : "text-ink-soft hover:text-ink"}`
                    }`}
                  >
                    {s.label}
                    {on && (
                      <motion.span
                        layoutId="nav-active"
                        className={`absolute inset-x-2.5 bottom-1.5 h-[2px] rounded-full ${
"bg-accent"
                        }`}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </a>
                  </li>
                );
              })}
          </ul>

          <div className="flex items-center gap-1.5">
            <a
              href="#contact"
              className={`hidden h-9 items-center rounded-full px-4 text-[0.82rem] font-medium transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex ${
                condensed
                  ? "bg-accent text-white hover:brightness-110"
                  : "bg-accent text-white hover:brightness-110"
              }`}
            >
              Contact
            </a>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors md:hidden ${
                condensed
                  ? "text-ink hover:bg-ink/5"
                  : "text-ink-soft hover:bg-surface hover:text-ink"
              }`}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Scroll progress. Pinned to the viewport edge rather than the
            header's underside, because the header stops being a full-width
            bar the moment it becomes a pill. */}
        <motion.div
          className="fixed inset-x-0 top-0 h-[2px] origin-left bg-accent"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />

        {/* Mobile sheet */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="overflow-hidden border-t border-rule bg-ground md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease }}
            >
              <ul className="px-5 py-2">
                {sections.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i + 0.05 }}
                  >
                    <a
                      href={`#${s.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex h-12 items-center justify-between border-b border-rule text-[0.95rem] last:border-0 ${
                        active === s.id ? "text-accent-text" : "text-ink-soft"
                      }`}
                    >
                      {s.label}
                      <span className="label-mono text-ink-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
