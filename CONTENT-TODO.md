# Content still to supply

The site is built and runs. What is missing is **evidence** — the same gap the
teardown found on the old build, where the schema had fields for all of this
and every one was null.

These are deliberately kept out of `src/data/portfolio.ts`: a placeholder
string in the data file renders straight onto the page. Optional fields are
`null` and every component omits what is null, so the site stays clean while
these are outstanding.

---

## Done since the build

- **Headshot** — `public/portrait.jpg` (1336×1400) and `public/portrait-sm.jpg`
  are wired into the hero, and the site palette is sampled from the photograph.
  Replacing it means re-sampling the tokens in `src/index.css`; see the README.
- **Share image** — `public/og-image.png` now includes the portrait.
- **Heracles Almelo, InspX, InstaPour and LuvDrops are fully evidenced** —
  real captures in `public/work/` and case-study copy written from what those
  screens actually show. They are the reference for the remaining five.
- **BetterYou removed, Simul added** (Sep 2026) — native Android (Java),
  written from the project brief, then evidenced with four real captures off
  the emulator. No store links supplied.
- **InstaPour was captured straight off the emulator**, not from the stores:
  `adb -s emulator-5554 shell screencap -p /sdcard/c.png`, pull, then
  `sips --resampleWidth 600 -s format jpeg`. The app is installed as
  `com.insta.pour`, so any screen can be recaptured in seconds — useful,
  because the Order Details demo data currently shows the item name in the
  **User Name** field.
- **Résumé reconciled** (Sep 2026) — three projects added from *Divyaraj
  2026.pdf* (Heracles Almelo, InspX, Assist), role titles matched to the
  résumé, CGPA dropped, real colleges used, BytesTechnolab start corrected to
  Nov 2023, and the Nike / BBC Earth / My Link copy pulled back to what the
  résumé actually supports.

## 0. Dashboard — where it stands

The repository is the database. Content lives at `content/content.json`, every
publish is a commit, and the live site reads that file from GitHub without a
rebuild.

**Working:** sign-in, editors for all nine sections (add, edit, reorder,
delete), drafts kept in the browser, publish-time validation, and commit notes
generated from the diff. The first publish landed on 16 Sep 2026.

**The one step left to make edits reach the live site:** set

```
VITE_CONTENT_URL=https://raw.githubusercontent.com/jadejadivyaraj04/quantumeye.in/main/content/content.json
```

in the build environment and deploy once. After that deploy, publishing from
the dashboard changes the live site on its own.

Note on caching: raw.githubusercontent.com sends `Cache-Control: max-age=300`,
so a publish can take up to five minutes to appear. If that ever matters, the
same file is on jsDelivr (`cdn.jsdelivr.net/gh/jadejadivyaraj04/quantumeye.in@main/content/content.json`)
- one line in `src/lib/content.tsx`.

**Not built yet:** uploading captures from the dashboard. Images are still
processed and committed by hand into `public/work/`.

## 1. Blocking — do these first

### Real app screenshots
**Where:** `caseStudies[].media` in `src/data/portfolio.ts`

```ts
media: [
  { src: "/work/nike-fitlab-1.png", alt: "Fitlab session screen mid-class" },
  { src: "/work/nike-fitlab-2.png", alt: "Instructor transport controls" },
],
```

Drop files in `public/work/`. The moment `media[0]` exists, `ProjectVisual`
renders the image instead of `ProjectDetails` — no component changes needed.

Two to four per project. Heracles Almelo is done and shows the pattern: App
Store captures at 600×1299 work well, and the dialog builds a thumbnail
switcher automatically as soon as a project has more than one. Save as WebP
where you can — `heracles-home.webp` is 69 KB against ~85 KB for the JPEGs.

**Pulling them from the stores is the fastest route.** Open the app's App
Store page, grab the screenshot URLs, and drop the files in `public/work/`.

> Until these land, those projects show their details in text and say *No
> public capture* outright. Nothing on the site draws an interface it does not
> have a photograph of. The old site used nine Unsplash stock photos and that
> was the single biggest reason the work looked generic.

### Simul — the signed-in screens

