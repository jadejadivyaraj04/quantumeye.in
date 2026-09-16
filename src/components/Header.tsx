import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { sections } from "../data/portfolio";
import { useContent } from "../lib/content";
import Logo from "./Logo";
import { useActiveSection, useScrolled } from "../lib/hooks";
import { ease } from "../lib/motion";

/**
 * Sticky header. Every nav item is a real anchor with an href — the previous
 * build used click-handling divs, which meant none of the navigation was
 * reachable by keyboard or openable in a new tab.
 */
export default function Header() {
  const { content } = useContent();
  const { identity } = content;
  const active = useActiveSection(sections.map((s) => s.id));
  const scrolled = useScrolled(20);
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

      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-rule bg-ground/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.15 }}
      >
        <nav
          aria-label="Primary"
          className="shell flex items-center justify-between py-3.5"
        >
          <a
            href="#top"
            className="group flex h-11 items-center gap-2.5 text-ink"
            aria-label="Back to top"
          >
            <Logo />
            <span className="font-display text-[0.94rem] font-semibold tracking-tight">
              {identity.firstName}
              <span className="hidden text-ink-soft sm:inline">
                {" "}
                {identity.lastName}
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 md:flex">
            {sections.map((s) => {
              const on = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={on ? "true" : undefined}
                    className={`relative flex h-11 items-center px-3.5 text-[0.86rem] transition-colors ${
                      on ? "text-ink" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {s.label}
                    {on && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2.5 bottom-1.5 h-[2px] rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5">

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Scroll progress — reads position without adding a widget. */}
        <motion.div
          className="h-[2px] origin-left bg-accent"
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
      </motion.header>
    </>
  );
}
