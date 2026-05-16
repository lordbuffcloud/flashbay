# Flashbay — entry for ck42x.com/tools

Copy-paste artifact for adding Flashbay to your tools page. I don't have access to the ck42x.com repo, so three formats are provided — pick whichever matches your site's actual schema.

If the site uses a different schema, send me one existing tool entry verbatim and I'll regenerate this in that exact shape.

---

## Format A — Next.js / React component (most likely)

If `/tools` is rendered by a component that takes an array of tool objects:

```tsx
{
  name: "Flashbay",
  slug: "flashbay",
  tagline: "Firmware aggregator for the cybersec hardware community.",
  description:
    "One place to find current firmware (stock + community forks) for every device — Flipper Zero, HackRF, Proxmark3, O.MG, Pwnagotchi, WiFi Pineapple, ESP32 boards, M5Stack, Nyanbox, and more. Mobile and web (Expo Universal). Web supports in-browser flashing via WebUSB/WebSerial.",
  url: "https://flashbay.ck42x.com",
  repo: "https://github.com/lordbuffcloud/flashbay",
  category: "tools", // or whatever your category enum uses
  tags: ["firmware", "flashing", "expo", "react-native", "webusb", "open-source"],
  status: "v1-alpha",
  thumbnail: "/images/tools/flashbay.png", // see "Thumbnail" section below
  primaryAction: { label: "Launch", url: "https://flashbay.ck42x.com" },
  secondaryAction: { label: "GitHub", url: "https://github.com/lordbuffcloud/flashbay" },
  flashbayIntegration: true, // if you flag tools that include flashing
}
```

---

## Format B — JSON entry (if `/tools` reads `tools.json` or similar)

```json
{
  "name": "Flashbay",
  "slug": "flashbay",
  "tagline": "Firmware aggregator for the cybersec hardware community.",
  "description": "One place to find current firmware (stock + community forks) for every device — Flipper Zero, HackRF, Proxmark3, O.MG, Pwnagotchi, WiFi Pineapple, ESP32 boards, M5Stack, Nyanbox, and more. Mobile and web. Web supports in-browser flashing.",
  "url": "https://flashbay.ck42x.com",
  "repo": "https://github.com/lordbuffcloud/flashbay",
  "tags": ["firmware", "flashing", "open-source"],
  "status": "v1-alpha"
}
```

---

## Format C — Markdown card (if `/tools` is MDX or a static markdown collection)

```mdx
---
name: Flashbay
slug: flashbay
tagline: Firmware aggregator for the cybersec hardware community.
url: https://flashbay.ck42x.com
repo: https://github.com/lordbuffcloud/flashbay
tags: [firmware, flashing, expo, open-source]
status: v1-alpha
order: 1
---

# Flashbay

One place to find current firmware (stock + community forks) for every device in the cybersec hardware space — Flipper Zero (and RogueMaster / Unleashed / Xtreme forks), HackRF, Proxmark3, O.MG, Pwnagotchi, WiFi Pineapple, ESP32 boards, M5Stack Cardputer, Nyanbox + nyanBEE, and more.

**Expo Universal** — runs on iOS, Android, and the web.

On web, **flash directly from the browser** via WebUSB / WebSerial. On mobile, deep-link to your existing favorite flasher.

[Launch Flashbay →](https://flashbay.ck42x.com) · [GitHub →](https://github.com/lordbuffcloud/flashbay)
```

---

## Thumbnail

For any of the formats above, the thumbnail should be the Flashbay app icon. Two options:

1. **Use the app icon from the Flashbay repo:**
   - File: `assets/images/icon.png` in https://github.com/lordbuffcloud/flashbay
   - It's the rounded-square black-frame + terminal-green "F" glyph (1024×1024)
   - Direct raw URL: `https://raw.githubusercontent.com/lordbuffcloud/flashbay/main/assets/images/icon.png`

2. **Or use the wordmark (better for cards with a wider aspect ratio):**
   - File: `assets/images/wordmark.png`
   - 1536×1024, the FLASHBAY_ wordmark in terminal green on black
   - Direct: `https://raw.githubusercontent.com/lordbuffcloud/flashbay/main/assets/images/wordmark.png`

If your site's tool cards have a square thumbnail slot, use the app icon. If they have a wide hero, use the wordmark.

---

## One-liner that fits any format

If your existing tool entries use a single-sentence description and that's it, use this:

> **Flashbay** — firmware aggregator for cybersec hardware. Browse, save, flash from the browser. [flashbay.ck42x.com](https://flashbay.ck42x.com)

---

## What I still need from you to do this directly

If you want me to actually drop this into the ck42x.com codebase (rather than you copy-pasting from this file):

1. The repo URL for ck42x.com (probably `lordbuffcloud/ck42x` or similar — I don't know)
2. One existing tool entry from the current `/tools` page so I can match the exact schema
3. Confirmation that I should push directly to that repo's main (or open a PR)

Reply with `ck42x repo: <url>` and I'll handle it next turn.
