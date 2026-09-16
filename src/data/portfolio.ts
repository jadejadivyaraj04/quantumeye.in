/**
 * Single source of truth for the site.
 *
 * Extracted from the previous build at quantumeye.in (Sep 2026) via the
 * rendered DOM and the Supabase REST schema, then reconciled. Counts are
 * derived at the bottom of this file rather than typed by hand — the old
 * site showed four different project totals because they were hardcoded in
 * three places against an empty `project_statistics` table.
 *
 * Content still to supply is tracked in CONTENT-TODO.md, deliberately NOT
 * in this file: a placeholder string here renders straight to the page.
 * Optional fields are null, and every component omits what is null.
 */

/* ────────────────────────────────────────────────────────────── types ── */

export interface Identity {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  positioning: string;
  location: string;
  timezone: string;
  availableNote: string;
  portraitUrl: string | null;
  resumeUrl: string | null;
  /** Dated one-liner. The cheapest possible proof the site is maintained. */
  currently: { note: string; since: string };
}

export interface Contact {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  medium: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  role: string;
  industry: string;
  period: string | null;
  featured: boolean;
  /** One line for the card face. */
  summary: string;
  problem: string;
  contribution: string;
  /** The interesting engineering constraint — what earns the read. */
  constraint: string;
  shipped: string[];
  outcome: string | null;
  stack: string[];
  /** Hue (deg) driving that project's frame + accent treatment. */
  hue: number;
  media: { src: string; alt: string }[];
  links: { store?: string; play?: string; site?: string; repo?: string };
}

/**
 * Self-directed R&D, kept in its own type rather than bolted onto CaseStudy.
 * These have no client and, mostly, no users yet, so they must not feed the
 * derived counts below - a reader who cannot tell shipped client work from a
 * weekend prototype discounts both.
 */
export interface Exploration {
  slug: string;
  title: string;
  /** What it is, in one line. */
  summary: string;
  /** Stated plainly on the card so nothing here reads as shipped product. */
  status: "R&D prototype" | "In progress" | "Published";
  /** The question the build set out to answer. */
  question: string;
  built: string[];
  /** What was actually hard, or the trade-off the answer forced. */
  constraint: string;
  stack: string[];
  hue: number;
  media: { src: string; alt: string }[];
  /** Phone captures strip across the card; web captures need the width. */
  mediaLayout?: "phones" | "wide";
  links: { site?: string; repo?: string; store?: string; play?: string };
}

export interface Role {
  company: string;
  position: string;
  location: string;
  start: string;
  end: string | null;
  summary: string;
  achievements: string[];
  stack: string[];
}

export interface CapabilityGroup {
  group: string;
  blurb: string;
  items: { name: string; years?: number; note?: string }[];
}

export interface Article {
  title: string;
  excerpt: string;
  url: string;
  published: string;
  readMinutes: number;
  tags: string[];
}

export interface Credential {
  institution: string;
  qualification: string;
  field: string;
  graduated: string;
  location: string;
  /** The awarding university; the institution above is the college. */
  affiliation: string;
}

/* ─────────────────────────────────────────────────────────── identity ── */

export const identity: Identity = {
  name: "Divyarajsinh Jadeja",
  firstName: "Divyarajsinh",
  lastName: "Jadeja",
  role: "Senior Flutter Engineer",
  // The old hero read "Crafting exceptional mobile experiences with
  // cutting-edge technology" — true of every mobile dev alive. Name clients.
  positioning:
    "I build cross-platform mobile apps for teams that ship at scale - Nike, BBC Earth and Heracles Almelo among them.",
  location: "Ahmedabad, India",
  timezone: "IST · UTC+5:30",
  availableNote: "Open to senior mobile roles and scoped consulting",
  portraitUrl: "/portrait.jpg",
  resumeUrl: null,
  currently: {
    note: "Working on Flutter release engineering - out-of-band updates with Shorebird, and pinning toolchains across a multi-app team.",
    since: "September 2026",
  },
};

export const contact: Contact = {
  email: "developerdivyaraj@gmail.com",
  phone: "(+91) 757-505-5300",
  // City and region only. The old contact_info row stored a full street
  // address that was publicly readable through the API but never displayed.
  location: "Ahmedabad, Gujarat, India",
  linkedin: "https://www.linkedin.com/in/divyarajsinh-jadeja-228670170",
  github: "https://github.com/jadejadivyaraj04",
  medium: "https://medium.com/@developerdivyaraj",
};

/**
 * The clients whose names carry weight on their own, surfaced directly under
 * the hero. Deliberately not every project — a band of recognisable names is
 * the point, and it links through to the full set.
 *
 * Only the short note lives here; the client name and industry are read from
 * the case study by slug so the two can never disagree.
 */
