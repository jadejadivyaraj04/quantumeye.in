# quantumeye.in — portfolio

Rebuild of the portfolio at [quantumeye.in](https://quantumeye.in), from the
findings in the teardown of the previous build.

Vite · React 18 · TypeScript · Tailwind v4 · Framer Motion.

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # tsc -b && vite build
npm run preview
npm run og       # regenerate public/og-image.png from assets/og-image.html
```

Content lives in one file: [`src/data/portfolio.ts`](src/data/portfolio.ts).
Outstanding assets and copy are tracked in
[`CONTENT-TODO.md`](CONTENT-TODO.md).

---

## What changed from the old build

| | Before | After |
|---|---|---|
| JS to first paint | 191 KB gzip, one chunk | ~110 KB gzip, 4 chunks |
| CSS | 14.3 KB gzip | 8.8 KB gzip |
| Images | 9, all Unsplash stock | the real portrait + real store/device captures |
| Projects shown | 6 (of 9 real) | 9 |
| Project counts shown | 4, all different | derived from data |
| Clickable non-focusable elements | 18 | 0 |
| Headings | 68, with duplicates | 24 |
| Sections | 8 nav entries, 3 duplicated | 6 |
| SEO tags | none | description, OG (with portrait), Twitter, canonical, JSON-LD |
| Résumé / photo | absent | photo shipped; résumé pending |

## Structure

```
src/
  data/portfolio.ts      all content + derived stats. Single source of truth.
  lib/motion.ts          shared easing, durations, variants
  lib/hooks.ts           active section, scroll lock, escape, scrolled
  components/
    Header.tsx           sticky nav, scroll progress, active section
    Hero.tsx             portrait, masked name reveal, derived counts
    ClientMarks.tsx      Nike / BBC Earth / Maryland Transit
    Work.tsx             case study grid -> dialog
    Lab.tsx              self-directed R&D, with a capture strip
    CaseStudyDialog.tsx  problem / role / constraint / shipped / result
    ProjectVisual.tsx    capture if one exists, else ProjectDetails
    ProjectDetails.tsx   role / shipped / constraint, for projects with no capture
    About, Experience, Capabilities, Writing, Contact, Footer
```

## Layout

One shell class, `.shell` in `index.css`, sets the measure and gutters for
every section — change it there, not in ten components. It is 88rem wide with
padding that steps 1.25rem → 1.75rem → 2.5rem. That replaced a repeated
`max-w-6xl px-5 sm:px-8`, which at 1440px was leaving 176px of dead margin
before the text started; it is now 51px.

Breakpoints in use: `480px` (shell padding), `640px` (`sm:` type and spacing),
`768px` (`md:` work-card rows, desktop nav), `1024px` (`lg:` the hero and
About split into two columns).

Verified with no horizontal overflow and no undersized tap targets at 320,
360, 390, 768, 1280 and 1440. Note that narrow-viewport *headless* captures of
this page are not trustworthy — they render clipped even when the layout
measures clean — so check mobile in a real browser or with device emulation
rather than a headless screenshot.

## Decisions worth knowing

**Counts are computed, never typed.** `stats` in `portfolio.ts` derives years,
project totals and technology counts from the data itself. The old build
showed "5+ years" in the hero, 6 in the database, "20+ projects" in About and
"25 / 8 / 22 / 35" in Projects — the last four read from a `project_statistics`
table with zero rows. Read `stats` rather than writing a number into a
component. Section headings go through `numberWord()` for the same reason —
"Nine apps" is derived, so it cannot drift from the array the way the old
site's four different totals did.

**Never state a project count in the UI.** The band links to "All projects",
the Work heading carries no number, and there is no project tile in the hero
strip. Naming a figure caps what a reader assumes the body of work is, and it
goes stale the moment a project is added. `stats.clientProjects` still exists
for internal use — do not render it. Years, technologies, articles and role
count are fine to state; those work in his favour.

**Content has two sources, and the bundle always wins ties.** `src/data/
portfolio.ts` is compiled into the app and renders on first paint with no
request. If `VITE_CONTENT_URL` is set, `src/lib/content.tsx` fetches that
published JSON afterwards and swaps it in - but only if it parses, carries the
expected `shape`, and passes `isPortfolioContent`. Components read through
`useContent()`; `stats` and the client-band names are derived from whichever
content is live, so a dashboard can never publish a count.

Three failure modes are handled, each because it actually happened here: a
file served as HTML with a 200 (validation rejects it), a thin publish with
empty lists that threw on `capabilities[active]` and unmounted the page
(validation now requires those lists, and `ContentBoundary` reverts to the
bundled copy if any render under published content throws), and a shape change
outliving old files (`CONTENT_SHAPE`).

With `VITE_CONTENT_URL` unset there is no request and no Firebase code
anywhere in the bundle - the cost of the whole pipeline is 0.4KB gzip.

**Vertical rhythm is one class too.** `.band` in `index.css` sets the padding
above and below every section from a single `--band` custom property
(3.25rem → 4.5rem → 5rem). It replaced `py-24 sm:py-32` repeated in eight
components, which stacked into a 256px empty strip between every section - a
quarter of a laptop screen, eight times down the page. It is now 104px on a
phone and 160px at 1440, and changing it means editing two numbers.

**Copy is bounded by the résumé.** `Divyaraj 2026.pdf` is the source of truth
for roles, dates, institutions and what each project actually did. Three case
studies were rewritten in Sep 2026 because the prose had drifted past it —
My Link is document-driven, not real-time; BBC Earth was for BBC Studio
visitors, not the broadcast audience; and Nike was UDP/TCP streaming work, not
ownership of the native bridges. Do not reintroduce claims the PDF cannot
support.

**Client work and R&D are kept apart.** `caseStudies[]` is client delivery
with a named client and real users; `explorations[]` (the Lab section) is
self-directed R&D, each entry carrying a status chip and the question it set
out to answer. They are separate arrays on purpose: an exploration must never
feed `stats.clientProjects` or `stats.industries`, and a reader who cannot
tell a shipped client app from a prototype discounts both. Lab cards are compact and
open a dialog, the same pattern as the case studies.

The Lab grid is four equal cards - two up, four across above 1280px. Each
carries a tinted lid showing that project's own captures (phone screens
stacked, or a browser capture as a slab) and, where a project has none, its
stack set in mono on the tint. Never a drawn interface. Everything else -
the question, what it does, the hard part, all the captures - is in
`ExplorationDialog`.

The first version of this section put all of that on the page instead, and
four such cards ran longer than the nine case studies above them. Keeping the
detail behind a click cut the section from roughly 3000px to 908px without
losing a word of it, and it removed the recurring dead-air problem: uniform
cards cannot stretch to match a taller neighbour.

**No proficiency percentages.** "Flutter 95%" is unverifiable and reads more
junior than years plus context, so capabilities carry a tenure or a concrete
note instead.

**The palette is sampled from the portrait.** The accent is the oxblood of
the shirt in `public/portrait.jpg` (#3D1020–#752F3F), the ink comes from the
hair, and `.studio-plate` reproduces the photograph's own backdrop gradient so
its edges dissolve into the page instead of reading as a pasted rectangle. If
the portrait is ever replaced, re-sample and update the tokens at the top of
`index.css` — otherwise the photo and the page drift apart.

**Light only.** There is no theme toggle and no `.dark` variant.

**Entrance animations in the hero are CSS, not Framer.** Framer drives opacity
through `requestAnimationFrame`, and any renderer that throttles or virtualises
rAF — a backgrounded tab, a headless screenshot, a link-preview crawler —
freezes those fades part-way and leaves content stranded invisible. This was
reproducible in two separate environments. Above the fold that is not an
acceptable failure, so the hero uses the `.rise` / `.mask-up` / `.fade` classes
in `index.css`, which the browser drives off the document timeline and
guarantees to finish. Transform-only motion (the portrait parallax, hover
states, the `layoutId` springs) stays on Framer, where the failure mode is just
"no movement". Below-fold scroll reveals also stay on Framer and self-heal on
visibility.

**Reduced motion is handled in JS as well as CSS.** `<MotionConfig
reducedMotion="user">` in `App.tsx` is what makes Framer honour the setting; a
`@media (prefers-reduced-motion)` duration override never reaches inline styles
it writes itself.

**The contact form never dead-ends.** With EmailJS env vars set it sends from
the page; without them it opens a `mailto:` draft. A honeypot field is
included — see `CONTENT-TODO.md` for the origin restriction that goes with it.

## Deploying

Static output in `dist/`. Any static host works.

Two things the old deployment got wrong and this one needs right:

1. **Serve `/sitemap.xml` and `/robots.txt` as files.** The old SPA fallback
   returned `index.html` for `/sitemap.xml`, so there was effectively no
   sitemap. Exclude them from the catch-all rewrite.
2. **Prerender if you can.** Nothing here needs a server, but the page is
   client-rendered, so crawlers must execute the bundle. The content changes
   rarely enough that a build-time HTML snapshot is close to free.
