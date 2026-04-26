# DM Express — Trucking Company One-Pager

A production marketing site for a small Northern California trucking company.
One scrolling page, fast, accessible, mobile-tuned, with a working driver
application form that emails the owner directly.

**Stack:** React 18 · TypeScript · Vite 8 · Vitest 4 · plain CSS (no framework)

> This is a sanitized portfolio version of a real client project. Phone numbers,
> MC/DOT identifiers, email, and domain in this repo are placeholders. The
> actual business data was scrubbed before publishing.

---

## Why this project

A friend runs a small fleet out of Lincoln, CA — a handful of power units,
parking, repair, the usual. Hiring drivers was happening through word of mouth
and Facebook groups, and that wasn't scaling. He needed a site that:

1. Looks credible enough that an experienced CDL driver actually fills out the
   application.
2. Loads fast on a phone parked at a truck stop with one bar of LTE.
3. Costs him nothing to run beyond a domain.

That set the constraints: static, fast, mobile-correct, with a working form
and zero monthly bills.

---

## What's on the page

- **Hero** with a fleet image, ken-burns animation, and staggered copy reveal.
- **Service strip** — seven cards (driver hiring, owner-operator program,
  dedicated lanes, parking, repair, trailer rental, lease-to-own) overlapping
  the hero with a backdrop blur.
- **About / stats** with a four-tile panel.
- **Opportunities** — separate Driver and Owner Operator paths. Tapping either
  jumps to the application form and pre-selects the right mode.
- **Brokers** section.
- **Yard** section with imagery and bullets.
- **Application form** — segmented control for applicant type, file inputs for
  driver license front/back, mailto submission with a structured email body.
- **Light/dark theme toggle**, persisted to localStorage.
- Mobile menu with Escape-key and outside-click dismissal, skip-to-content
  link, focus-visible rings, reduced-motion support.

---

## Decisions worth explaining

### No backend

Three options for the form:

| Option | Cost | Trade-off |
|---|---|---|
| `mailto:` (chosen) | $0 | User's email client opens; no server-side validation |
| Resend / Formspree backend | ~$10–20/mo | Real submission flow, deliverability variance |
| Squarespace template | $20+/mo | Doesn't match the brand, generic |

For a one-owner shop where applications come in maybe five times a week, the
mailto trade was right. The form pre-formats the email body with structured
data so the owner gets a readable submission, and the file inputs surface the
selected file names so the applicant remembers to attach them manually before
hitting send.

If volume grows, swapping mailto for a Resend webhook is a 30-minute change.

### CSS variables, not Tailwind

For a single-page site Tailwind would have shipped 30 KB more without giving
me anything I couldn't get from `:root` custom properties and a
`[data-theme="light"]` attribute swap on `<html>`. The whole stylesheet is
22 KB.

### React for the form, not the page

Most of the page is declarative HTML. React earned its bytes in the form —
applicantType state driving the segmented control, file selection feedback,
the pre-fill from the opportunity cards. Rebuilding from scratch I'd still
pick React for the iteration speed, even though plain HTML + a sprinkle of JS
would also have shipped.

---

## Testing

The application-email helpers are the only logic complex enough to warrant
unit tests, but I wanted to actually exercise formal techniques rather than
just hit the happy path. The 29-test suite uses:

- **Equivalence Partitioning** — `getPayLine` is total over the two
  `applicantTypes`; `readApplicationFormFields` partitions FormData entries
  into string vs. non-string (file uploads).
- **Boundary Value Analysis** — `formatFileSize` at -1, NaN, ∞, 0, 1, 1023,
  1024, 1 MB - 1, 1 MB, 1 MB + 1, 5.5 MB. This caught a real bug where
  `1048575` returned `"1024 KB"` instead of `"1.0 MB"` because the rollover
  threshold was off by one.
- **Decision Table** — applicantType ↔ subject line ↔ pay line.
- **State Transition Testing** — `createMailtoHref` URL encoding for spaces,
  ampersands, slashes, empty fields, and the literal `@` in recipient
  addresses.

```bash
npm run test
```