export const clientMarks: { slug: string; note: string; as?: string }[] = [
  { slug: "nike-studio-fitlab", note: "Live studio training video" },
  // `as` overrides the mark where the product name is the better-known one,
  // or where the client's legal name is too long to sit in a column.
  { slug: "bbc-earth", note: "Photo app for BBC Studio visitors", as: "BBC Earth" },
  { slug: "heracles-almelo", note: "Eredivisie club app" },
  { slug: "mta-my-link", note: "Statewide transit information", as: "Maryland Transit" },
];

/** clientMarks resolved against the case studies. */

/* ────────────────────────────────────────────────────────────── work ── */

export const caseStudies: CaseStudy[] = [
  {
    slug: "nike-studio-fitlab",
    title: "Nike Studio - Fitlab",
    client: "Nike",
    role: "Senior Software Developer",
    industry: "Fitness & Sport",
    period: null,
    featured: true,
    summary:
      "Studio training video, streamed over UDP and TCP to play seamlessly.",
    problem:
      "Studio training sessions needed coaching video visualised on the room's screens, streamed live rather than played from files sitting on each device.",
    contribution:
      "Developed the Flutter app and the UDP/TCP streaming that carried the content.",
    constraint:
      "Streaming over raw UDP and TCP rather than an off-the-shelf player: transport, buffering and playback all had to be handled in the app for content to run without a visible stutter mid-class.",
    shipped: [
      "Flutter app for studio training video visualisation",
      "UDP and TCP streaming for content delivery",
      "Playback driven onto the studio screens",
    ],
    outcome: null,
    stack: ["Flutter", "Dart", "Kotlin", "Swift", "UDP/TCP"],
    hue: 14,
    media: [],
    links: {},
  },
  {
    slug: "bbc-earth",
    title: "BBC Earth",
    client: "BBC",
    role: "Senior Flutter Developer",
    industry: "Media & Entertainment",
    period: null,
    featured: true,
    summary:
      "A photo app for BBC Studio visitors - animal filters and the BBC mark.",
    problem:
      "BBC Studio wanted visitors to leave with a photo of themselves alongside BBC Earth animal imagery, shareable and still carrying the BBC watermark.",
    contribution:
      "Built the Flutter app and the image pipeline against a PHP backend.",
    constraint:
      "Compositing an animal filter and a fixed watermark onto a camera photo, then handing the result to the social apps, without it looking like a sticker pasted on top.",
    shipped: [
      "Camera capture with animal filters",
      "BBC watermark applied to the composite",
      "Share into the major social targets",
    ],
    outcome: null,
    stack: ["Flutter", "PHP API", "Image Processing"],
    hue: 128,
    media: [],
    links: {},
  },
  {
    slug: "heracles-almelo",
    title: "Heracles Almelo",
    client: "Heracles Almelo",
    role: "Flutter Developer",
    industry: "Football & Sports Media",
    period: null,
    featured: true,
    summary:
      "The club app for an Eredivisie side - news, fixtures, squad and tickets.",
    problem:
      "Heracles Almelo wanted the club in a supporter's pocket: news, the fixture list, the squad and a route to tickets, in Dutch, staying current through the season.",
    contribution:
      "Built the Flutter client against a PHP backend and a live score API.",
    constraint:
      "Every fixture card carries its own countdown to kick-off, ticking away in a scrolling list that also holds a news carousel and the league table. Several independent clocks and feeds on one screen, none of which may cost a frame.",
    shipped: [
      "Home feed with news carousel and the next match",
      "Fixture list with a per-match countdown to kick-off",
      "Eredivisie standings",
      "Squad list and player profiles with stats and social feeds",
      "Ticket purchase route",
    ],
    outcome: null,
    stack: ["Flutter", "PHP API", "Live Score API"],
    hue: 160,
    media: [
      {
        src: "/work/heracles-home.webp",
        alt: "Heracles Almelo home feed: news carousel, next-match countdown and a buy-tickets button",
      },
      {
        src: "/work/heracles-fixtures.jpg",
        alt: "Eredivisie fixture list, each match showing a countdown to kick-off and the stadium",
      },
      {
        src: "/work/heracles-player.jpg",
        alt: "Player profile for a Heracles midfielder with age, height, weight and contract year",
      },
      {
        src: "/work/heracles-splash.jpg",
        alt: "Heracles Almelo launch screen with the club crest and the tagline U, jij en ik, wij zijn Heracles",
      },
    ],
    links: {
      store: "https://apps.apple.com/in/app/heracles-almelo-b-v/id1393034613",
      play: "https://play.google.com/store/apps/details?id=io.fanbox.heraclesalmelo.fan",
    },
  },
  {
    slug: "simul",
    title: "Simul",
    client: "Simul",
    role: "Android Developer",
    industry: "Health & Wellness",
    period: null,
    featured: false,
    summary:
      "A community for people with the same diagnosis - feed, chat, and a 3D globe of nearby peers.",
    problem:
      "People managing a chronic or acute condition are often isolated from anyone who actually understands it. Simul set out to connect patients, carers and clinicians around a shared diagnosis - asthma, diabetes, mental health, heart disease, cancer, genetic disorders - so they could swap daily-living advice and symptom questions instead of guessing alone.",
    contribution:
      "Built the native Android client: the condition taxonomy and its colour system, the community feed, real-time messaging, and the 3D globe integration.",
    constraint:
      "Health condition and location are the two most sensitive things a person can hand over, and this app pairs them deliberately - the globe shows peers near you with the same diagnosis. Proximity had to be precise enough to be worth using and coarse enough that nobody's address could be inferred from it.",
    shipped: [
      "Bitmoji avatar connected during onboarding, through SnapKit",
      "One display condition plus any number of secondary ones, from a taxonomy of twelve",
      "A condition colour ring on every avatar - two rings once a second condition is set",
      "Feed filtered by latest, trending or condition, with conversation search",
      "Posts with votes, view counts, and Best or Latest comment sorting",
      "One-to-one chat with read receipts and photo sharing",
      "3D Earth globe for finding nearby peers, on WhirlyGlobe Maply",
      "Insight score, patient and carer badges, and reporting on every post and comment",
    ],
    outcome: null,
    stack: ["Java", "Android SDK", "Firebase", "WhirlyGlobe Maply", "SnapKit"],
    hue: 188,
    // Captured from com.simul on emulator-5554; the feed was supplied
    // separately. Chat, profile, notifications and the condition picker still
    // need a signed-in run — see CONTENT-TODO.md.
    media: [
      {
        src: "/work/simul-feed.jpg",
        alt: "Simul home feed filtered by latest, trending and condition, with a conversation search and posts tagged S/Mental Health, S/Asthma and S/Diabetes, each author's avatar ringed in their condition colour",
      },
      {
        src: "/work/simul-post.jpg",
        alt: "Simul post detail showing votes, comment and view counts, Best and Latest comment sorting, and replies whose avatars carry green, blue and pink condition rings",
      },
      {
        src: "/work/simul-onboarding.jpg",
        alt: "Simul onboarding: the koala mark, the tagline We Are All In This Together, and a prompt to connect your Bitmoji",
      },
      {
        src: "/work/simul-signin.jpg",
        alt: "Simul sign-in with username and password, password reset and a link to Simul support",
      },
    ],
    links: {},
  },
  {
    slug: "inspx",
    title: "InspX",
    client: "InspX",
    role: "Senior Flutter Developer",
    industry: "Field Service",
    period: null,
    featured: false,
    summary:
      "Pest-control jobs run from the van, with a geo-stamped trail of who did what where.",
    problem:
      "Pest-control operators were running the business on paper: customers, inspection forms, who was assigned to which job, and no record of what actually happened on site once a technician drove away.",
    contribution: "Built the Flutter client against a NodeJS API.",
    constraint:
      "Every stage of a job - assigned, technician dispatched, work done - is stamped with a location and a time. That trail has to be captured on a phone in the field, where signal is not a given, and still reconcile cleanly when the office reads it back hours later.",
    shipped: [
      "Dashboard of open forms, tasks, customers and employees",
      "Task list with search, filters and Today / Tomorrow / This Week views",
      "Task detail with assignment, status and full description",
      "Geo-stamped tracking timeline with map links per stage",
      "Inspection forms with signature capture",
      "Customer and employee records",
    ],
    outcome: null,
    stack: ["Flutter", "NodeJS API", "Geolocation", "Signature Capture"],
    hue: 52,
    media: [
      {
        src: "/work/inspx-home.jpg",
        alt: "InspX dashboard with counts for forms, tasks, customers and employees, and upcoming tasks filtered to today",
      },
      {
        src: "/work/inspx-task-detail.jpg",
        alt: "InspX task detail showing assignment and status above a tracking timeline, each stage stamped with an address and time",
      },
      {
        src: "/work/inspx-tasks.jpg",
        alt: "InspX pest-control task list with search and filter, each job showing its created date and pending status",
      },
      {
        src: "/work/inspx-splash.jpg",
        alt: "InspX launch screen: smart pest and termite form reporting",
      },
    ],
    links: {
      store: "https://apps.apple.com/in/app/inspx/id6749688805",
      play: "https://play.google.com/store/apps/details?id=com.app.inspx",
    },
  },
  {
    slug: "assist",
    title: "Assist",
    client: "Assist",
    role: "Senior Flutter Developer",
    industry: "Warehouse Operations",
    period: null,
    featured: false,
    summary:
      "Employee management, task tracking and sales for a liquor warehouse.",
    problem:
      "A liquor warehouse was tracking staff, daily tasks and sales separately, with no single place to see what had been assigned or sold.",
    contribution: "Built the Flutter client against a PHP backend.",
    constraint:
      "One app serving two very different users - floor staff who need a task and nothing else, and management who need the sales picture - without either being buried under the other's screens.",
    shipped: [
      "Employee management and assignment",
      "Task tracking on the warehouse floor",
      "Sales recording and reporting",
    ],
    outcome: null,
    stack: ["Flutter", "PHP API", "Role-based Access"],
    hue: 246,
    media: [],
    links: {},
  },
  {
    slug: "mta-my-link",
    title: "My Link - MTA Transit",
    client: "Maryland Transit Administration",
    role: "Senior Flutter Developer",
    industry: "Public Transport",
    period: null,
    featured: false,
    summary:
      "Maryland transit information on mobile, sourced from published documents.",
    problem:
      "Riders needed MTA route and transit information on a phone, when the authority publishes it as PDFs and web pages rather than as a data feed.",
    contribution:
      "Built the mobile client, reading MTA's PDF and URL resources.",
    constraint:
      "There was no API to build against. Timetables and route information arrive as documents laid out for print, so the app's job was making print material usable at a bus stop on a small screen.",
    shipped: [
      "Transit information from MTA PDF and URL resources",
      "Route and schedule browsing",
      "In-app document rendering",
    ],
    outcome: null,
    stack: ["Flutter", ".NET API", "PDF Rendering"],
    hue: 205,
    media: [],
    links: {},
  },
  {
    slug: "instapour",
    title: "InstaPour",
    client: "InstaPour",
    role: "Android Developer",
    industry: "Construction & Commerce",
    period: null,
    featured: false,
    summary:
      "Ready-mix, aggregate, dumpsters and precast ordered from the job site, with the mixer tracked in.",
    problem:
      "Construction crews ordered aggregates and ready-mix over the phone. There was no order trail, no delivery visibility, and nobody on site could see where the mixer actually was.",
    contribution:
      "Built the ordering, dispatch tracking and payment flow on the mobile client.",
    constraint:
      "Four products that share almost nothing. Concrete is specified by grade, PSI, cubic yards, pump size and colour; a dumpster by yardage; aggregate by mix. One ordering flow had to carry four unrelated schemas without collapsing into a lowest-common-denominator form.",
    shipped: [
      "Live job-site map with mixer, pump and depot positions and ETA",
      "Category ordering across concrete, stone/sand, dumpster and precast",
      "Order spec down to grade, PSI, cubic yards, pump size and colour",
      "Order status through pending, received and completed",
      "Card payment with saved cards",
      "Per-category order notifications",
    ],
    outcome: null,
    // Native Android, not Flutter. The installed APK carries zero Flutter
    // artefacts, 6 Kotlin ones and 209 Android XML layouts, and the view
    // tree exposes real Android widget IDs. The résumé's "Native Android
    // Projects" heading was right; its "Flutter" technology line was not.
    stack: ["Kotlin", "Android SDK", ".NET API", "Google Maps", "Payments"],
    hue: 38,
    // Captured from the running app on emulator-5554 via adb screencap,
    // downscaled to 600px wide. Recapture the same way if the demo data
    // changes.
    media: [
      {
        src: "/work/instapour-dispatch.jpg",
        alt: "InstaPour job-site map tracking Mixer #104 with an 8-minute ETA and 3500 PSI, a 32m pump unit and the central batch depot, above the instant dispatch selector",
      },
      {
        src: "/work/instapour-order-details.jpg",
        alt: "InstaPour order detail listing concrete grade, 12.5 cubic yards, pump requirement, colour and a 32-metre boom pump",
      },
      {
        src: "/work/instapour-orders.jpg",
        alt: "InstaPour order list showing ready-mix, aggregate, dumpster and precast orders at completed, received and pending",
      },
      {
        src: "/work/instapour-order-form.jpg",
        alt: "InstaPour order form tabbed across concrete, stone/sand, dumpster and precast, capturing company, contact and pour location",
      },
      {
        src: "/work/instapour-menu.jpg",
        alt: "InstaPour navigation drawer with order, account, notifications and language selection",
      },
    ],
    links: {},
  },
  {
    slug: "luvdrops",
    title: "LuvDrops",
    client: "LuvDrops",
    role: "Flutter Developer",
    industry: "Social & Wellbeing",
    period: null,
    featured: false,
    summary:
      "Send a little encouragement to one person, or shower a whole group.",
    problem:
      "LuvDrops wanted people to send each other small notes of encouragement - to one person, or a whole group, timed to arrive when it would land - wrapped in an identity that looks nothing like a messaging app.",
    contribution:
      "Built the Flutter client and the scheduling on Firebase.",
    constraint:
      "Almost nothing here is a stock widget. The contact list scrolls inside a heart-shaped mask, the screens are teardrops and every control is a bespoke bubble, so the layout is custom clipping and painting rather than standard containers - and it still has to stay scrollable and tappable at every screen size.",
    shipped: [
      "Email, Google and Apple sign-in",
      "Searchable contact list with invites",
      "Drops to an individual, Showers to a group",
      "Groups with participant selection",
      "Requests scheduled across a date and time window",
      "History of what has been sent",
    ],
    outcome: null,
    stack: ["Flutter", "Firebase", "Social Sign-In", "Push Notifications"],
    hue: 330,
    media: [
      {
        src: "/work/luvdrops-home.jpg",
        alt: "LuvDrops home: a searchable contact list scrolling inside a heart-shaped mask, with bubble navigation for options, help, history, request, streams and groups",
      },
      {
        src: "/work/luvdrops-group.jpg",
        alt: "LuvDrops Showers screen creating a group shower, naming the group and selecting three participants",
      },
      {
        src: "/work/luvdrops-request.jpg",
        alt: "LuvDrops Request screen composing a message to a receiver across a start and end date and time",
      },
      {
        src: "/work/luvdrops-login.jpg",
        alt: "LuvDrops sign-in with email and password plus Google and Apple sign-in options",
      },
    ],
    links: {
      store: "https://apps.apple.com/in/app/luvdrops/id1608364078",
      play: "https://play.google.com/store/apps/details?id=com.app.luv_drops",
    },
  },
];

