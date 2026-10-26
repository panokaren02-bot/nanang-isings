import {
  proposalRoleDefinitions,
  proposalRoleIdAliases,
} from "@/content/proposal-roles"

export type TimelineIconName =
  | "arrival"
  | "rings"
  | "departure"
  | "cocktail"
  | "fireworks"
  | "dance"
  // Debut program icons
  | "sun"
  | "moon"
  | "crown"
  | "rose"
  | "gift"
  | "toast"
  | "candle"
  | "music"
  | "video"
  | "dinner"

export type AttireGroupId = "sponsors" | "entourage" | "guests"
// A palette color: "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
export type AttireColor = string | { name: string; hex: string }

/* ============================================================================
   SOP — CREATING / UPDATING A DEBUT INVITATION
   ----------------------------------------------------------------------------
   This file is the single source of truth for the celebrant's content. Pages,
   metadata (link previews), robots.txt, sitemap.xml, QR codes, the table
   finder and proposal pages all read from here. Avoid hard-coding the
   celebrant's name, dates, URLs or image paths in components — add them here.

   Colors live in app/globals.css (→ "MOTIF COLORS — DEBUT"), not here.

   NEW INVITATION — work top to bottom:
     1. CELEBRANT       name + nickname + age ({celebrant} in any text → nickname)
     2. DATE & TIMES    debut date, day, guest arrival / program / end times
     3. VENUE           name, address, Google Maps link, photos;
                        VENUE_CARDS = labels on the Event Details venue card
     4. RSVP            deadline, coordinator, phone; HASHTAGS
     5. WEBSITE         SITE_URL = the live domain (keep the trailing "/").
                        LINK_PREVIEW_IMAGE = 1200×630 JPG for Facebook/Messenger.
                        NEXT_PUBLIC_SITE_URL (env, e.g. on Vercel) overrides SITE_URL.
     6. LOOK & FEEL     DISPLAY_MODE "plain" or "photos"
     7. SHARED IMAGES   monogram, name lettering, wax seal, theme song, CELEBRANT_PHOTOS
     8. googleAPI       new Apps Script / Form URLs for THIS celebrant's sheet —
                        never reuse a previous client's (guests would mix).
     9. SECTIONS        program flow, attire, reminders, FAQ, gift guide,
                        theme song, snap & share, socials.
    10. Search for "⚠ check" and replace anything still left over.

   BEFORE GOING LIVE:
     • Put every referenced file in /public (paths are case-sensitive on Vercel).
     • Run `npm run build` to catch typos.
     • Paste the live URL in https://developers.facebook.com/tools/debug/ and
       click "Scrape Again" so Facebook picks up the new title + preview image.
     • Test RSVP search, a test RSVP submission, messages and /table on mobile.

   CONVENTIONS:
     • Image paths start with "/" and are relative to /public.
     • "" on a decoration/image hides it; show: false hides a card/account/link.
     • Placeholders like {celebrant}, {name}, {deadline} are filled automatically —
       keep the braces when editing text.
     • ⚠ marks values that still need the client's confirmation.
   ============================================================================ */

/* ============================================================================
   QUICK SETUP — edit these first.
   Every section below reads from here, so one change updates the whole site
   (loader, envelope, hero, details, program, RSVP, FAQ, footer, …).
   ============================================================================ */

// ── The celebrant ───────────────────────────────────────────────────────────
const CELEBRANT = {
  fullName: "Felisa Baquiran Gammad",
  nickname: "Nanang Ising", // Used everywhere as {celebrant}
  age: "100",
  ageWords: "One Hundred",
  title: "Centenarian",
}

// ── Event details (from the client brief) ───────────────────────────────────
const EVENT = {
  type: "100th Birthday",
  theme: "100th Birthday Celebration",
  motif: "Best Sunday Outfit",
  colors: "Champagne Cream, Blush Pink, Dusty Rose, Mauve Pink, Champagne Gold, Ivory White",
  birthday: "November 20, 2026", // Actual birthday — the celebration is the day after
  themeSong: {
    title: "", // Add the celebrant's chosen theme song
    artist: "",
  },
}

// ── Date & times ────────────────────────────────────────────────────────────
const EVENT_DATE = "November 20, 2026"
const EVENT_DAY = "Friday"

const TIMES = {
  guestArrival: "6:00 PM", // ⚠ check — call time not given, using the event time
  program: "6:00 PM", // Program proper — countdown target
  end: "", // Add confirmed event end time
}

// ── Venue ───────────────────────────────────────────────────────────────────
// false = venue not final yet: every section shows "To Follow" and the Event Details
// card hides the address, map, QR code and photos. Flip to true once confirmed.
const VENUE_ANNOUNCED = true

const CONFIRMED_VENUE = {
  name: "Hotel Casa Angela",
  address: "Aguinaldo, Corner Taft St, Tuguegarao City, 3500 Cagayan, Philippines",
  map: "https://maps.app.goo.gl/iDWPTGRC15CYqHjy8",
  // Step-by-step directions (Event Details card + FAQ)
  directions: [
    "Head to Aguinaldo Street, Tuguegarao City.",
    "Hotel Casa Angela is at the corner of Aguinaldo and Taft Street.",
  ],
  landmarks: [] as string[],
  photos: ["/Details/venue (4).jpg", "/Details/venue (5).jpg"] as string[],
}
const PENDING_VENUE: typeof CONFIRMED_VENUE = {
  name: "To Follow",
  address: "",
  map: "",
  directions: [],
  landmarks: [],
  photos: [],
}
const VENUE = VENUE_ANNOUNCED ? CONFIRMED_VENUE : PENDING_VENUE
const CEREMONY_VENUE = VENUE
const RECEPTION_VENUE = VENUE

// ── Venue card (Event Details section) ──────────────────────────────────────
// layout:
//   "combined" = ONE card (use this for a debut — single venue)
//   "separate" = two cards (CEREMONY_VENUE + RECEPTION_VENUE)
// badge        = small pill on the photo
// sectionLabel = label above the venue name
// showDate     = show the big Month / Day / Year
// showArrival  = show "Arrival: <guest arrival time>" (otherwise "At <time>")
const VENUE_CARDS = {
  layout: "combined" as "separate" | "combined",
  combined: {
    badge: "The Celebration",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: false,
    // Time rows on the card, e.g. "Doors 7:00 PM | Program 7:30 PM"
    ceremonyLabel: "Program",
    receptionLabel: "Until",
    // true = also show the end time on the card
    showReceptionTime: false,
  },
  ceremony: {
    show: true,
    badge: "Program",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: true,
  },
  reception: {
    show: false,
    badge: "After Glow",
    sectionLabel: "Venue",
    showDate: false,
    showArrival: false,
  },
}

// ── RSVP & contact ──────────────────────────────────────────────────────────
const RSVP = {
  deadline: "", // Add confirmed RSVP deadline
  coordinator: "Nanang Ising's Family",
  phone: "", // ⚠ check — add the family's contact number
  alternatePhone: "",
}

// ⚠ check — confirm hashtags with the family
const HASHTAGS = [
  "#NanangIsingAt100",
  "#100YearsOfNanangIsing",
]
// ── Attire guide (Event Details → Attire Guidelines) ────────────────────────
// SHOW = which cards to display AND their order, top to bottom. Examples:
//   ["guests"]                            guests only
//   ["entourage", "guests"]               entourage (18 Roses etc.) + guests
//   []                                    hide the whole attire guide
// Each card: fill in only what you need — anything left "" or [] is hidden.
//   image:     illustration path in /public ("" = no image)
//   palette:   colors for this card — "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
//   ladies / gentlemen:
//     label:     e.g. "Ladies", "Gentlemen" — leave "" to hide the heading (good for one inclusive blurb)
//     details:   the dress code text ("" hides this half of the card)
//     highlight: phrase inside details shown bold + underlined ("" for none)
// Brief: Best Sunday Outfit

