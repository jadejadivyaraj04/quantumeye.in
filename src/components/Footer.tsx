import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { sections } from "../data/portfolio";
import { useContent } from "../lib/content";
import { inView } from "../lib/motion";

/**
 * Footer. The year is computed — the previous build had "© 2025" hardcoded
 * and was still serving it in September 2026.
 */
export default function Footer() {
  const { content } = useContent();
  const { contact, identity } = content;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule bg-surface/60">
      <div className="shell py-14">
        <motion.div
          className="flex flex-col gap-10 sm:flex-row sm:justify-between"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-[34ch]">
            <p className="mb-2 font-display text-[1.15rem] font-semibold tracking-tight">
              {identity.name}
            </p>
            <p className="text-[0.9rem] leading-relaxed text-ink-soft">
              {identity.role} · {identity.location}
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-block text-[0.9rem] break-words text-accent-text underline underline-offset-2"
            >
              {contact.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex min-h-11 items-center text-[0.9rem] text-ink-soft transition-colors hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          <p className="label-mono text-ink-faint">
            © {year} {identity.name}
          </p>
          <a
            href="#top"
            className="group flex h-11 items-center gap-2 text-[0.85rem] text-ink-faint transition-colors hover:text-ink"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-rule transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-ink">
              <ArrowUp size={13} strokeWidth={2.4} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
