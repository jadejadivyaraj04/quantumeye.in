import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Github,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  PenLine,
  Phone,
} from "lucide-react";
import { emailjs as cfg } from "../data/portfolio";
import { useContent } from "../lib/content";
import { ease, inView } from "../lib/motion";
import SectionHeading from "./SectionHeading";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Contact form.
 *
 * Credentials come from env vars rather than the bundle source, and the form
 * carries a honeypot — the previous build shipped the EmailJS service,
 * template and public key inline with no captcha, which left the sending
 * quota open to anyone who read the JS.
 *
 * If EmailJS is not configured the submit falls back to a mailto: draft, so
 * the form is never a dead end.
 */
export default function Contact() {
  const { content } = useContent();
  const { contact } = content;

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [trap, setTrap] = useState(""); // honeypot — humans never fill this
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const configured = Boolean(cfg.serviceId && cfg.templateId && cfg.publicKey);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (trap) return; // silently drop bots
    setStatus("sending");
    setError("");

    if (!configured) {
      const body = `${form.message}\n\n- ${form.name} (${form.email})`;
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
        form.subject || "Portfolio enquiry",
      )}&body=${encodeURIComponent(body)}`;
      setStatus("idle");
      return;
    }

    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        cfg.serviceId,
        cfg.templateId,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject || "Portfolio enquiry",
          message: form.message,
          to_email: contact.email,
        },
        cfg.publicKey,
      );
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? `Could not send: ${err.message}. Email me directly instead.`
          : "Could not send. Email me directly instead.",
      );
    }
  }

  const channels = [
    { Icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { Icon: Phone, label: "Phone", value: contact.phone, href: `tel:+917575055300` },
    { Icon: MapPin, label: "Location", value: contact.location, href: null },
  ];

  const socials = [
    { href: contact.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: contact.github, label: "GitHub", Icon: Github },
    { href: contact.medium, label: "Medium", Icon: PenLine },
  ];

  return (
    <section id="contact" className="scroll-mt-24 border-t border-rule py-24 sm:py-32">
      <div className="shell">
        <SectionHeading
          index="07"
          eyebrow="Contact"
          title="Tell me what you're building."
          intro="Senior mobile roles, scoped consulting, or a second opinion on a Flutter codebase. I reply within a day or two."
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          {/* Direct channels */}
          <div className="min-w-0">
            <ul className="divide-y divide-rule border-y border-rule">
              {channels.map(({ Icon, label, value, href }) => {
                const inner = (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rule text-ink-faint transition-colors group-hover:border-accent group-hover:text-accent-text">
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <span className="label-mono block text-ink-faint">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-[0.95rem] break-words">
                        {value}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="group flex min-h-14 items-center gap-4 py-3.5"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex min-h-14 items-center gap-4 py-3.5">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-8">
              <p className="label-mono mb-3.5 text-ink-faint">Elsewhere</p>
              <div className="flex flex-wrap gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group flex h-11 items-center gap-2 rounded-full border border-rule px-4 text-[0.85rem] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  >
                    <Icon size={14} strokeWidth={2} />
                    {label}
                    <ArrowUpRight
                      size={12}
                      strokeWidth={2.4}
                      className="text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 0.5, ease }}
            className="relative rounded-2xl border border-rule bg-surface/50 p-6 sm:p-8"
          >
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  className="flex min-h-[22rem] flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <motion.span
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-ok-soft text-ok"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                  >
                    <Check size={24} strokeWidth={2.6} />
                  </motion.span>
                  <h3 className="mb-2 text-[1.3rem]">Message sent</h3>
                  <p className="max-w-[34ch] text-[0.95rem] text-ink-soft">
                    Thanks for reaching out - I'll get back to you within a day
                    or two.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-6 h-11 rounded-full border border-rule-strong px-5 text-[0.86rem] font-medium transition-colors hover:border-ink"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="name"
                      label="Name"
                      required
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                    />
                    <Field
                      id="email"
                      label="Email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                    />
                  </div>

                  <Field
                    id="subject"
                    label="Subject"
                    hint="optional"
                    value={form.subject}
                    onChange={(v) => setForm({ ...form, subject: v })}
                  />

                  <Field
                    id="message"
                    label="Message"
                    required
                    textarea
                    value={form.message}
                    onChange={(v) => setForm({ ...form, message: v })}
                  />

                  {/* Honeypot — off-screen, not display:none, so bots fill it */}
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label htmlFor="company-url">Company URL</label>
                    <input
                      id="company-url"
                      name="company-url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={trap}
                      onChange={(e) => setTrap(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group relative flex h-12 items-center gap-2.5 overflow-hidden rounded-full bg-ink px-6 text-[0.9rem] font-medium text-ground disabled:opacity-60"
                    >
                      <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-300 ease-out group-hover:translate-y-0 group-disabled:translate-y-full" />
                      {status === "sending" ? (
                        <Loader2
                          size={15}
                          strokeWidth={2.4}
                          className="relative animate-spin"
                        />
                      ) : (
                        <Mail size={15} strokeWidth={2.2} className="relative" />
                      )}
                      <span className="relative">
                        {status === "sending" ? "Sending…" : "Send message"}
                      </span>
                    </button>

                    {!configured && (
                      <p className="max-w-[26ch] font-mono text-[0.7rem] leading-snug text-ink-faint">
                        Opens your mail client until EmailJS env vars are set.
                      </p>
                    )}
                  </div>

                  {status === "error" && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-rule bg-ground px-4 py-3 text-[0.85rem] text-ink-soft"
                      role="alert"
                    >
                      {error}{" "}
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-accent-text underline"
                      >
                        {contact.email}
                      </a>
                    </motion.p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Labelled field. The old form relied on placeholders alone. */
function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  textarea = false,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  hint?: string;
}) {
  const shared =
    "w-full rounded-lg border border-rule bg-ground px-3.5 py-3 text-[0.95rem] text-ink transition-colors placeholder:text-ink-faint/60 hover:border-rule-strong focus:border-accent focus:outline-none";

  return (
    <div className={textarea ? "" : undefined}>
      <label
        htmlFor={id}
        className="label-mono mb-2 flex items-baseline gap-2 text-ink-soft"
      >
        {label}
        {required && <span className="text-accent-text">*</span>}
        {hint && <span className="text-ink-faint normal-case">{hint}</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      )}
    </div>
  );
}