const ATTIRE = {
  show: ["guests"] as AttireGroupId[], // one dress code for everyone

  sponsors: {
    title: "Family & Principal Sponsors",
    image: "",
    palette: [],
    ladies: {
      label: "Ladies",
      details:
        "Elegant formal gowns or cocktail dresses in champagne gold, ivory, black, silver, or other colors except red.",
      highlight: "Formal Gowns",
    },
    gentlemen: {
      label: "Gentlemen",
      details:
        "Formal black suits, tuxedos, or elegant barong with tailored slacks. Any color except red.",
      highlight: "Formal Black Suits",
    },
  },

  entourage: {
    title: "Entourage",
    image: "",
    palette: [],
    ladies: {
      label: "Ladies",
      details:
        "Elegant formal gowns or cocktail dresses in champagne gold, ivory, black, silver, or other colors except red. Choose a polished, gala-ready look.",
      highlight: "Formal Gowns",
    },
    gentlemen: {
      label: "Gentlemen",
      details:
        "Black suits, tuxedos, or black long-sleeved dress shirts with tailored slacks. Keep your look formal and refined.",
      highlight: "Formal Attire",
    },
  },

  guests: {
    title: "Best Sunday Outfit",
    image: "/Details/attire.png",
    palette: [],
    ladies: {
      label: "Ladies",
      details:
        "Wear a dress — soft florals, lace, or a Sunday Best Dress in gentle pastels — blush, lilac, mint, butter yellow, or powder blue.",
      highlight: "gentle pastels",
    },
    gentlemen: {
      label: "Gentlemen",
      details:
        "Wear pants and a polo — a light linen polo or a crisp button-down in soft pastel tones, paired with neat pants.",
      highlight: "soft pastel tones",
    },
  },
}

// ── Website address (used for QR codes, link previews, table finder) ────────
// NEXT_PUBLIC_SITE_URL (env) overrides this when set.
const SITE_URL = "https://nanang-isings-100th-birthday.weddinginvitationrsvp.com/"
// Image shown when the link is shared (Facebook, Messenger, Viber, X, …).
// Messenger is strict: use a JPG exactly 1200×630, under ~300 KB. When you replace it,
// change the file name (or bump ?v=) so Facebook fetches the new one instead of its cache.
const LINK_PREVIEW_IMAGE = "/Details/link-preview-1200x630.jpg?v=3"
const LINK_PREVIEW_IMAGE_SIZE = { width: 1200, height: 630, type: "image/jpeg" }

// Site address with env override applied and no trailing slash — no need to edit
export const canonicalSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, "")
// A leftover NEXT_PUBLIC_SITE_URL from another client's project makes every link preview
// point at the wrong site (Messenger follows og:url) — flag it in the build log.
if (canonicalSiteUrl !== SITE_URL.replace(/\/$/, "")) {
  console.warn(
    `[site] NEXT_PUBLIC_SITE_URL (${canonicalSiteUrl}) differs from SITE_URL (${SITE_URL}). ` +
      "Link previews, QR codes and canonical URLs will use the env value.",
  )
}

// ── Look & feel ─────────────────────────────────────────────────────────────
// "plain"  = no photos anywhere: pearl pattern backgrounds, gold ornaments,
//            hides photo-only blocks (best until the debut photos arrive)
// "photos" = celebrant photos on the loader, envelope, hero, messages,
//            reminders, snap & share and the closing section
// ⚠ "plain" until Nanang Ising's photos are added (the old photos were the previous client's)
const DISPLAY_MODE = "plain" as "photos" | "plain"

// ── Shared images ───────────────────────────────────────────────────────────
const BRAND = {
  monogram: "/monogram/monogram.png", // baroque sun + moon "Y" (tinted per section)
  // Name lettering image (loader, envelope, proposals). "" = name in script text
  nameImage: "",
  seal: "/monogram/seal.png", // envelope wax seal
  // Theme song — drop the MP3 into /public/background_music with this exact name
  backgroundMusic: "/background_music/HAPPY BIRTHDAY INSTRUMENTAL.mp3", // ⚠ check — file not added yet
}

// Celebrant photos used in "photos" mode (loader, envelope, hero, reminders,
// snap & share, closing) — Yohana's debut shoot in /public/mobile-background.
// The /gallery page reads every file in /public/mobile-background and /public/desktop-background.
const CELEBRANT_PHOTOS = Array.from(
  { length: 22 },
  (_, i) => `/mobile-background/debut (${i + 1}).webp`,
)
// Nanang Ising's photos (story chapters + gallery section) — /public/mobile-background
const NANANG_PHOTOS = [1, 2, 3, 4, 5].map((n) => `/mobile-background/nanang-${n}.png`)

// Favorites picked for specific spots (index = file number − 1)
const PHOTO = (n: number) => CELEBRANT_PHOTOS[n - 1]

// ── Decorations ─────────────────────────────────────────────────────────────
// The botanical PNGs are tinted antique gold by --deco-filter in app/globals.css.
// Change a path here to swap it on every section at once.
// To change ONE section only, override it there, e.g. decos: { ...SECTION_DECOS, footerVine: "" }
const DECOR = {
  cornerTopLeft: "/deco/top-left-deco.png",
  cornerTopRight: "/deco/top-right-deco.png",
  cornerBottomLeft: "/deco/bottom-left-deco.png",
  cornerBottomRight: "/deco/bottom-right-deco.png",
  headerOrnament: "/deco/lovestorydeco/Elegant-Eucalyptus-centerdot.png", // small sprig above titles
  footerVine: "/deco/lovestorydeco/Elegant-Eucalyptus-bottom.png", // long vine at section ends
  sideLeft: "/deco/lovestorydeco/Elegant-Eucalyptus-Left.png", // side sprigs
  sideRight: "/deco/lovestorydeco/Elegant-Eucalyptus-Right.png",
}

// The four corners as one set
const CORNER_DECOS = {
  topLeft: DECOR.cornerTopLeft,
  topRight: DECOR.cornerTopRight,
  bottomLeft: DECOR.cornerBottomLeft,
  bottomRight: DECOR.cornerBottomRight,
}

// Default decoration set used by most sections (corners + ornament + vine)
const SECTION_DECOS = {
  ...CORNER_DECOS,
  headerOrnament: DECOR.headerOrnament,
  footerVine: DECOR.footerVine,
}

/* ============================================================================
   SECTIONS — wording and per-section options. Values above are referenced here.
   ============================================================================ */

// Principal sponsors Google Apps Script — used by the main page and /inviteone
// ⚠ check — every googleAPI URL below still points to the template's sheets.
const SPONSORS_API = "https://script.google.com/macros/s/AKfycbywDjDRU1M_qEUzGwxyRQR9qgphZZ_Ck8Hu5xXH_HcWlYxZimAdIosyKFCrKetw3Od6/exec"

