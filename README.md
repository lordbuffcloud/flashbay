# Flashbay

> Firmware aggregator for the cybersecurity hardware community.
> One place to find current firmware (stock + community forks) for every device.

[![Data License](https://img.shields.io/badge/data-CC--BY--4.0-39FF14)](https://creativecommons.org/licenses/by/4.0/)
[![Code License](https://img.shields.io/badge/code-MIT-39FF14)]()
[![Status](https://img.shields.io/badge/status-v1.1--catalog-FFAA00)]()
[![Devices](https://img.shields.io/badge/devices-59-39FF14)]()

---

## What it is

A read-only catalog of firmware releases across the cybersec-hardware ecosystem — Flipper Zero (stock, RogueMaster, Unleashed, Xtreme), HackRF, Proxmark3, O.MG, Pwnagotchi, WiFi Pineapple, ESP32 (Marauder, Bruce), M5Stack, and more. Each entry links to the upstream release page. **We index. We do not host binaries.**

**Expo Universal app** — one codebase, three targets:

- **Mobile (iOS + Android)** — browse, save, deep-link to web installers
- **Web (`flashbay.ck42x.com`)** — same + in-browser flashing via WebUSB / WebSerial for supported devices

---

## Why

Firmware for cybersec hardware is scattered across dozens of GitHub repos, vendor sites, and community forks. Operators waste time hunting for "the current RogueMaster build" or "is this M5Stack Bruce release safe to flash." Flashbay aggregates the links and surfaces version status in one place.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54 + React Native 0.81 |
| Routing | Expo Router (file-based, universal) |
| Language | TypeScript (strict, no `any`) |
| Styling | NativeWind 4 (Tailwind syntax in RN; works on web) |
| State | Zustand + AsyncStorage |
| Web flashing | esptool-js (web-only, ESP32/ESP8266) |
| Hosting (web) | Cloudflare Pages at `flashbay.ck42x.com` |
| Data | `data/devices.json` in this repo, fetched at runtime |
| Submit flow | GitHub Issue template — no backend |

---

## Contributing firmware

The catalog is community-curated. Submit a firmware via:

[**Open a firmware-submission issue →**](https://github.com/lordbuffcloud/flashbay/issues/new?template=firmware-submission.yml)

Maintainer reviews and merges to `data/devices.json` via PR.

---

## Local development

```bash
git clone https://github.com/lordbuffcloud/flashbay.git
cd flashbay
npm install
npm run web      # web target — best for development, supports WebUSB flashing
npm run ios      # iOS simulator
npm run android  # Android emulator
```

Visit http://localhost:8081 for the web build.

---

## Project layout

```
app/                routes (Expo Router file-based)
components/         reusable UI (DeviceCard, FirmwareRow, BracketFrame, ...)
constants/          theme tokens + centralized image imports
data/devices.json   v1 data source
hooks/              custom hooks (useDevices, useFavorites, ...)
lib/                helpers (fetchDevices, openExternal, cn, ...)
store/              Zustand stores
types/              shared TypeScript types
assets/images/      brand + state illustrations
AGENTS.md           AI-coding-agent instructions — read before any feature
```

---

## License

- **Code:** MIT
- **Data (`devices.json`):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Firmware:** each entry links to upstream; respect upstream licenses

---

## Built with

[Practical Vibe Coding with AI](https://javascript-mastery.s3.us-east-1.amazonaws.com/resources/Practical-Vibe-Coding-With-AI.pdf) — JS Mastery's 7-lesson AI-coding workflow.
