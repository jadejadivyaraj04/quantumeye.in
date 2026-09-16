import { motion } from "framer-motion";
import { FileText, Github, Linkedin, PenLine } from "lucide-react";
import { numberWord } from "../data/portfolio";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";
import SectionHeading from "./SectionHeading";

/**
 * About. Credentials fold in here rather than taking their own nav entry,
 * and there is no embedded contact block — the old build duplicated the
 * whole "Get In Touch" panel inside this section.
 */
export default function About() {
  const { content, stats } = useContent();
  const { contact, credentials, identity } = content;

  const links = [
    { href: contact.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: contact.github, label: "GitHub", Icon: Github },
    { href: contact.medium, label: "Medium", Icon: PenLine },
  ];

  return (
    <section id="about" className="scroll-mt-24 border-t border-rule band">
      <div className="shell">
        <SectionHeading
          index="03"
          eyebrow="About"
          title={`${numberWord(stats.years)} years, one platform bet.`}
        />

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
          <div className="max-w-[64ch]">
            <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink-soft">
              <p>
                I started in 2019 as a junior Android developer writing Java,
                and spent the next three years moving my team's delivery onto
                Flutter - two codebases down to one. That migration is the
                thread through everything since: I care about the decisions
                that hold up after the original author has moved on.
              </p>
              <p>
                Since then I have led mobile delivery at{" "}
                <span className="text-ink">BytesTechnolab</span>, run a team at
                Intelivita, and shipped client work for Nike, BBC Earth,
                Heracles Almelo and the Maryland Transit Administration. The
                problems I like are the ones where the platform fights back -
                streaming studio video over raw UDP and TCP, compositing
                full-resolution photos on mid-range Android, and turning an
                authority's print timetables into something usable at a bus
                stop.
              </p>
              <p>
                Lately most of my attention goes to release engineering:
                out-of-band updates with Shorebird, pinned toolchains with FVM,
                build-time configuration instead of hardcoded environments. It
                is unglamorous and it is the difference between shipping
                weekly and shipping when the store lets you.
              </p>
              <p>
                The newer thread is on-device AI, and not a chatbot bolted onto
                a screen. A Gemma model that turns a photographed prescription
                into a dose schedule with no account and no server. A ledger
                that refuses any amount the model cannot point to in the OCR
                text it came from. A storefront answering inside ChatGPT
                through an MCP server. The interesting part is never the model
                - it is what you are still willing to promise once it is wrong.
              </p>
            </div>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.5, ease }}
            >
              <a
                href={identity.resumeUrl ?? "#contact"}
                {...(identity.resumeUrl ? { download: true } : {})}
                className="flex h-11 items-center gap-2 rounded-full border border-rule-strong px-5 text-[0.88rem] font-medium transition-colors hover:border-ink"
              >
                <FileText size={14} strokeWidth={2.2} />
                {identity.resumeUrl ? "Download résumé" : "Request résumé"}
              </a>
              {links.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-rule text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  aria-label={label}
                >
                  <Icon size={16} strokeWidth={2} />
                </a>
              ))}
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.dl
              className="divide-y divide-rule border-y border-rule"
              initial="hidden"
              whileInView="show"
              viewport={inView}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              {[
                { k: "Based in", v: identity.location },
                { k: "Timezone", v: identity.timezone },
                { k: "Years shipping", v: String(stats.years) },
                { k: "Technologies", v: String(stats.technologies) },
              ].map((row) => (
                <motion.div
                  key={row.k}
                  className="flex items-baseline justify-between gap-4 py-3"
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
                  }}
                >
                  <dt className="label-mono text-ink-faint">{row.k}</dt>
                  <dd className="text-[0.92rem] tnum">{row.v}</dd>
                </motion.div>
              ))}
            </motion.dl>

            <div>
              <p className="label-mono mb-4 text-ink-faint">Education</p>
              <ul className="space-y-4">
                {credentials.map((c) => (
                  <li key={c.qualification}>
                    <p className="text-[0.95rem] leading-snug">
                      {c.qualification}
                      <span className="text-ink-soft"> - {c.field}</span>
                    </p>
                    <p className="mt-1 text-[0.88rem] text-ink-soft">
                      {c.institution}
                    </p>
                    <p className="mt-0.5 text-[0.8rem] text-ink-faint">
                      {c.affiliation} · {c.location} ·{" "}
                      <span className="tnum">{c.graduated}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
