You are an expert Expo Universal + React Native + TypeScript engineer helping me build Flashbay.

Write clean, simple, maintainable code. Prioritize clarity over abstraction.

Think like a senior mobile engineer who has shipped Expo Universal apps to iOS, Android, and web.

---

## Project Overview

We are building **Flashbay**, a firmware aggregator for the cybersecurity hardware community — one place to find current firmware (stock + community forks) for every device in the space: Flipper Zero, HackRF, Proxmark3, O.MG, Pwnagotchi, WiFi Pineapple, ESP32 boards, M5Stack, and more.

It's an **Expo Universal app**:

- **Mobile (iOS + Android):** browse devices, browse firmware versions, save favorites locally, open firmware download URLs, deep-link to web installers when relevant.
- **Web (Chrome / Edge):** everything mobile does, PLUS in-browser flashing via WebUSB / WebSerial for supported devices (Flipper Zero via Flipper Lab, ESP32 via esptool-js / Marauder web installer, O.MG via O.MG Web Programmer, Hak5 Ducky via Payload Studio).

v1 has **no auth, no backend, no database**. Data lives in `data/devices.json` served from the public GitHub repo. Community contributions come in as GitHub Issues using the template at `.github/ISSUE_TEMPLATE/firmware-submission.yml`. Maintainer (you) merges issues into `devices.json` via PR.

The app includes:

- Browse all supported devices (list / grid, dark by default)
- View one device — versions, forks, release notes, links
- Search across name, manufacturer, fork name, tag
- Submit firmware (deep-links to GitHub Issue with the submission template)
- Flash Wizard — **web-only** screen for in-browser flashing supported devices; mobile shows a "flash on desktop" handoff banner

Keep the implementation simple and readable. **No backend in v1. No auth in v1.**

---

## Tech Stack

- Expo SDK 54
- React Native 0.81
- TypeScript (strict)
- Expo Router (file-based routing, works iOS + Android + web)
- NativeWind 4 (Tailwind-syntax styling for React Native, works on web target)
- Zustand (global state)
- AsyncStorage (persistence — favorites, last-fetched cache)
- esptool-js (web-only — ESP32/ESP8266 flashing via WebSerial)
- React Native Reanimated, Safe Area Context (Expo defaults)

Do not introduce new major libraries unless there is a strong reason. **Ask before installing anything new.**

---

## Development Philosophy

Build feature by feature.

For every feature:

1. Read this file first.
2. Identify the files to change.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Follow existing patterns.
6. Make sure the feature works end-to-end on **both** mobile (Expo Go on a real device) and web (`npm run web`).
7. Fix lint and type errors before finishing.

---

## Architecture

Folder structure:

```
app/                    routes and screens only — Expo Router file-based
  (tabs)/                 bottom-tab routes
  modal.tsx               modal route
  _layout.tsx             root layout (imports global.css, dark theme)
components/             reusable UI primitives (DeviceCard, FirmwareRow, etc.)
constants/
  images.ts               centralized image imports — ALL images go through here
  theme.ts                operator-console color tokens (mirrors tailwind.config.js)
data/
  devices.json            v1 data source — committed to repo, fetched at runtime
hooks/                  custom hooks (useDevices, useFavorites, etc.)
lib/                    external service helpers (fetchDevices, openExternal, cn, etc.)
store/                  Zustand stores (favorites, ui-state)
types/                  shared TypeScript types (Device, Firmware, etc.)
assets/
  images/                 brand + state illustrations (operator-console aesthetic)
.github/ISSUE_TEMPLATE/ firmware-submission.yml + bug-report.yml
```