/* ───────────────────────────────────────────────────────── experience ── */

export const roles: Role[] = [
  {
    company: "BytesTechnolab",
    position: "Senior Flutter Developer",
    location: "Ahmedabad, Gujarat",
    start: "2023-11",
    end: null,
    summary:
      "Lead mobile delivery across client engagements and mentor the Flutter team, with a focus on release engineering and architecture that survives handover.",
    achievements: [],
    stack: ["Flutter", "Dart", "Bloc", "Firebase", "CI/CD", "Shorebird"],
  },
  {
    company: "Intelivita",
    position: "Team Lead & Flutter Developer",
    location: "Ahmedabad",
    start: "2023-01",
    end: "2023-10",
    summary:
      "Led a Flutter team through project delivery while staying hands-on across the codebase.",
    achievements: [],
    stack: ["Flutter", "Dart", "GetX", "Firebase", "REST APIs"],
  },
  {
    company: "Space-O Technologies",
    position: "Flutter & Android Developer",
    location: "Ahmedabad",
    start: "2022-03",
    end: "2023-01",
    summary:
      "Built cross-platform client applications, moving between Flutter delivery and native Android integration work.",
    achievements: [],
    stack: ["Flutter", "Dart", "Android", "Kotlin", "REST APIs"],
  },
  {
    company: "Aimperior Technologies",
    position: "Android → Flutter Developer",
    location: "Ahmedabad",
    start: "2019-03",
    end: "2022-03",
    summary:
      "Joined as a junior Android developer and moved the team's delivery onto Flutter across three years.",
    achievements: [
      "Migrated delivery from native Android to Flutter, cutting two codebases to one.",
    ],
    stack: ["Android", "Java", "Kotlin", "Flutter", "Dart", "SQLite"],
  },
];

