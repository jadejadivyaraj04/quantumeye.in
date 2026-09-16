import { useEffect, useState } from "react";

/* ────────────────────────────────────────────────── active section ──── */

/**
 * Tracks which section is under the header so the nav can mark it.
 * Uses a rootMargin band rather than element ratios, so short sections
 * (Contact) register as reliably as tall ones (Work).
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);

    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Two sections intersect the band whenever one is handing over to
        // the next, so take the lowest of them - the one being entered.
        // Taking the topmost, as this did, named the section being left, and
        // the header and the nav underline both ran one behind all the way
        // down the page.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const entering = visible[visible.length - 1];
        if (entering) setActive(entering.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/* ─────────────────────────────────────────────────────── utilities ──── */

/** Locks body scroll while a dialog is open, without a layout jump. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** Fires on Escape. Used by the case-study dialog. */
export function useEscape(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape, active]);
}

/**
 * True once the visitor is properly into the page, false again near the top.
 *
 * Two thresholds rather than one: a single boundary flickers when a scroll
 * ends exactly on it, or when momentum oscillates a pixel either way, and a
 * header that flickers between two shapes is worse than one that never
 * changes. It condenses at `enter` and only expands again below `exit`.
 */
export function useCondensed(enter = 160, exit = 70): boolean {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCondensed((was) => (was ? y > exit : y > enter));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enter, exit]);
  return condensed;
}

/** True once the visitor has scrolled past `px`. Drives the header state. */
export function useScrolled(px = 24): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > px);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [px]);
  return scrolled;
}