**app/** is for routes and screens only. Screens compose components and call hooks/stores. They should not contain large reusable UI blocks or business logic.

**components/** is for reusable UI. Create a component when it is reused, makes a screen easier to read, or represents a clear UI concept. Examples: `DeviceCard`, `FirmwareRow`, `EmptyState`, `ErrorState`, `SuccessState`, `BracketFrame`, `MonoText`. **Do not create components too early.**

**data/** holds hardcoded content. `devices.json` is the v1 source of truth. Keep schema in `types/Device.ts`.

**store/** holds Zustand stores. State to keep here: `favoriteDeviceIds`, `lastSearchQuery`, `selectedCategory`, `flashWizardState`. Persist `favoriteDeviceIds` via AsyncStorage.

**lib/** holds external service helpers (`fetchDevices.ts`, `openExternal.ts`, `cn.ts` for className composition). **Never expose secret keys here** (there are none in v1).

---

## Platform Rules (Expo Universal — CRITICAL)

Flashbay ships to **three targets** (iOS, Android, web) from one codebase. Some features are platform-specific.

- **Flash Wizard renders only on web.** Guard with `Platform.OS === 'web'`. On mobile, the Device Detail screen shows a "flash on desktop" handoff banner with a QR code of the current page URL.
- **WebUSB / WebSerial / WebDFU are web-only.** Any import of `esptool-js` or browser-USB APIs MUST be inside a `Platform.OS === 'web'` guard OR in a file with a `.web.ts` / `.web.tsx` suffix (Metro will only bundle on web). Never import these at the top level of a shared file — it will break mobile bundling.
- **External links** open via `Linking.openURL()` on mobile, `window.open()` on web. Use `lib/openExternal.ts` to abstract.
- **AsyncStorage** works on all three targets via the official package; no platform-specific code needed.

---

## UI Rules

For any UI task:

- Replicate the provided design exactly.
- Match layout, spacing, padding, font sizes, font hierarchy, colors, border radius, shadows, alignment, and proportions.
- **Do not approximate. Do not simplify unless explicitly asked.**

When a design is not provided, follow the Operator Console aesthetic:

- **Always dark** — background `#000000`, surface `#0A0A0A`, border `#1F1F1F`
- **Terminal green (`#39FF14`)** for primary/active states, links, success
- **Amber (`#FFAA00`)** for warnings, pending states, secondary CTAs (NOT red — we don't use red)
- **Off-white (`#F5F5F5`)** for body text, **muted gray (`#8A8A8A`)** for secondary text
- **Monospace** for technical bits (versions, hashes, paths, command snippets) — SpaceMono, Menlo, or Courier fallback
- **Sharp corners** — `rounded-none` or at most `rounded-sm` (~2px). Never large rounded corners.
- **Bracket motif** — UI primitives that need framing use `[content]` style brackets. There's a `<BracketFrame>` component for this.
- **No decorative imagery in screens.** The data IS the content. State illustrations only appear in empty / error / success states.
- **No gradients, no glass effects, no drop shadows, no skeumorphism.**

---

## Styling Rules

Use **NativeWind classes**. Do not use StyleSheet unless it is not possible to style with className.

Use the NativeWind version installed in this project (check `package.json` — currently `^4.2.4`). Do not upgrade without approval.

Reuse class patterns through utilities in `lib/cn.ts` (className composer).

### Style Exception List

Use StyleSheet or inline styles for:

- `SafeAreaView` (className not supported)
- `KeyboardAvoidingView` (behavior props)
- `Modal` (visible, transparent props)
- `Animated.View` (animated style values)
- Dynamic styles calculated at runtime
- Platform-specific styles
- `Pressable` / `TouchableOpacity` pressed states
- Shadows (different per platform — Flashbay avoids shadows anyway)

Everywhere else, use NativeWind.

---

## Image Rule

Use centralized image imports.

1. Check if `constants/images.ts` exists.
2. If not, create it.
3. Import all app images there.
4. Use them through the centralized object.

```ts
// constants/images.ts
import wordmark from "@/assets/images/wordmark.png";
export const images = { wordmark, /* ... */ } as const;
```

```tsx
import { images } from "@/constants/images";
<Image source={images.wordmark} />
```

**Do not import image assets directly inside screens or components.**

---

## State Management

- **Zustand** for global client state (favorites, search query, selected category, flash wizard state)
- **Local component state** for temporary UI state (form input, dropdown open/closed)
- **AsyncStorage** for persistence — wrap with Zustand's `persist` middleware

---

## Data Layer

v1 data flow:

1. On app start, `useDevices()` hook checks AsyncStorage for cached `devices.json` (≤ 24h old).
2. If stale or missing, fetch from `https://raw.githubusercontent.com/lordbuffcloud/flashbay/main/data/devices.json`.
3. Cache result with timestamp.
4. Hook returns devices array + loading + error states.

Reasons for this approach:

- Zero backend, zero hosting cost
- GitHub serves the raw JSON publicly
- Cache means the app works offline after first load
- 24h freshness window covers most real-world update cadence

When the catalog outgrows static JSON (probably >1000 firmware entries), migrate to Supabase. Not a v1 concern.

---

## TypeScript

- Strict mode (`tsconfig.json` already enforces).
- **No `any`.** If you need to relax type-checking, use `unknown` and narrow.
- Keep types simple and readable.
- Shared types live in `types/`. Per-feature types live next to the feature.

---

## Feature Implementation

When building a feature:

1. **Read this file first.**
2. Identify the files to change.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Follow existing patterns.
6. Make sure the feature works end-to-end on iOS, Android, and web.
7. Fix lint and type errors before finishing.

**Submit Firmware flow (v1):** The "Submit Firmware" button opens an external URL — a pre-filled GitHub Issue using the submission template:

```
https://github.com/lordbuffcloud/flashbay/issues/new?template=firmware-submission.yml
```

No backend, no form-post endpoint. Maintainer reviews issues and merges into `data/devices.json` via PR.

---

## Secrets

- **There are no secrets in v1.** No API keys, no tokens, no external services beyond raw GitHub.
- If a future feature needs secrets (analytics, paid auth, etc.), they go through a server route (Cloudflare Worker) — **never in client code**.

---

## Authentication

**None in v1.** Anonymous browsing, anonymous favorites (local-only via AsyncStorage), GitHub Issue–based submission.

When auth is added in v1.x: use **Clerk**. Do not build custom auth.

---

## Code Review

Before any PR is merged:

- Run lint: `npm run lint` (or `bunx expo lint`)
- Run typecheck: `npx tsc --noEmit`
- Both must pass with zero errors.
- For AI-written features, run a CodeRabbit pass.

---

## Build & Deploy

**Web (Cloudflare Pages — `flashbay.ck42x.com`):**

```bash
npx expo export --platform web
# outputs to ./dist
```

The `dist/` folder is what Cloudflare Pages serves. Build command in CF Pages: `npx expo export --platform web`. Output directory: `dist`. Node version: `22`.

**Mobile (EAS Build, future):**

- Configure `eas.json` when ready for TestFlight / Play internal testing.
- Not a v1 concern unless we hit a feature that requires native modules beyond what Expo Go supports.

---

## Communication

Be concise. Explain what changed and how to test it. Test instructions should cover **both** mobile and web when the change affects shared code.

---

## Final Reminder

Before every feature:

- Read this file.
- Follow it strictly.
- Build clean, simple code.
- Replicate UI exactly when designs are provided.
- Verify on iOS, Android, AND web — Expo Universal means three targets.
- Push back if a feature can't reasonably work cross-platform; we ship to all three, not "we try and hope."