`com.simul` is installed on `emulator-5554`, so these can be captured the same
way InstaPour was. The public screens are done (feed, post detail, onboarding,
sign-in); the ones below need a **signed-in session**, which the app does not
appear to persist across a relaunch:

| Screen | Why it is worth having |
|---|---|
| Condition picker | The twelve-condition taxonomy, each with its own gradient — the clearest shot of the tagging model |
| Profile | The **double** condition ring on the Bitmoji avatar, plus the Insights score |
| Chat thread | Read receipts and the ring carried into messaging |
| Notifications | Bitmoji avatars in the activity list |

Sign in on the emulator and say so — capture takes about a minute. Recipe:

```bash
adb -s emulator-5554 shell screencap -p /sdcard/c.png
adb -s emulator-5554 pull /sdcard/c.png shot.png
# the app letterboxes on this device, so trim the bars:
sips --cropOffset 110 0 -c 2636 1280 shot.png --out c.png
sips --resampleWidth 600 -s format jpeg -s formatOptions 74 c.png --out out.jpg
```

### Lab - Medha

Five captures are in (`public/work/medha-*.jpg`, originals kept full-size in
`captures-source/medha/`). Two screens from the build are still missing and
would both earn their place:

| Screen | Why |
|---|---|
| Scan | The prescription capture is the whole premise and is the one screen not shown |
| History | Monthly adherence ring, the calendar, and Share with doctor |

Two details would sharpen the copy when they are confirmed: how Gemini Nano is
reached from Flutter (ML Kit GenAI, AICore over a platform channel, or a
plugin), and whether the scan is Nano reading the image or OCR feeding Nano.

The project folder is no longer at `~/WorkSpace/personal_mvp/medha`, so these
cannot be captured here the way InstaPour and Simul were.

### Lab - Expense Tracker AI

Five captures are in. The copy was written against the source at
`~/WorkSpace/personal_mvp/expense_tracker_ai`, not from a description, so the
details are load-bearing: Gemma 3 1B int4 through flutter_gemma + MediaPipe,
ML Kit OCR as the hallucination guard (an LLM amount is only accepted if it
appears verbatim in the OCR text), drift + SQLCipher, `receive_sharing_intent`
for share-to-app. If any of that changes in the app, change it here too.

Worth adding if the screens exist: the review screen where an itemised bill is
split per line, and the SMS parser mid-parse. Also unanswered: whether this is
on a store anywhere - the card says R&D prototype, which undersells it if it
ships.

### Lab - MediaProof and Storefront MCP

MediaProof's two captures were taken from the app itself, not mocked: the
backend at `~/WorkSpace/personal_mvp/MediaProof` serves the built frontend, so
it was run locally on :8000 and driven with the repo's own
`c2pa_valid_ai/signed_ai.jpg` fixture. Anything in those shots is real output.
No detection provider was configured for the run, so the Detection tab is
empty - a capture with Sightengine or Hive keys set would show the estimate
beside the credential, which is the product's whole point. Worth redoing when
keys are to hand.

Storefront MCP has no captures at all. Its widget renders inside ChatGPT, so
the only honest capture is a screenshot of that conversation - which has to
come from you. Two open questions on it: whether the client can be named (the
code points at a Silhouette America staging host, so the card says "a shop"),
and whether it is live in the ChatGPT directory, which would make it
Published rather than an R&D prototype.

### The four without captures

Nike, BBC Earth, Assist and My Link render `ProjectDetails.tsx` instead of a
screenshot — role, what shipped, the constraint, and a plain *No public
capture* line (see the README). No mock-up: a drawn screen would imply a
capture exists. Set `media` on any of them and it switches to the real capture
automatically — no component change needed.

Nike and BBC Earth are the ones worth chasing: both are featured, and they
carry the most weight of any names on the page.

### A PDF résumé
**Where:** `identity.resumeUrl`

```ts
resumeUrl: "/divyarajsinh-jadeja-resume.pdf",
```

Put it in `public/`. The hero and About buttons switch from "Request résumé"
(which currently scrolls to the contact form) to a real download automatically.

### Store links
**Where:** `caseStudies[].links` — Heracles Almelo, InspX and LuvDrops have
both. InstaPour has captures but no store links; five others have neither.