export const siteConfig = {
  siteUrl: SITE_URL,
  linkPreviewImage: LINK_PREVIEW_IMAGE,
  linkPreviewImageSize: LINK_PREVIEW_IMAGE_SIZE,
  // The celebrant — read by every section. {celebrant} in any text → nickname.
  celebrant: {
    ...CELEBRANT,
    monogram: BRAND.monogram,
  },
  event: EVENT,
  // Navbar links (components/navbar.tsx) — same order as the sections on the page.
  // wideOnly: shown in the desktop bar only on extra-wide screens (always in the phone menu).
  nav: {
    links: [
      { href: "#home", label: "Home" },
      { href: "#welcome", label: "Welcome", wideOnly: true },
      { href: "#love-story", label: "100 Years" },
      { href: "#countdown", label: "Countdown", wideOnly: true },
      { href: "#gallery", label: "Gallery" },
      { href: "#messages", label: "Messages" },
      { href: "#details", label: "Details" },
      { href: "#wedding-timeline", label: "Program" },
      { href: "#guest-list", label: "RSVP" },
      { href: "#guests", label: "Guests" },
      { href: "#faq", label: "FAQ" },
      { href: "#registry", label: "Gifts" },
      { href: "#playlist", label: "Theme Song" },
      { href: "#snap-share", label: "Snap & Share" },
      { href: "#see-you-there", label: "See You There", wideOnly: true },
    ] as { href: string; label: string; wideOnly?: boolean }[],
  },
  // Legacy shape kept for the dashboard / Google Sheet merge — mirrors the celebrant.
  couple: {
    bride: CELEBRANT.fullName,
    brideNickname: CELEBRANT.nickname,
    groom: "",
    groomNickname: "",
    monogram: BRAND.monogram,
    backgroundMusic: BRAND.backgroundMusic,
  },
  googleAPI:{
    messageForm: "https://docs.google.com/forms/d/e/1FAIpQLSdkzHOVo792sYhzG88_pCGsBa7nTsgMiWX8d4_PtEbSEF22tg/formResponse", // ⚠ check
    message: "https://script.google.com/macros/s/AKfycbwkbOz_yQ5qyi-OrdWRxHfcg6M6r2NtibsWiSg6YNgyb3jev-P-FSno8TMX6Bvn3hma/exec", // ⚠ check
    guestList: "https://script.google.com/macros/s/AKfycbwOVlJ9ygNKAdWiTaP_vJ5tqvWRVK7EBCsBWFaYY6X5aeRkQVJkyVLX0vhXx4-o2Q1t/exec", // ⚠ check
    guestRequest: "https://script.google.com/macros/s/AKfycbyeGVlkigUwFax8tgbBEnKyUCJthV-S_FJ1sDn8Fig3SdvtVEf0bDFbwHXek04dgBKq/exec", // ⚠ check
    entourage: "https://script.google.com/macros/s/AKfycbxgIGlK0OX4mRD2CakD8KJcDFP70WAfYiR10LUuN8NaZgVA9mM52CXW0YH-CqSYePLp/exec", // ⚠ check
    sponsors: SPONSORS_API,
    // Principal sponsors shown on /inviteone and /invitetwo (entourage section)
    sponsorsInviteOne: SPONSORS_API,
    sponsorsInviteTwo: "https://script.google.com/macros/s/AKfycbywDjDRU1M_qEUzGwxyRQR9qgphZZ_Ck8Hu5xXH_HcWlYxZimAdIosyKFCrKetw3Od6/exec",
    googleShare: "https://docs.google.com/spreadsheets/d/1v0hE0Y1x4fKej7djB1rYIt4WrxUHLVFcnMNJlIjhITo/edit?usp=sharing", // ⚠ check
    videoMessageForm:
      "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform",
  },
  wedding: {
    date: EVENT_DATE,
    time: TIMES.program,
    venue: VENUE.name,
    tagline: `is turning ${CELEBRANT.age}`,
    theme: EVENT.theme,
    motif: EVENT.motif,
  },
  // Top hero on the main page (components/sections/hero.tsx)
  hero: {
    srTitle: "You're invited to Nanang Ising's 100th Birthday Celebration",
    kicker: "You're invited to", // Small line above the title ("" hides it)
    titleMain: "{celebrant}’s", // Big serif line
    titleScript: "100th Birthday", // Script line overlapping it
    eyebrow: "A century of love, faith & family",
    countdownHeading: "Until we celebrate {celebrant}",
    countdownLabels: {
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },
  },
  // Welcome letter (components/sections/welcome.tsx)
  welcome: {
    title: "Welcome",
    script: "to a century of blessings",
    paragraphs: [
      "Dear family and friends — on November 20, 2026, our beloved Nanang Ising turns one hundred. A hundred years of love, faith, and quiet strength have shaped every one of us, and we are gathering to give thanks.",
      "Inside this invitation you will find everything for the celebration: the program, the venue, the dress code, and a few gentle reminders. Come in your Best Sunday Outfit and bring your warmest smile.",
      "Thank you for every prayer, every visit, and every kindness shown to Nanang through the years. Sharing this milestone with everyone who loves Nanang is the most beautiful gift we could ask for.",
    ],
    signOff: "With love and gratitude,",
    signature: "The Family",
  },
  // Opening "Save the Date" loading screen (components/loader/LoadingScreen.tsx).
  // Styled like a red-velvet soirée poster: celebrant name as the big serif title,
  // pearls + gold details, a two-column "highlights" row and a three-column details row.
  loadingScreen: {
    // "photos" = sliding photo background + photo date cards
    // "plain"  = no photos: red velvet backdrop with pearls + engraved date
    display: DISPLAY_MODE,
    // Fashion-gala poster (red velvet + gold). {celebrant} → nickname; "" hides a line.
    // Date / time / venue in the details row come from ceremony.
    gala: {
      photo: "/images/celebrant.png", // cut-out portrait (transparent background)
      eyebrow: "You are cordially invited to",
      cardEyebrow: "You're Invited", // top line on the paper card inside the envelope
      title: "{celebrant}’s",
      subtitle: "100th Birthday",
      taglineLeft: [] as string[], // side lines beside the portrait ([] hides)
      taglineRight: [] as string[],
      // Full name under the portrait: serif line + script surname ("" hides one)
      fullName: "Felisa Baquiran",
      fullNameScript: "Gammad",
      // Venue block: city line between the venue name and the full address
      venueCity: "Tuguegarao City",
      kicker: "You are invited",
      occasionNumber: CELEBRANT.age,
      occasionSuffix: "th",
      occasion: "Birthday",
    },
    // Colors used when display is "plain"
    plainTheme: {
      background: "var(--color-welcome-bg)",
      text: "var(--color-welcome-text)",
      accent: "var(--color-welcome-gold)",
    },
    // Sliding background photos behind the loader; [] = soft pastel backdrop only
    backgroundPhotos: [] as string[],
    // Poster corners: small caps at the very top (left sits beside the monogram). "" hides one.
    topLeft: "100th Birthday",
    topRight: VENUE_ANNOUNCED ? `${VENUE.name} · Tuguegarao City` : "Venue to Follow · Tuguegarao City",
    headline: "Save the Date",
    // {days} is replaced with the number of days left before the celebration
    countdownText: "{days} days until the celebration",
    countdownOneDayText: "One day until the celebration",
    countdownTodayText: "Today, we celebrate one hundred years",
    countdownPastText: "Thank you for celebrating one hundred years with us",
    coupleNameImage: BRAND.nameImage,
    // Polaroids that rise out of the envelope: [left, right, then extra desktop spots]
    photos: [
      "/mobile-background/debut (38).webp", // left
      "/mobile-background/debut (24).webp", // right
      PHOTO(6),
      PHOTO(10),
    ],
    dateLabels: ["Month", "Day", "Year"],
    // Wording around the celebrant's name (both modes; "" to hide a line)
    plainInvite: {
      ornament: DECOR.headerOrnament, // sprig on the envelope letter ("" = none)
      lineAbove: "With love and joy, you are invited to celebrate the 100th birthday of",
      lineBelow: "",
    },
    // Two numbered highlights, like a poster's "01 / 02" offers ([] hides the row)
    highlights: [
      { label: "Dress Code", text: "Best Sunday Outfit" },
      { label: "The Day", text: "A century of love & faith" },
    ],
    // Bottom details row — {guestsTime}, {programTime}, {endTime}, {venue} are filled in
    showCeremonyDetails: true,
    details: [
      { label: "Date", value: "Nov 21, 2026" },
      { label: "Venue", value: "{venue}" },
      { label: "Time", value: "{programTime}" },
    ],
    // Used by the envelope (components/loader/Hero.tsx)
    eyebrow: "You are invited",
    message: "One hundred years of love, faith & family",
    // Rotates under the progress bar while the invitation loads
    statusMessages: [
      "Gathering the family",
      "Setting the table",
      "Arranging the flowers",
      "Lighting one hundred candles",
    ],
    durationMs: 10000,
    // Invitation envelope (components/loader/Hero.tsx) — shares display + photos with loader above
    hintText: "Tap the Seal to Open",
    enterButtonText: "View the Invitation",
    sealImage: BRAND.seal,
    cornerDecos: { ...CORNER_DECOS },
  },
  // Letters section (components/sections/love-story.tsx + StorySection)
  // Plain mode shows each note as a card; photos mode adds the chapter image.
  loveStory: {
    title: "A Century of Love",
    subtitle: "one hundred years, countless blessings",
    // Word before each card's number, e.g. "Chapter 01"
    chapterLabel: "Chapter",
    closingQuote:
      "Even to your old age and gray hairs I am He, I am He who will sustain you.",
    closingCitation: "Isaiah 46:4",
    eucalyptusDecos: {
      topLeft: DECOR.sideLeft,
      bottomRight: DECOR.sideRight,
      timelineTop: DECOR.headerOrnament,
      sectionBottom: DECOR.footerVine,
    },
    // One chapter per photo in /public/mobile-background — image-left / image-right alternate
    chapters: [
      {
        title: "Where It All Began",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/nanang-1.png",
        paragraphs: [
          "On November 20, 1926, a life began that would touch generations. A century later, Nanang Ising still greets every day — and every visitor, on two legs or four — with the same warm, welcoming smile.",
        ],
      },
      {
        title: "Grace in Every Season",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: "/mobile-background/nanang-2.png",
        paragraphs: [
          "Through war and peace, lean years and plenty, Nanang carried a quiet strength that held the family together. Pearls, prayer, and patience — the treasures Nanang has worn the longest.",
        ],
      },
      {
        title: "A Garden of Faith",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/nanang-3.png",
        paragraphs: [
          "Every morning began with prayer and every Sunday with Mass. Like the flowers in Nanang's garden, the faith Nanang planted keeps blooming in children, grandchildren, and great-grandchildren.",
        ],
      },
      {
        title: "The Heart of the Family",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: "/mobile-background/nanang-4.png",
        paragraphs: [
          "Countless meals, stories, and gentle words of wisdom — Nanang's home has always been where the family gathers. Every one of us has been held by Nanang's love.",
        ],
      },
      {
        title: "One Hundred Years of Grace",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/nanang-5.png",
        paragraphs: [
          "A century of stories, lessons, and laughter. On Nov 20, 2026, come in your Best Sunday Outfit and celebrate this blessed milestone with us.",
          "With love and gratitude, The Family",
        ],
      },
    ],
  },
  // Gallery section (components/sections/gallery.tsx — not on the main page by default)
  gallery: {
    eyebrow: "Cherished Moments",
    title: "Gallery",
    subtitle: "a century of memories",
    description:
      "One hundred years of family, faith, and love — every photo holds a memory we treasure.",
    footnote:
      "More pictures will be added after the celebration. Please check back — this gallery is still growing.",
    decos: { ...SECTION_DECOS },
    images: NANANG_PHOTOS.map((image) => ({ image, text: "" })),
  },
  // Countdown section (components/sections/countdown.tsx)
  countdown: {
    title: "Counting Down",
    script: "to one hundred years",
  },
  // Event details section (components/sections/details.tsx)
  // Venue name, address, date, times, map and photos come from VENUE above.
  // In reminder text, {guestsTime}, {ceremonyTime} and {endTime} are filled in.
  eventDetails: {
    eyebrow: "The Celebration",
    title: "Event Details",
    subtitle: "Nanang Ising's 100th birthday",
    description: "Everything you need to know for this blessed celebration.",
    decos: { ...SECTION_DECOS },
    venues: VENUE_CARDS,
    // Shown on the venue card while VENUE_ANNOUNCED is false
    venueAnnounced: VENUE_ANNOUNCED,
    pendingVenue: {
      label: "Venue",
      title: "To Follow",
      message: "We're finalizing the perfect place to celebrate a century of love. The venue will be announced soon — please check back on this invitation.",
      note: "Tuguegarao City",
    },
    labels: {
      arrival: "Arrival",
      at: "At",
      scanForDirections: "Scan for directions",
      getDirections: "Get Directions",
      copyAddress: "Copy Address",
      copied: "Copied!",
    },
    attire: {
      title: "Attire Guidelines",
      description:
        "Dress as you would for a special Sunday — neat, comfortable, and in soft pastel colors that celebrate a century of grace. Little ones are welcome to match!",
      paletteTitle: "Dress Code Palette",
      paletteSubtitle: "Best Sunday Outfit",
      colorGuideTitle: "Color Guide",
      colorGuideNote:
        "There is no set palette — simply come in your Best Sunday Outfit.",
      // Shown under the attire card ("" hides it)
      note:
        "To maintain the elegance of the occasion, guests are kindly requested to avoid wearing shorts, mini skirts, tattered jeans, tank tops, and slippers.",
      // Order and visibility come from ATTIRE.show (skips blanks, typos and repeats)
      groups: ATTIRE.show
        .filter((id, i, list) => ["sponsors", "entourage", "guests"].includes(id) && list.indexOf(id) === i)
        .map((id) => ({ id, ...ATTIRE[id] })),
      palette: [] as AttireColor[], // no dress code palette
    },
    // "How to get there" card under the venue (steps + landmarks come from VENUE)
    directions: {
      title: "How to Get There",
      subtitle: `Directions to ${VENUE.name}`,
      steps: VENUE.directions,
      landmarksLabel: "Landmarks",
      landmarks: VENUE.landmarks,
      address: VENUE.address,
      // Illustrated route map (wide) + street-level photo — "" hides; add when available
      mapImage: {
        src: "",
        alt: "Route map to Hotel Casa Angela, Tuguegarao City",
        caption: "Route Map",
      },
      streetImage: {
        src: "",
        alt: "Street view of Hotel Casa Angela, Tuguegarao City",
        caption: "Hotel Casa Angela",
      },
      enlargeHint: "Tap to enlarge",
    },
    reminders: {
      title: "Gentle Reminders",
      description: "A few thoughtful notes so everyone can enjoy the celebration.",
      // 5 photos: the 1st sits in the center of the deck, two fan out on each side
      images: [
        "/box/box (1).png", // front card
        "/box/box (2).jpg",
        "/box/box (3).jpg",
        "/box/box (4).jpg",
        "/box/box (5).png",
      ],
      // showPalette: shows the dress code palette after the first paragraph
      items: [
        {
          title: "Dress Code",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Come dressed in your Best Sunday Outfit.",
          ],
        },
        {
          title: "Arrival",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "The celebration begins at {ceremonyTime}. Please arrive on time so you can find your seat and greet Nanang Ising before the program starts.",
          ],
        },
        {
          title: "Capture the Moments",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Photos are welcome! Please give way to the official photographers during the program so every moment is captured beautifully.",
          ],
        },
        {
          title: "Celebrate Together",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Stay after the program to share a meal, catch up with family, and celebrate a hundred blessed years together.",
          ],
        },
      ],
    },
  },
  // Program flow (components/sections/wedding-timeline.tsx) — from the client brief
  weddingTimeline: {
    // Built from EVENT_DATE + TIMES so it always matches Event Details
    kicker: `${EVENT_DATE.replace(/,\s*\d{4}$/, "")} · ${TIMES.program}`,
    title: "Program",
    subtitle: "the celebration unfolds",
    description:
      "From the first welcome to the final farewell, here is how we will celebrate one hundred years together.",
    quote: "Gray hair is a crown of splendor; it is attained in the way of righteousness.",
    quoteCitation: "Proverbs 16:31",
    // Optional corner decorations — leave "" to hide
    decos: {
      topLeft: "",
      topRight: "",
      bottomLeft: "",
      bottomRight: "",
    },
    // Each event — shown top to bottom in this order (move a block to reorder):
    //   show:     false = hide it (kept here to edit later)
    //   location: text under the title; {ceremony} / {reception} → venue name ("" to hide)
    //   image:    line-art illustration in /public/debut-timeline (black on transparent,
    //             shown pearl-white); "" uses the icon instead
    //   icon:     "sun" | "moon" | "crown" | "rose" | "gift" | "toast" | "candle" |
    //             "music" | "video" | "dinner" | "arrival" | "dance" | "departure" | …
    //   description: optional extra line ("" to hide)
    // ⚠ check — only the 6:00 PM start was given; confirm the program and times with the family
    events: [
      {
        show: true,
        time: TIMES.program,
        title: "Arrival of Guests",
        description: "",
        location: "{ceremony}",
        image: "/debut-timeline/message.png",
        icon: "arrival" as TimelineIconName,
      },
      {
        show: true,
        time: "",
        title: "Opening Prayer",
        description: "",
        location: "",
        image: "/debut-timeline/Invocation.png",
        icon: "candle" as TimelineIconName,
      },
      {
        show: true,
        time: "",
        title: "Welcome Remarks",
        description: "",
        location: "",
        image: "/debut-timeline/welcome-remarks.png",
        icon: "sun" as TimelineIconName,
      },
      {
        show: true,
        time: "",
        title: "Tribute Video: 100 Years of Nanang Ising",
        description: "",
        location: "",
        image: "/debut-timeline/Processional.png",
        icon: "video" as TimelineIconName,
      },
      {
        show: true,
        time: "",
        title: "Messages from the Family",
        description: "",
        location: "",
        image: "/debut-timeline/debutant-speech.png",
        icon: "music" as TimelineIconName,
      },
      {
        show: true,
        time: "",
        title: "Birthday Song, Cake & Toast",
        description: "",
        location: "",
        image: "/debut-timeline/18roses-candle-lighting.png",
        icon: "toast" as TimelineIconName,
      },
      {
        show: true,
        time: "",
        title: "Dinner & Fellowship",
        description: "",
        location: "",
        image: "/debut-timeline/dinner.png",
        icon: "dinner" as TimelineIconName,
      },
      {
        show: true,
        time: "",
        title: "Family Photos",
        description: "",
        location: "",
        image: "/debut-timeline/end-program.png",
        icon: "gift" as TimelineIconName,
      },
    ],
  },
  // Debut entourage (components/sections/entourage.tsx)
  // Names and roles come from the Google Sheet (googleAPI.entourage) — use the
  // RoleCategory values listed in categoryOrder below.
  entourage: {
    // Hidden — no debut entourage for a 100th birthday (googleAPI.entourage still
    // points to the template's sheet).
    show: false,
    eyebrow: "A Century of Love",
    title: "The Entourage",
    subtitle: "family & loved ones",
    description: "Honoring the people who have filled my hundred years with love",
    coupleKicker: "The Celebrant",
    coupleLine: "One hundred years of grace",
    coupleHeading: "The Celebrant",
    celebrantRole: "Celebrant",
    // Kept for the template — not shown on a debut
    groomRole: "",
    brideRole: "Celebrant",
    loadingText: "Loading the entourage...",
    retryingText: "Still gathering the entourage. Trying again...",
    errorText: "Unable to load the entourage",
    retryText: "Try again",
    // Sheet RoleCategory values shown in this order (anything else shows after them)
    categoryOrder: [
      "Parents of the Debutante",
      "18 Roses",
      "One of My 18 Roses",
      "18 Candles",
      "One of My 18 Candles",
      "18 Treasures",
      "One of My 18 Treasures",
      "18 Cheers",
      "One of My 18 Cheers",
      "18 Monetary Gifts",
      "One of My 18 Monetary Gifts",
    ],
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
    // Rename any heading shown in the entourage card: "Heading as shown": "Your text"
    headingLabels: {
      "Parents of the Debutante": "Parents of the Debutante",
      Escort: "Escort",
      "18 Roses": "18 Roses",
      "18 Candles": "18 Candles",
      "18 Treasures": "18 Treasure Gifts",
      "18 Cheers": "18 Cheers",
      "18 Monetary Gifts": "18 Monetary Gifts",
      // Category names as written in the entourage sheet
      "One of My 18 Roses": "18 Roses",
      "One of My 18 Candles": "18 Candles",
      "One of My 18 Treasures": "18 Treasure Gifts",
      "One of My 18 Treasure Gifts": "18 Treasure Gifts",
      "One of My 18 Cheers": "18 Cheers",
      "One of My 18 Monetary Gifts": "18 Monetary Gifts",
    } as Record<string, string>,
  },
  // RSVP / guest list (components/sections/guest-list.tsx) — card, search, RSVP form and all modals.
  // Placeholders: {name}, {count}, {n}, {celebrant}. The deadline comes from details.rsvp.deadline.
  rsvp: {
    headerOrnament: DECOR.headerOrnament, // "" to hide
    title: "Guestlist",
    script: "Sign our book",
    intro: "Kindly write your name in our guestlist so a seat can be saved for you at Nanang Ising's 100th birthday.",
    deadlineLabel: "Kindly confirm by",
    form: {
      nameLabel: "Full Name",
      namePlaceholder: "e.g. Maria Santos Dela Cruz",
      additionalLabel: "Additional Guests",
      additionalNone: "Just me",
      additionalHint: "{count} {guests} coming with you",
      guestSingular: "guest",
      guestPlural: "guests",
      maxAdditionalGuests: 10, // highest number the − / + counter goes to
      optional: "(optional)",
      phoneLabel: "Phone Number",
      phonePlaceholder: "09XX XXX XXXX",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      privacyNote: "Your phone and email are only for celebration updates from the family — they stay private and are never shown to other guests.",
      submitting: "Saving...",
      submit: "Add Me to the Guestlist",
    },
    // Thank-you modal after a guest signs the guestlist
    success: {
      title: "Thank You",
      script: "for confirming",
      text: "Your name will be in our guestlist book. We can't wait to celebrate with you!",
      messagePrompt: "Leave a message to our Lola — your words will be a keepsake from her 100th birthday.",
      messageButton: "Leave a Message to Our Lola",
      laterButton: "Maybe later",
    },
    messages: {
      nameRequired: "Please enter your full name.",
      emailInvalid: "Please check your email address, or leave it blank.",
      submitFailed: "We couldn't save your name. Please check your connection and try again.",
    },
  },
  // Messages section (components/sections/messages.tsx)
  messages: {
    title: "Love Notes",
    script: "for Nanang Ising",
    description: "Share a note, a wish, or a prayer for {celebrant}. Every message becomes a keepsake from this 100th birthday.",
    formTitle: "Share Your Wishes",
    formSubtitle: "Leave a note for {celebrant} to read and keep.",
    messagePlaceholder: "Write your wishes, prayer, or kind words for {celebrant}...",
    wallTitle: "Messages from Loved Ones",
    wallSubtitle: "Warm words from family and friends",
  },
  // Messages wall (components/sections/message-wall-display.tsx)
  // Small decorations on each message card — leave "" to hide
  messageWall: {
    emptyText: "Be the first to leave a note for Nanang Ising.",
    cardDecos: {
      topRight: DECOR.cornerTopRight,
      bottomLeft: "",
    },
  },
  // Book of guests (components/sections/book-of-guests.tsx) — confirmed guests come from the guest list API.
  bookOfGuests: {
    title: "Book of Guests",
    subtitle: "celebrating with us",
    description:
      "Meet the cherished people joining the celebration — your presence makes this day truly special.",
    statsEyebrow: "The Celebration",
    guestSingular: "Guest",
    guestPlural: "Guests",
    statsCaption: "Celebrating With Us",
    rsvpSingular: "RSVP",
    rsvpPlural: "RSVPs",
    partySingular: "Party",
    partyPlural: "Parties",
    thankYou: "Thank you for confirming your RSVP — your presence means the world to us.",
    updatedLabel: "Updated",
    refreshLabel: "Refresh guest counts",
    listEyebrow: "Joining Us",
    listDescription: "A glimpse of the wonderful guests celebrating with us",
    vipLabel: "VIP",
    noTable: "No Table Yet",
    companionsLabel: "With Them",
    companionsMore: "+{count} more",
    companionsLess: "Show less",
    confirmedLabel: "Confirmed",
    emptyTitle: "Guest list updating",
    emptyText: "Confirmed guests will appear here as RSVPs come in.",
    cardsPerView: 4,
    decos: { ...SECTION_DECOS },
  },
  // FAQ (components/sections/faq.tsx)
  // In answers you can use:
  //   {deadline}    → details.rsvp.deadline
  //   {coordinator} → details.rsvp.coordinator
  //   {contact}     → " at <phone>" when details.rsvp.phone is set (empty while "to be announced")
  //   {celebrant}   → celebrant nickname
  //   [link text](#section-id) → a link that smoothly scrolls to that section
  //   A blank line (\n\n) starts a new paragraph; lines starting with "• " show as a bulleted list
  faq: {
    eyebrow: "Before the Celebration",
    title: "Frequently Asked Questions",
    subtitle: "everything you need to know",
    description:
      "A few gentle notes so you can simply arrive, celebrate, and enjoy this blessed day with us.",
    decos: { ...SECTION_DECOS },
    // In answers: {deadline}, {coordinator}, {contact}, {celebrant}, {guestsTime},
    // {programTime}, {endTime}, {venueName}, {venueAddress} are filled in, and
    // [label](#section-id) becomes a link that scrolls to that section.
    items: [
      {
        question: "How do I RSVP?",
        answer:
          "Simply open the [RSVP](#guest-list) card on this invitation, search for your name, and confirm whether you can join us.\n\nKindly respond by {deadline} so we can prepare your seat.\n\nFor any questions, please reach out to {coordinator}{contact}.",
      },
      {
        question: "What should I wear?",
        answer:
          "Please come in your Best Sunday Outfit.\n\nSee the [Attire Guidelines](#details) for details.",
      },
      {
        question: "When is the celebration?",
        answer:
          "Nanang Ising turns 100 on November 20, 2026. The celebration will be held the next day, Saturday, November 21, 2026, at {programTime}.",
      },
      {
        question: "What time should I arrive?",
        answer:
          "The celebration begins at {programTime}. Please arrive a little early so you can find your seat and greet Nanang Ising before the program starts.",
      },
      {
        question: "Where is the celebration?",
        answer: VENUE_ANNOUNCED
          ? "{venueName}, {venueAddress}. You'll find the map, directions, and a QR code in [Event Details](#details)."
          : "The venue is to follow — we'll announce it here soon. Please check back on this invitation, or see [Event Details](#details) for updates.",
      },
      {
        question: "May I bring a plus one?",
        answer:
          "Seating is limited and the celebration is by invitation only. Kindly RSVP only for the number of seats reserved under your name.",
      },
      {
        question: "What if I can no longer attend?",
        answer:
          "Please let us know as soon as you can, so your seat can be offered to another guest.",
      },
      {
        question: "May I take photos and videos?",
        answer:
          "Of course! We'd love to see the celebration through your eyes — share them using the hashtags in [Snap & Share](#snap-share).\n\nDuring the program, kindly give way to the official photographers.",
      },
      {
        question: "I have dietary restrictions or allergies.",
        answer:
          "Please mention them when you RSVP, or let {coordinator} know, so the kitchen can prepare something just for you.",
      },
    ],
  },
  // Gift guide (components/sections/registry.tsx).
  registry: {
    eyebrow: "A Token of Love",
    title: "Gift Guide",
    subtitle: "with gratitude",
    description: "Your presence is the best gift Nanang Ising could ask for.",
    paragraphs: [
      "Having you with us on this 100th birthday is already a precious blessing. Your love, prayers, and presence mean the most.",
      "For those who wish to express their love or share their stories with Nanang, you may do so with a simple message as you give your treasures to our beloved Nanang Ising.",
    ],
    // Suggested gifts list shown under the letter ("" title / empty list hides it)
    prioritiesTitle: "We can prioritize",
    priorities: [
      "Ensure Milk in vanilla flavor",
      "Caress basic adult tape diaper (Large)",
      "Monetary fund for Nanang Ising’s medication and necessities",
    ] as string[],
    thankYou: "", // "" hides the line
    signOff: "With a grateful heart,",
    signature: "The Family", // "" falls back to the celebrant's nickname
    // Colors — any CSS color or a palette token from app/globals.css (e.g. "var(--color-motif-accent)")
    colors: {
      title: "var(--color-motif-deep)",                                       // account names / numbers: wine
      script: "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))", // drop cap, signature: gold
      eyebrow: "color-mix(in srgb, var(--color-welcome-gold) 78%, var(--color-motif-deep))", // small caps labels, heart
      body: "color-mix(in srgb, var(--color-welcome-text) 85%, var(--color-motif-deep))",  // paragraphs: warm ink
      soft: "color-mix(in srgb, var(--color-motif-deep) 70%, transparent)",   // "With love," and secondary text
      card: "var(--color-motif-soft)",                                        // letter card (top)
      cardEdge: "var(--color-motif-cream)",                                   // letter card (bottom of the paper gradient)
      accountCard: "color-mix(in srgb, var(--color-motif-blush) 22%, var(--color-motif-soft))", // e-gift account cards
      button: "var(--color-motif-accent)",                                    // tab shadow tint (seal + selected tab use a crimson → wine gradient)
      line: "color-mix(in srgb, var(--color-welcome-gold) 45%, transparent)", // card edge + seal ring
      glow: "color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)", // tab track / letter badge
      background: "transparent",                                              // section has no background
    },
    // E-gift accounts — optional, as many as you like.
    //   showAccounts: false hides the whole block
    //   show:  false hides one account
    //   qr:    "/QR/BPI.png" to show a QR image, or "" when you have no QR
    showAccounts: true,
    accountsTitle: "For e-gifts",
    accounts: [
      { show: false, label: "BDO", accountName: "", accountNumber: "", qr: "" },
      { show: false, label: "GCash", accountName: "", accountNumber: "", qr: "" },
    ] as { show: boolean; label: string; accountName: string; accountNumber: string; qr: string }[],
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
  },
  // Table finder page (/table — components/table-finder.tsx)
  tableFinder: {
    decos: { ...CORNER_DECOS },
    // "Find Your Table" QR card on the dashboard (components/table-finder-qr-card.tsx)
    // {celebrant} → nickname. "" hides a line or image.
    qrCard: {
      coupleNameImage: BRAND.nameImage, // name lettering; "" shows the name as text
      coupleImage: "", // illustration beside the text
      eyebrow: "The 100th birthday of",
      title: "Find Your Table",
      script: "please be seated",
      description:
        "Place this code at the entrance. Guests scan it, search their name, and go straight to their table.",
      scanLabel: "Scan to find your table",
      buttonText: "Download QR",
      downloadNote: "Saves a print-ready PNG for signs and table cards.",
      previewText: "Preview seating page",
    },
  },
  // Entourage proposal pages (components/proposal-page.tsx)
  // Roles live in content/proposal-roles.ts (18 Roses, 18 Treasures, 18 Cheers, …).
  // Text placeholders: {name} = invitee, {role} = role title, {celebrant} = nickname.
  // Each invitation type has its own wording:
  //   party      → every debut role (18 Roses, Candles, Cheers, Treasure Gifts, Monetary Gifts)
  //   sponsor    → Principal Sponsors (only if you add sponsor roles)
  //   bearer     → kept from the template (unused)
  //   flowerGirl → kept from the template (unused)
  // A list ([...]) shows one paragraph per line; "" or [] hides that part.
  proposal: {
    decos: { ...CORNER_DECOS },
    coupleNameImage: BRAND.nameImage, // name lettering at the top of the card; "" shows the name as text
    coupleImage: "", // illustration above the question
    ornament: DECOR.headerOrnament, // small sprig at the top of the card; "" to hide
    // Eucalyptus sprigs on either side of the couple name; "" to hide one
    nameDecos: { left: DECOR.sideLeft, right: DECOR.sideRight },
    showDate: true, // big date under the couple name (Month / Day / Day-number / Time / Year)
    // Use "Maid of Honor" for unmarried, "Matron of Honor" for married
    honorAttendant: "Matron of Honor" as "Matron of Honor" | "Maid of Honor",
    roles: proposalRoleDefinitions,
    roleIdAliases: proposalRoleIdAliases,
    // Shared labels used on every invitation
    labels: {
      // Two lines above the picture ("" hides one)
      topEyebrow: "A Personal Invitation",
      topLine: "From my heart to yours",
      headerEyebrow: "A Special Place", // small gold line above the heading
      headerScript: "at Nanang Ising's 100th Birthday", // big heading under the image
      saveTheDate: "Save the Date",
      roleOffered: "Role offered",
      preparedFor: "Prepared for",
      askQuestion: "Will you be", // + role title, e.g. "Will you be one of my 18 Roses?"
      registeredName: "Registered name",
      returnButton: "Return to the Invitation",
      saving: "Saving...",
      sending: "Sending...",
      sendButton: "Send Response",
      goBack: "Go Back",
      saveError: "We couldn't save your response. Please try again.",
      // Shown when the invite link has no name and the guest says yes
      nameForm: {
        title: "You Said Yes",
        script: "we're so happy",
        subheader: "One quick detail",
        body: "I couldn't be happier to have you by my side! Please confirm the name you'd like on the invitation and guest lists.",
        label: "Your Preferred Name",
        placeholder: "e.g. Aunt Maria Clara / Mr. James Bond",
        required: "Please type your preferred name so we can add it to our invitation.",
        submit: "Submit Response",
        cancel: "Cancel",
      },
    },
    copy: {
      party: {
        greeting: "Dear",
        intro: [],
        body: [
          "Your presence would make this milestone even more meaningful. I would be honored to have you by my side as a symbol of love, friendship, and the beautiful memories we share.",
        ],
        askLead: "",
        askNote: "",
        yesButton: "Yes, I'd Love To!",
        noButton: "No, With Love & Warm Wishes",
        signOff: "With love,", // followed by the celebrant's name
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "I couldn't be happier",
          roleLine: "As {role}",
          body: [
            "Thank you for saying yes! We can't wait to celebrate, laugh, and make memories with you on Nanang Ising's 100th birthday. Having you be part of the program will make the day even more special.",
          ],
          signOff: "With love,",
        },
        no: {
          title: "Thank You",
          script: "for responding",
          subheader: "I completely understand",
          body: [
            "Thank you for taking the time to consider it. There are absolutely no hard feelings — I'm grateful to have you in my life, and I hope to celebrate with you in any way you can.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Your message has reached me",
          body: [
            "Your love and warmest wishes mean the world to me. Thank you!",
          ],
          signOff: "With love,",
        },
      },
      sponsor: {
        greeting: "Dear",
        intro: [
          "We have some wonderful news that we would love to share with you.",
          "I am turning one hundred — a century of blessings I would love to celebrate with you.",
        ],
        body: [
          "This is not a general invitation. This is a personal ask, especially meant for you.",
          "As we prepare for our wedding, we find ourselves thinking about the people we would be grateful to have by our side on one of the most meaningful days of our lives.",
          "For us, having a {role} is more than simply being part of the wedding ceremony. It means having someone we respect, someone whose experiences we can learn from, and someone whose wisdom and blessings we would be grateful to have as we build our life together.",
        ],
        askLead: "With great respect and sincerity, we would like to ask you a very special question:",
        askNote: "Having you share this moment with us would truly make our wedding more meaningful.",
        yesButton: "Yes, I'd Be Honored 🤍",
        noButton: "No, With Love & Warm Wishes",
        signOff: "With love and respect,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "Thank you for saying yes!",
          roleLine: "Our {role}",
          body: [
            "We are truly happy and honored to have you accept this special role in our wedding. Your support means a lot to us, and we look forward to celebrating this beautiful day with you and creating a memory we can cherish for years to come. Thank you for being part of this special moment.",
          ],
          signOff: "With love and heartfelt gratitude,",
        },
        no: {
          title: "Thank You",
          script: "for responding",
          subheader: "We completely understand and respect your decision",
          body: [
            "Thank you for taking the time to read our letter and consider our request. We sincerely appreciate your kindness and the thought you have given to our invitation. There are no hard feelings at all. We are simply grateful to have shared this moment with you and to have you celebrate our happiness in your own way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Your message has reached us",
          body: [
            "We are simply grateful to have shared this moment with you. Your love and warmest wishes mean the world to us.",
          ],
          signOff: "With love,",
        },
      },
      bearer: {
        greeting: "Hi",
        intro: [
          "We have a very special day coming up, and we would love for you to be part of it! 🤍",
          "{celebrant} is turning one hundred!",
        ],
        body: [
          "Our wedding day is a very important moment for us, and we would love to have you take part in making it even more special.",
        ],
        askLead: "So we have a very important question for you:",
        askNote: "We would be so happy to have you walk down the aisle and carry this special part of our wedding ceremony.",
        yesButton: "Yes, I'd Love To! 🤍",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We are so excited to have you on our team!",
          roleLine: "Our {role}",
          body: [
            "We are so excited to have you as our {role}! We can't wait to see you walk down the aisle and be part of our special day. Your little role will be a very special part of our wedding, and we hope you have lots of fun celebrating with us! See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "We completely understand 😊",
          body: [
            "Thank you for considering being our {role}. We hope you know that you are special to us, and we'll be happy to have you celebrate our wedding with us in any way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Thank you for letting us know",
          body: ["We hope you know how special you are to us, and we look forward to celebrating with you."],
          signOff: "With lots of love,",
        },
      },
      flowerGirl: {
        greeting: "Hi",
        intro: [
          "We have a very special day coming up, and we would love for you to be part of it! 🤍",
          "{celebrant} is turning one hundred!",
        ],
        body: [
          "Our wedding day wouldn't be complete without some extra sweetness, smiles, and a little bit of magic.",
        ],
        askLead: "And we have a very special role we would love for you to have.",
        askNote: "We would love to have you walk down the aisle and help make our wedding day even more beautiful and memorable.",
        yesButton: "Yes, I'd Love To! 🌸",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We are so happy to have you as our Flower Girl!",
          roleLine: "Our {role}",
          body: [
            "We can't wait to see you walk down the aisle and be part of our special day. We hope you have lots of fun, smile big, and enjoy every moment! We can't wait to see you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "We completely understand 😊",
          body: [
            "Thank you for taking the time to consider being our Flower Girl. Whether you're able to be part of our wedding or not, we hope you know how special you are to us. We'll still be very happy to celebrate our special day with you!",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Thank you for letting us know",
          body: ["We hope you know how special you are to us, and we look forward to celebrating with you."],
          signOff: "With lots of love,",
        },
      },
    },
  },
  details: {
    rsvp: { ...RSVP },
  },
  contact: {
    bridePhone: "to be announced",
    groomPhone: "to be announced",
    email: "to be announced",
  },
  giftRegistry: {
    // QR_1:{
    // id: "BPI",
    // src: "/QR/BPI.png",
    // label: "BPI",
    // accountNumber: "KAMS : ***********569",
    // },
    // QR_2:{
    // id: "MariBank",
    // src: "/QR/MariBank.png",
    // label: "MariBank",
    // accountNumber: "****7672",
    // }
    // ,
    // QR_3:{
    // id: "Gcash",
    // src: "/QR/pleaseProvideQR.png",
    // label: "Gcash",
    // accountNumber: "to be announced",
    // }
  },
  // Built from QUICK SETUP — edit the values at the top of the file
  // The program ("ceremony") and the end of the night ("reception") at the one venue —
  // names kept from the template so every section keeps working.
  ceremony: {
    location: CEREMONY_VENUE.name,
    venue: CEREMONY_VENUE.address,
    map: CEREMONY_VENUE.map,
    date: EVENT_DATE,
    day: EVENT_DAY,
    time: TIMES.program,
    entourageTime: TIMES.guestArrival,
    guestsTime: TIMES.guestArrival,
    image: CEREMONY_VENUE.photos,
  },
  reception: {
    location: RECEPTION_VENUE.name,
    venue: RECEPTION_VENUE.address,
    map: RECEPTION_VENUE.map,
    date: EVENT_DATE,
    day: EVENT_DAY,
    time: TIMES.end,
    image: RECEPTION_VENUE.photos,
  },
  // Legacy blocks (not shown on the main page) — kept so older components compile.
  dressCode: {
    theme: EVENT.theme,
    sponsors: {
      title: "Family",
      ninang: { label: "Ladies", description: "Formal gown in black, silver, or deep red.", image: "", palette: ["#111013", "#C0C0C6", "#7A0F1A"] },
      ninong: { label: "Gentlemen", description: "Black suit or barong with black slacks.", image: "", palette: ["#111013", "#3A3A40"] },
    },
    entourage: {
      title: "Entourage",
      bridesmaid: { label: "Ladies", description: "Formal dress in silver or black.", image: "", palette: ["#C0C0C6", "#111013"] },
      groomsmen: { label: "Gentlemen", description: "Black suit with a red rose boutonniere.", image: "", palette: ["#111013", "#7A0F1A"] },
    },
    guests: {
      title: "Guests",
      label: "Guests",
      description: "Your best look — formal, semi-formal, or smart casual; any color except red.",
      image: "",
      palette: ["#C0C0C6", "#8E8E96", "#3A3A40", "#111013"],
    },
    paletteNote: `Motif: ${EVENT.motif}.`,
    closing: "Thank you for celebrating one hundred years with us. We can't wait to see you!",
    note: "Kindly come in your Best Sunday Outfit.",
  },
  narratives: {
    ourStory: "",
    groom: "",
    bride: "",
  },
  colors: {
    primary: "#8E6483",
    secondary: "#E8BD70",
  },
  // Theme song (components/sections/wedding-playlist.tsx). {celebrant} → nickname.
  playlist: {
    eyebrow: "Now Playing",
    title: "The Sound of the Day",
    script: "a century, in a song",
    subtitle: "Every celebration has a soundtrack — this is the one that sets the mood for ours.",
    // Shown on the player card: small label (artist), big title (song), then the note
    cardEyebrow: `Theme song · ${EVENT.themeSong.artist}`,
    playlistName: EVENT.themeSong.title,
    cardNote:
      "A song to remember a hundred beautiful years. Press play and celebrate with us.",
    buttonText: "Listen on Spotify",
    // Leave any path "" to hide that decoration
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    // ⚠ check — Spotify link for "Goth" by Sidewalks and Skeletons (track, playlist or album links all work)
    embedUrl: "https://open.spotify.com/embed/playlist/5ldLOPvvELpnXTmLCHqxrQ?utm_source=generator&si=983c7443ca9c441f",
    spotifyUrl: "https://open.spotify.com/playlist/5ldLOPvvELpnXTmLCHqxrQ",
  },
  // Closing "See you there!" section (components/sections/see-you-there.tsx).
  //   photos mode (loadingScreen.display "photos") → full-screen celebrant photo
  //   plain mode  (loadingScreen.display "plain")  → ornamental card, no photo
  // {celebrant} → nickname.
  seeYouThere: {
    titleLine1: "See you",
    titleLine2: "there!",
    // Photos mode — full-screen background that slowly crossfades between the photos.
    // Phones (portrait) use "mobile", tablets / desktops (landscape) use "desktop".
    photos: {
      mobile: [
        "/mobile-background/debut (86).webp",
        "/mobile-background/debut (24).webp",
        "/mobile-background/debut (2).webp",
      ],
      // Same portraits on wide screens (cropped to fill, framed on her face)
      desktop: [
        "/mobile-background/debut (86).webp",
        "/mobile-background/debut (24).webp",
        "/mobile-background/debut (2).webp",
      ],
    },
    photoAlt: "{celebrant}",
    // Plain mode
    plain: {
      eyebrow: "Until November 21",
      script: "with love, the family of {celebrant}",
      message: "We can't wait to celebrate Nanang Ising's 100th birthday with you.",
      decos: { ...CORNER_DECOS, footerVine: DECOR.footerVine },
    },
  },
  // Footer (components/sections/footer.tsx).
  // {celebrant} → nickname, {year} → current year. Date comes from ceremony, deadline from details.rsvp.
  footer: {
    showMonogram: true, // celebrant.monogram, tinted to the motif
    // Small line under the name, e.g. "turns eighteen" ("" to hide)
    nameLine: `turns ${CELEBRANT.ageWords.toLowerCase()}`,
    dateLabel: "Celebration Date",
    // Program & end of night at a glance (times and places come from ceremony / reception)
    summary: {
      show: true,
      ceremonyLabel: "Program",
      receptionLabel: "Until",
    },
    noteTitle: "A Note From the Family",
    // Typed out one after another
    quotes: [
      "Gray hair is a crown of splendor; it is attained in the way of righteousness. – Proverbs 16:31",
      "Welcome to Nanang Ising's 100th birthday website! A century of love, faith, and family — and we're so grateful to share this day with you.",
      "Thank you for your love, prayers, and support. Come in your Best Sunday Outfit — see you on November 21!",
    ],
    rsvp: {
      show: true,
      title: "RSVP Deadline",
      label: "Please respond by",
      note: "Please confirm your attendance by this date.",
      button: "Tap here to respond",
      href: "#guest-list",
    },
    // Social links — replace each href with your own profile link.
    //   show: false hides one; platforms: facebook | instagram | tiktok | youtube | twitter | threads | messenger | email
    //   email: use "mailto:you@example.com"; messenger: use "https://m.me/yourpage"
    followTitle: "Follow Along",
    followNote: "Share your photos and tag us — we'd love to see the celebration through your eyes.",
    socials: [
      { show: true, platform: "facebook", href: "https://www.facebook.com" },
      { show: true, platform: "instagram", href: "https://www.instagram.com/" },
      { show: true, platform: "tiktok", href: "https://www.tiktok.com/" },
      { show: true, platform: "youtube", href: "https://www.youtube.com" },
      { show: true, platform: "twitter", href: "https://x.com/" },
      { show: false, platform: "threads", href: "https://www.threads.net/" },
      { show: false, platform: "messenger", href: "https://m.me/" },
      { show: false, platform: "email", href: "mailto:" },
    ] as {
      show: boolean
      platform: "facebook" | "instagram" | "tiktok" | "youtube" | "twitter" | "threads" | "messenger" | "email"
      href: string
    }[],
    quickLinksTitle: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "Event Details", href: "#details" },
      { label: "Gallery", href: "#gallery" },
      { label: "RSVP", href: "#guest-list" },
      { label: "Program", href: "#wedding-timeline" },
      { label: "Messages", href: "#messages" },
      { label: "FAQ", href: "#faq" },
    ],
    copyright: "© {year} {celebrant}'s 100th Birthday — crafted with love, prayers, and gratitude.",
    tagline: "This celebration site was made to share the joy of one hundred years with you.",
    // Hashtag chips under the date in the footer header ([] hides them)
    hashtags: HASHTAGS,
    credit: {
      show: true,
      developedBy: "Developed by",
      developerName: "Lance Valle",
      developerUrl: "https://lance28-beep.github.io/portfolio-website/",
      promoText: "Visit and follow us:",
      promoName: "Debut Digital Invites",
      promoUrl: "https://www.facebook.com/debutinvitation/",
    },
  },
  // Snap & Share (components/sections/snap-share.tsx). {celebrant} → nickname.
  snapShare: {
    // ⚠ check — Google Drive upload folder + its QR are still from the template
    googleDriveLink:
      "https://drive.google.com/drive/folders/1UnYn0ZkNX92Q4HNE48JErNNZOhBU2U3B?usp=sharing",
    albumQR: "/QR/AlbumQR.png",
    hashtag: HASHTAGS,
    instructions: "Please scan this QR code and upload the photos and videos you took during the celebration. We'd love to see the day through your eyes!",
    title: "Snap and Share",
    subtitle: "Share your memories",
    description:
      "Help capture the little moments of {celebrant}'s 100th birthday — every smile, hug, and candid laugh. Your photos and clips complete the story of the day.",
    // "Favorite Moments" photo card — always hidden when loadingScreen.display is "plain"
    moments: {
      show: true,
      title: "Favorite Moments",
      caption: "Share your snapshots to be featured in the keepsake gallery.",
      // 3 photos: two portrait photos on top (3:4 frames), one landscape photo below (16:9)
      images: ["/box/box (1).png", "/box/box (2).jpg", "/desktop-background/debut (4).webp"],
    },
    website: {
      show: true,
      title: "Share the Celebration Website",
      description:
        "Spread the word about {celebrant}'s celebration. Share this QR code so friends and family can find every detail.",
      downloadButton: "Download QR",
      note: "Scan with any camera app to open the full invitation and schedule.",
    },
    hashtags: {
      show: true,
      title: "Celebration Hashtags",
      copy: "Copy",
      copied: "Copied",
      copyAll: "Copy All",
      allCopied: "All Copied!",
    },
    social: {
      show: true,
      title: "Share on Social Media",
      description: "Help spread the word about {celebrant}'s 100th birthday across your favorite platforms.",
      // Remove any you don't want: "instagram" | "facebook" | "tiktok" | "twitter"
      platforms: ["instagram", "facebook", "tiktok", "twitter"] as ("instagram" | "facebook" | "tiktok" | "twitter")[],
      shareText: "Celebrate {celebrant}'s 100th birthday! Explore the details and share your special memories:",
    },
    // Shown only when googleDriveLink is set
    upload: {
      badge: "Upload Your Photos & Videos",
      scanNote: "Scan with your camera app",
      copyLink: "Copy Link",
      copied: "Copied!",
      downloadQr: "Download QR",
      uploadButton: "Upload Photos",
    },
    closing:
      "Thank you for helping make {celebrant}'s 100th birthday unforgettable. Your photos and messages become memories our family will treasure for a lifetime.",
    closingTag: "Thank you for sharing the joy",
  },
  // Accommodation (components/sections/accommodation.tsx — not on the main page)
  accommodation: {
    coordinator: {
      name: RSVP.coordinator,
      phone: RSVP.phone,
    },
    hotels: [] as { name: string; discount?: string; phone?: string; facebook?: string }[],
    carRentals: [] as { name: string; facebook?: string }[],
  },
}