All 29 pass.

---

## Performance

The first build was about 5.5 MB. I'd staged a `<picture>` element with WebP
and PNG fallbacks, but the JPGs were always being served — the PNGs (4.4 MB
combined) were dead weight. I deleted them, swapped to a plain `<img>` with
`fetchPriority="high"` on the hero, and the production output dropped to:

| Asset | Size | Gzipped |
|---|---|---|
| HTML | 3.5 KB | 1.2 KB |
| CSS | 22 KB | 5.2 KB |
| JS | 165 KB | 54 KB |
| Hero JPG | ~150 KB | — |

Total payload on first load is well under 500 KB.

---

## Accessibility

- Skip-to-content link.
- `focus-visible` rings on every interactive element (3 px outline, 65 %
  accent color).
- Stretched-link pattern on the opportunity cards — the whole card is a tap
  target, but only the inner `<a>` is in the tab order, so screen reader users
  don't get duplicate announcements.
- `prefers-reduced-motion` gate around every keyframe animation and reveal
  transition.
- Semantic landmarks (`<header>`, `<main>`, `<footer>`, sections with
  `aria-labelledby`).
- `aria-live` on the form status region.
- Color contrast verified in both light and dark themes.
- Native HTML5 form validation (`required`, `pattern`, `min`) for fields where
  the browser already does it well.

---

## The iPhone story

This was the most surprising afternoon of the project. The friend opened the
live site on his iPhone 15 Pro and sent me a screenshot. Three issues, none of
which showed up in any desktop browser or in Chrome DevTools' iOS simulator:

1. **Tapping any input zoomed the page in**, and Safari didn't always zoom
   back out. Cause: iOS Safari auto-zooms when an input's font-size is below
   16 px. Fix: `font-size: 16 px` on inputs / select / textarea, plus
   `-webkit-appearance: none` to clear iOS's native date-input styling.
2. **Autofilled fields turned bright yellow** — Safari's "I autofilled this
   for you" indicator looked broken on the dark theme. Fix: a `:-webkit-autofill`
   block setting `-webkit-box-shadow: 0 0 0 1000px var(--bg) inset` and
   `-webkit-text-fill-color: var(--text)`, with a 5000 s transition delay so
   Safari can't animate it back.
3. **Page was wider than the viewport**, requiring a pinch-out to read the
   edges. Defensive fix: `overflow-x: hidden` on `html` and `body`,
   `min-width: 0` on grid items so a long input value can't push the layout
   sideways.

The lesson I took: **simulator does not equal device.** Whenever a real user
will be on iOS, run an ngrok tunnel from the dev box and test on the actual
phone before shipping.

---

## What I'd do next

If this becomes a real product instead of a one-off:

- Replace mailto with a Resend transactional backend behind a tiny edge
  function. Keep the form action client-side; just POST the JSON and return.
- Add a flat-file CMS (likely TinaCMS or just a YAML config) so the owner can
  edit copy without touching code.
- Submit a sitemap to Google Search Console and add a `robots.txt`.
- Plug in Plausible analytics. Privacy-friendly, and the owner can finally see
  which sections actually convert applicants.
- Split the application into `/apply/driver` and `/apply/owner-operator`
  routes so the URL itself is shareable in driver Facebook groups.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run test         # vitest, 29 tests
npm run build        # production build to dist/
npm run preview      # serves the production build at :4173
```

Node 18 or newer.

---

## Project structure

```
src/
  App.tsx                     # the whole page
  siteContent.ts              # company info, nav, service cards, stats
  styles.css                  # CSS variables, layout, animations
  lib/
    applicationEmail.ts       # form -> structured email body
    applicationEmail.test.ts  # 29 tests, formal techniques
public/
  favicon.svg                 # custom three-bar mark
  assets/                     # hero + yard imagery
index.html                    # SEO meta, JSON-LD MovingCompany schema
vite.config.ts                # dev/preview hosts, ngrok allowlist
```

---

Built solo. Real client, real constraints, real iPhone bugs. If you want to
talk through any of the decisions above, my contact details are on my GitHub
profile.
