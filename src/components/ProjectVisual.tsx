import { motion, useReducedMotion } from "framer-motion";
import type { CaseStudy } from "../data/portfolio";
import ProjectDetails from "./ProjectDetails";

/**
 * Two treatments:
 *
 *   real capture → the screenshot itself, large and unframed. A bezel only
 *                  shrinks it, and store captures already contain the
 *                  phone's own status bar and gesture pill.
 *   no capture   → the facts of the work instead. No mock-up: a drawn screen
 *                  implies a screenshot exists, and for these none does.
 */

const CAPTURE = { sm: "w-[13rem]", lg: "w-[16rem]" } as const;

export default function ProjectVisual({
  study,
  size = "sm",
}: {
  study: CaseStudy;
  size?: "sm" | "lg";
}) {
  const reduce = useReducedMotion();
  const shot = study.media[0];

  if (!shot) {
    return <ProjectDetails study={study} withConstraint={size === "sm"} />;
  }

  return (
    <motion.figure
      className={`m-0 ${CAPTURE[size]}`}
      animate={reduce ? {} : { y: [0, -6, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <img
        src={shot.src}
        alt={shot.alt}
        width={600}
        height={1300}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full rounded-2xl border border-rule shadow-lift"
      />
    </motion.figure>
  );
}