```ts
links: {
  store: "https://apps.apple.com/app/id...",
  play: "https://play.google.com/store/apps/details?id=...",
},
```

App Store / Google Play buttons appear in the case-study dialog when set.
Skip any app that was never public or is NDA-bound.

---

## 2. High value — the thing that actually persuades

### One verifiable number per project
**Where:** `caseStudies[].outcome`

Currently `null` on all six, and the dialog says so plainly — *"Not yet
published — a verifiable number goes here"* — rather than inventing a figure.

Pick something you could defend in an interview:

| Project | Candidate metric |
|---|---|
| Nike Studio — Fitlab | Studios live, sessions per week, or stream latency achieved |
| BBC Earth | Visitors who used it, photos shared, or venue footfall covered |
| Heracles Almelo | App installs, matchday active users, or store rating — both store pages are linked, so a rating is easy to cite |
| Simul | Members, communities, or messages exchanged |
| InspX | Technicians using it, forms completed per week, or paper eliminated — both store pages are linked |
| Assist | Staff managed, or sales volume tracked |
| My Link — MTA | Riders served, or routes covered |
| InstaPour | Order volume or value processed |
| LuvDrops | Installs, drops sent, or group showers created — both store pages are linked |

If a number is under NDA, a shape still works: *"Rolled out to every studio in
the pilot region."*

### Per-role achievements
**Where:** `roles[].achievements`

Only Aimperior has one (the Android → Flutter migration). The other three are
empty arrays, and the component omits the list entirely when empty. Two or
three lines each — team size, what you were accountable for, a number you
moved. This is the difference between a CV and a case for hiring you.

### Project dates
**Where:** `caseStudies[].period` — e.g. `"2024"` or `"Mar – Aug 2024"`.
All `null` now; the dialog omits the field.

---

## 3. Configuration

### EmailJS
Copy `.env.example` to `.env` and fill in:

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

Without these the form falls back to opening a `mailto:` draft, so it is never
a dead end — but it also never sends from the page.

**Then, in the EmailJS dashboard, restrict the service to `quantumeye.in`.**
The old build shipped these three values inline with no captcha and no origin
restriction, which left the sending quota open to anyone who read the JS. The
form here carries a honeypot; an origin allowlist is the other half.

---

## 4. Do this on the old site's database

Two items from the teardown that live in Supabase, not in this repo:

- **Delete the street address** from the `contact_info` row. It is publicly
  readable through the API with the key that ships in the bundle, and it was
  never displayed. This build only ever uses city and region.
- **Restrict row-level security** to the columns actually rendered.

---

## 5. Fix these on the résumé itself

The site and `Divyaraj 2026.pdf` now agree on facts, but the PDF has its own
problems — and it is what the hero button hands people:

- **"Senior Flutter developer at BytesTechnolalab"** — typo in the subtitle.
- **Experience runs oldest-first.** Recruiters expect reverse-chronological.
- **Your full home address is on it.** City and region is enough, and it is
  the same exposure being removed from the Supabase row.
- **No links.** Add quantumeye.in, LinkedIn, GitHub and Medium.
- **My Link is filed under "Native Android Projects"** but its stack says
  Flutter.
- **Email is `jadejadivyaraj7@gmail.com`;** the site uses
  `developerdivyaraj@gmail.com`. Pick one — the site is set to the latter.
- **Nothing about release engineering.** Shorebird, FVM, `--dart-define`,
  Clarity and your six Medium articles appear nowhere on the résumé, yet they
  are what the site leads with. That is the biggest thing the PDF is missing.
- **CGPA** — dropped from the site; drop it from the résumé too so the two
  cannot disagree again.

## 6. Optional

- `identity.currently` — update the dated "Now" line every month or two. It is
  the cheapest proof the site is maintained, and the reason it exists is that
  the old footer still read *© 2025* in September 2026.
- Per-project detail routes. Case studies open in a dialog today. Giving each a
  real URL makes them individually shareable and crawlable — add a router and
  point it at the same `caseStudies` data.
- `public/og-image.png` — regenerate with `npm run og` after editing
  `assets/og-image.html`.