/* ─────────────────────────────────────────────────────── explorations ── */

/**
 * The lab. Written from the working builds, not from intent: every bullet
 * below is a screen or behaviour that exists. Where a capture exists it is
 * shown; where it does not, the text stands alone rather than a drawn
 * interface standing in for it.
 */
export const explorations: Exploration[] = [
  {
    slug: "medha",
    title: "Medha",
    status: "R&D prototype",
    summary:
      "A medicine reminder app for people who find phones hard, with the model running on the phone itself.",
    question:
      "Is an on-device model good enough to read a prescription and answer questions about it with no server anywhere?",
    built: [
      "Scan a prescription and it becomes medicines, doses and timings",
      "Ask a medicine question by voice, answered offline",
      "Listen aloud on every screen, for people who do not read comfortably",
      "Dose schedule with taken, skipped and snoozed states",
      "Monthly adherence calendar, exported as a PDF for the doctor",
      "Opt-in caregiver contact, where the user chooses what is shared",
      "Several patients on one phone",
    ],
    constraint:
      "Medicine data is about as sensitive as anything a phone carries, and the people who most need the reminders are the least likely to manage an account or a cloud setting. So there is no account and no server: Gemini Nano runs on the device, and the home screen says so in as many words. Everything - reading the prescription, answering the question, speaking it back - has to fit inside what the phone can do offline.",
    stack: [
      "Flutter",
      "Gemini Nano",
      "On-device LLM",
      "Text-to-speech",
      "Local notifications",
      "PDF export",
    ],
    hue: 168,
    media: [
      {
        src: "/work/medha-home.jpg",
        alt: "Medha home: a 100% offline badge, a voice Ask card, and today's doses listed with their times",
      },
      {
        src: "/work/medha-reminders.jpg",
        alt: "A missed dose of Crocin 500 with Listen aloud, Snooze 10 min, Skip and Taken actions",
      },
      {
        src: "/work/medha-medicines.jpg",
        alt: "The medicine list grouped under From prescription, each with dose, timing and a Listen aloud button",
      },
      {
        src: "/work/medha-profile.jpg",
        alt: "Profile with the offline badge, a language switch and Switch patient for more than one person on a phone",
      },
      {
        src: "/work/medha-caregiver.jpg",
        alt: "Caregiver setup: details stay on the phone, nothing is sent automatically, sharing is opt-in",
      },
    ],
    links: {},
  },
  {
    slug: "expense-tracker-ai",
    title: "Expense Tracker AI",
    status: "R&D prototype",
    summary:
      "An expense app you can feed from anywhere - a receipt, a gallery image, a statement PDF, a bank SMS, or a share from any other app - with the reading done on the phone.",
    question:
      "How much of the tedium of expense tracking can a 1B model on the phone take off you, without it ever inventing a number?",
    built: [
      "Five ways in: manual, camera, gallery, statement PDF, and a bank or UPI SMS parser",
      "Share a bill into it from any other app",
      "Itemised bills split one transaction per line, the stated total kept as a checksum",
      "Spend trend, top category, budget limits with 80% warnings and rollover",
      "Encrypted at rest, biometric lock, optional Wi-Fi-only cloud backup",
      "English and Hindi",
    ],
    constraint:
      "In a ledger a model that invents a number is worse than no model at all, so nothing the LLM says is taken on trust: an extracted amount has to appear verbatim in the ML Kit OCR text or the deterministic parse wins. The model is optional as well - the app ships in a rules-only offline mode, and the weights download on demand over Wi-Fi, resuming from the exact byte offset if the app is killed mid-download.",
    stack: [
      "Flutter",
      "Gemma 3 1B",
      "MediaPipe LiteRT",
      "ML Kit OCR",
      "Drift + SQLCipher",
      "Firebase",
    ],
    hue: 282,
    media: [
      {
        src: "/work/expense-home.jpg",
        alt: "Dashboard: a Local-Only badge, the month's spend, top category and daily average, four capture buttons and a spend trend chart",
      },
      {
        src: "/work/expense-capture.jpg",
        alt: "Add expense: manual, camera, gallery and PDF capture modes each marked offline and secure, plus a bank and UPI SMS parser",
      },
      {
        src: "/work/expense-budgets.jpg",
        alt: "Budgeting: overall usage, smart rollover, 80% limit warnings and an option to reallocate limits from spending trends",
      },
      {
        src: "/work/expense-sync.jpg",
        alt: "Sync and backup: cloud status, Wi-Fi-only syncing, receipt compression and a count of records backed up",
      },
      {
        src: "/work/expense-settings.jpg",
        alt: "Settings: biometric lock, English and Hindi, JSON ledger export, and the optional on-device ExpenseAI model",
      },
    ],
    links: {},
  },
  {
    slug: "storefront-mcp",
    title: "Storefront MCP",
    status: "R&D prototype",
    summary:
      "A shop's catalogue exposed to ChatGPT as an MCP server, answering in product cards rendered inside the conversation rather than in paragraphs.",
    question:
      "Can a storefront live inside ChatGPT - searchable, browsable, and still sending the customer back to the shop to buy?",
    built: [
      "Two MCP tools over the store's Magento REST API: product search and product detail",
      "A product card widget registered as an MCP UI resource and rendered in the chat",
      "Image, price, stock and SKU on each card, with a button through to the product page",
      "Zod-typed tool schemas, so the model cannot call them with junk",
      "Store credentials held server-side; the model only ever sees product fields",
    ],
    constraint:
      "The Apps runtime does not hand a widget its data one way. It can already be on the page before the widget script runs, it can arrive as an openai:set_globals event, or it can come over the MCP Apps postMessage bridge as a tool-result notification. So the widget listens for all three and renders from whichever lands first. The REST integration behind it was ordinary work; this was the part with no firm ground under it.",
    stack: [
      "Node.js",
      "MCP SDK",
      "ChatGPT Apps SDK",
      "Express",
      "Zod",
      "Magento 2 REST",
    ],
    hue: 214,
    media: [],
    links: {},
  },
  {
    slug: "mediaproof",
    title: "MediaProof",
    status: "R&D prototype",
    summary:
      "Upload an image or a clip and get two answers kept deliberately apart: what its Content Credentials can prove, and what a detector merely estimates.",
    question:
      "Can you tell somebody whether media was AI-generated without overstating what you actually know?",
    built: [
      "C2PA manifests read and signatures verified, with valid and trusted reported separately",
      "Detection providers pluggable, their score always labelled an estimate",
      "Video sampled across frames: the mean, the strongest frame, and how many were flagged",
      "SVG rasterised for detection while hashing and provenance read the original bytes",
      "An evidence list generated from structured data, with the LLM allowed to rephrase it and nothing else",
      "GPS coordinates never extracted, and the working file deleted in a finally block",
    ],
    constraint:
      "A signature and a detector score are not the same kind of claim: one either verifies or it does not, the other is a guess that is wrong in both directions. So the two are never merged into a single number, and every verdict says which of them it rests on. When a clip's frames disagree - four calm and one at 97% - the answer is \"unable to determine\" with the counts shown, rather than a confident average that would hide the interesting case.",
    stack: [
      "FastAPI",
      "c2pa-python",
      "Next.js",
      "React 19",
      "Postgres",
      "Docker",
    ],
    hue: 32,
    mediaLayout: "wide",
    media: [
      {
        src: "/work/mediaproof-landing.jpg",
        alt: "MediaProof landing page: verified and estimated explained as two different kinds of claim, above a drop zone",
      },
      {
        src: "/work/mediaproof-result.jpg",
        alt: "A result: verified AI provenance, signature verified but the issuer not on a known trust list, with the credential's recorded history",
      },
    ],
    links: {},
  },
];

