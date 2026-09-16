import type { Variants, Transition } from "framer-motion";

/**
 * Shared motion vocabulary. One easing curve and three durations across the
 * whole site, so the animation reads as a single system rather than a pile
 * of separate effects.
 *
 * Everything here animates from a *visible* resting state where it can —
 * reveals move and fade only partially (y: 14, opacity: 0 → 1 over a short
 * distance), so a slow observer or a failed IntersectionObserver never
 * leaves content stranded invisible.
 */

export const ease = [0.22, 1, 0.36, 1] as const; // expo-out
export const easeInOut = [0.65, 0, 0.35, 1] as const;

export const dur = {
  fast: 0.22,
  base: 0.42,
  slow: 0.72,
} as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.7,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
};

/** Section entrance: children stagger in behind the heading. */
export const stagger = (delay = 0, each = 0.07): Variants => ({
  hidden: {},
  show: {
    transition: { delayChildren: delay, staggerChildren: each },
  },
});

export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.base, ease },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.slow, ease } },
};

/** Hero name: each word clipped and pushed up from its own mask. */
export const wordMask: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.85, ease },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: dur.base, ease },
  },
};

/** Viewport defaults for scroll reveals — fire once, slightly early. */
export const inView = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -80px 0px",
} as const;