/* ────────────────────────────────────────────────────── capabilities ── */

export const capabilities: CapabilityGroup[] = [
  {
    group: "Core",
    blurb: "Where the bulk of seven years has gone.",
    items: [
      { name: "Flutter", years: 5 },
      { name: "Dart", years: 5 },
      { name: "Android - Java", years: 7 },
      { name: "Kotlin", note: "Working knowledge" },
      { name: "iOS", note: "Cross-platform delivery & store release" },
    ],
  },
  {
    // Grows as each Lab project lands. Named tools only - "AI" on its own
    // says nothing, and a reader who builds with these can tell.
    group: "AI & ML",
    blurb: "Current R&D. On-device first, where the constraint is the phone.",
    items: [
      { name: "Gemini Nano", note: "On-device, bridged into Flutter" },
      { name: "Gemma 3 1B", note: "On-device, via MediaPipe LiteRT" },
      { name: "ML Kit OCR", note: "Receipt text, and an amount cross-check" },
      { name: "MCP", note: "Tools and UI resources over a REST backend" },
      { name: "ChatGPT Apps SDK", note: "Widgets rendered inside the chat" },
      { name: "C2PA", note: "Content Credentials, verified not guessed" },
      { name: "On-device inference", note: "Prompt and parse with no server" },
    ],
  },
  {
    group: "State & architecture",
    blurb: "Patterns chosen for handover, not novelty.",
    items: [
      { name: "Bloc" },
      { name: "GetX" },
      { name: "Clean architecture", note: "Feature-first modularisation" },
      { name: "Platform channels", note: "Native bridging" },
    ],
  },
  {
    group: "Android platform APIs",
    blurb: "Native Android work underneath the Flutter layer.",
    items: [
      { name: "NotificationManager" },
      { name: "MediaPlayer & Recorder" },
      { name: "AudioManager" },
      { name: "Custom Views" },
      { name: "DataBinding" },
    ],
  },
  {
    group: "Backend & data",
    blurb: "Offline-first where the network cannot be assumed.",
    items: [
      { name: "Firebase", years: 3, note: "Auth · Firestore · RTDB · FCM" },
      { name: "REST APIs", years: 4 },
      { name: "SQLite", note: "Local persistence" },
      { name: "Supabase", note: "Postgres · row-level security" },
      { name: "Postman" },
      { name: "Swagger" },
    ],
  },
  {
    group: "Payments",
    blurb: "Shipped through store review on both platforms.",
    items: [
      { name: "Stripe" },
      { name: "RazorPay" },
      { name: "PayPal" },
      { name: "In-app purchase", note: "Play Billing · StoreKit" },
    ],
  },
  {
    group: "Platform services",
    blurb: "The integrations client apps actually ask for.",
    items: [
      { name: "Google Maps & Location" },
      { name: "Google Auth" },
      { name: "QuickBlox", note: "Chat & voice SDK" },
      { name: "Speech recognition" },
      { name: "Localisation", note: "Multi-language delivery" },
    ],
  },
  {
    group: "Release engineering",
    blurb: "Few Flutter CVs mention any of this. It is the differentiator.",
    items: [
      { name: "Shorebird", note: "Out-of-band code push" },
      { name: "FVM", note: "Pinned Flutter toolchains" },
      { name: "--dart-define", note: "Build-time environment config" },
      { name: "Microsoft Clarity", note: "Session replay · heatmaps" },
      { name: "Git & CI", years: 5 },
      { name: "Linux", note: "Fundamentals" },
    ],
  },
  {
    group: "Languages",
    blurb: "",
    items: [
      { name: "English", note: "Professional" },
      { name: "Hindi", note: "Native" },
      { name: "Gujarati", note: "Native" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────── writing ── */

// Tags corrected — the previous build tagged the FVM guide with
// "Provider / Bloc / Riverpod" and the Gemini piece with "Firestore".
export const articles: Article[] = [
  {
    title: "Spy on Your Flutter Users (Legally) with clarity_flutter",
    excerpt:
      "Adding Microsoft Clarity to a Flutter app for session replay, heatmaps and rage-tap detection - so you stop guessing at your own UX.",
    url: "https://medium.com/@developerdivyaraj/%EF%B8%8F-%EF%B8%8F-spy-on-your-flutter-users-legally-with-clarity-flutter-1-0-0-880afbd242cb",
    published: "2025-06-23",
    readMinutes: 3,
    tags: ["Flutter", "Analytics", "Session Replay"],
  },
  {
    title: "Stop Hardcoding Like It's 2012: Use --dart-define in Flutter",
    excerpt:
      "Managing API URLs, feature flags and environments properly - with and without Shorebird - plus automating it from .env files.",
    url: "https://medium.com/@developerdivyaraj/%EF%B8%8F-stop-hardcoding-like-its-2012-use-dart-define-in-flutter-yes-even-with-shorebird-63807bec5c19",
    published: "2025-06-16",
    readMinutes: 4,
    tags: ["Flutter", "Build Config", "Shorebird"],
  },
  {
    title: "Mastering Flutter Version Management (FVM)",
    excerpt:
      "Installing, configuring and living with FVM so multiple Flutter versions stop breaking each other across projects.",
    url: "https://medium.com/@developerdivyaraj/mastering-flutter-version-management-fvm-a-complete-guide-1d7427488c61",
    published: "2025-05-18",
    readMinutes: 3,
    tags: ["Flutter", "Tooling", "FVM"],
  },
  {
    title: "Under the Hood: AI Tools for Mobile Developers",
    excerpt:
      "A technical look at how AI-assisted mobile tooling actually works, and where it earns a place in a real workflow.",
    url: "https://medium.com/@developerdivyaraj/under-the-hood-ai-tools-for-mobile-developers-a-technical-deep-dive-47966d3f188e",
    published: "2025-05-17",
    readMinutes: 8,
    tags: ["AI", "Mobile Development", "Tooling"],
  },
  {
    title: "Streamline Your Flutter App Updates with Shorebird Code Push",
    excerpt:
      "Shipping Flutter fixes without waiting on store review, and what that changes about release planning.",
    url: "https://medium.com/@developerdivyaraj/streamline-your-flutter-app-updates-with-shorebird-code-push-14d661db7d0c",
    published: "2025-01-03",
    readMinutes: 3,
    tags: ["Flutter", "Shorebird", "Release Engineering"],
  },
  {
    title: "Gemini 2.0 Flash Experimental: A Leap Towards the Future",
    excerpt:
      "What Gemini 2.0 Flash Experimental offers, and the implications for AI features inside mobile apps.",
    url: "https://medium.com/@developerdivyaraj/gemini-2-0-flash-experimental-a-leap-towards-the-future-7f2c223ccc0c",
    published: "2024-12-21",
    readMinutes: 3,
    tags: ["AI", "Gemini", "Mobile"],
  },
];

/* ─────────────────────────────────────────────────────── credentials ── */

// Reverse-chronological. The old site printed the 2016 diploma above the
// 2019 degree.
export const credentials: Credential[] = [
  {
    institution: "Apollo Institute of Engineering & Technology",
    qualification: "Bachelor of Engineering",
    field: "Computer Engineering",
    graduated: "2019",
    location: "Gandhinagar, Gujarat",
    affiliation: "Gujarat Technological University",
  },
  {
    institution: "V.P.M.P Polytechnic",
    qualification: "Diploma",
    field: "Computer Engineering",
    graduated: "2016",
    location: "Gandhinagar, Gujarat",
    affiliation: "Gujarat Technological University",
  },
];

/* ─────────────────────────────────────────────────────────── config ──── */

/**
 * Nav order. Structure rather than content, so it stays in code: adding an
 * entry here means adding a section component too.
 */
export const sections = [
  { id: "work", label: "Work" },
  { id: "lab", label: "Lab" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "capabilities", label: "Capabilities" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
] as const;

/**
 * EmailJS ids, from the environment - the previous build hardcoded them in the
 * bundle and left them open to any origin. Restrict them to the production
 * domain in the EmailJS dashboard. With none set, the contact form falls back
 * to opening a mailto: draft.
 */
export const emailjs = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "",
};

/* ──────────────────────────────────────────────────────── derived ──── */

/** Exported for deriveStats in content.ts - the one place a number is made. */
export const CAREER_START = "2019-03";

export function numberWord(n: number): string {
  const words = [
    "Zero", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  ];
  return words[n] ?? String(n);
}

export function formatPeriod(start: string, end: string | null): string {
  const fmt = (iso: string) => {
    const [y, m] = iso.split("-").map(Number);
    return new Date(y, m - 1).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(start)} - ${end ? fmt(end) : "Present"}`;
}
