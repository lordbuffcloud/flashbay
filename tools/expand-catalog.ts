#!/usr/bin/env bun
/**
 * One-shot catalog expansion: bump Bruce to 1.15, refresh key forks, append new devices.
 * Run: bun run tools/expand-catalog.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Device, DevicesCatalog, Firmware } from "../types/Device";

const TODAY = new Date().toISOString().slice(0, 10);
const BRUCE_URL = "https://github.com/BruceDevices/firmware/releases/tag/1.15";
const BRUCE_FLASH = "https://bruce.computer/flasher";

function bruce(notes: string): Firmware {
  return {
    fork: "community",
    name: "Bruce",
    version: "1.15",
    release_date: "2026-05-25",
    url: BRUCE_URL,
    notes,
    flashable_in_browser: true,
    flash_url: BRUCE_FLASH,
    release_tracking: "tagged_releases",
    last_verified_at: TODAY,
    confidence: "HIGH",
  };
}

function nemo(notes: string): Firmware {
  return {
    fork: "community",
    name: "Nemo",
    version: "v3.2.1",
    release_date: "2026-01-27",
    url: "https://github.com/n0xa/m5stick-nemo/releases/tag/v3.2.1",
    notes,
    flashable_in_browser: false,
    release_tracking: "tagged_releases",
    last_verified_at: TODAY,
    confidence: "HIGH",
  };
}

function marauder(notes: string): Firmware {
  return {
    fork: "stock",
    name: "ESP32 Marauder",
    version: "v1.12.1",
    release_date: "2026-05-05",
    url: "https://github.com/justcallmekoko/ESP32Marauder/releases/tag/v1.12.1",
    notes,
    flashable_in_browser: true,
    flash_url: "https://fzeeflasher.github.io/",
    release_tracking: "tagged_releases",
    last_verified_at: TODAY,
    confidence: "HIGH",
  };
}

const NEW_DEVICES: Device[] = [
  {
    id: "lilygo-t-dongle-s3",
    name: "LilyGo T-Dongle S3",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "usb-dongle", "hid", "badusb", "wifi", "ble", "st7735", "covert"],
    description:
      "USB-stick ESP32-S3 with 0.96\" ST7735 display, TF slot, and hidden microSD in the USB-A shell. Primary platform for USB Army Knife and popular Marauder target.",
    url: "https://www.lilygo.cc/products/t-dongle-s3",
    firmware: [
      {
        fork: "community",
        name: "USB Army Knife",
        version: "main-branch",
        release_date: "2026-05-27",
        url: "https://github.com/i-am-shodan/USBArmyKnife",
        notes:
          "HID + mass storage + WiFi/BLE attack surface with web UI. Builds from GitHub Actions (no tagged releases). Flash via ESP Web Tools or project docs; hold BOOT (G0) for download mode.",
        flashable_in_browser: false,
        release_tracking: "main_branch_only",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
      marauder(
        "Marauder port for T-Dongle S3 — select board in FZEE Flasher or ESP32 Marauder web updater.",
      ),
    ],
  },
  {
    id: "m5stack-cardputer-adv",
    name: "M5Stack Cardputer ADV",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32-s3", "keyboard", "mic", "ir", "gps", "cc1101-cap"],
    description:
      "Advanced Cardputer with improved keyboard, microphone, and expansion caps (GPS, CC1101 Sub-GHz). Same Bruce/Nemo ecosystem as the original Cardputer.",
    url: "https://shop.m5stack.com/products/m5stack-cardputer-adv-esp32-s3",
    firmware: [
      bruce("Full Bruce feature set on Cardputer ADV — CC1101 cap, PN532, BadUSB, WiFi/BLE offensive tools."),
      nemo("Nemo targets Cardputer ADV alongside StickCPlus2 and original Cardputer."),
    ],
  },
  {
    id: "m5stack-cardputer-zero",
    name: "M5Stack Cardputer Zero",
    manufacturer: "M5Stack",
    category: "multi-tool",
    tags: ["linux", "rpi-cm0", "keyboard", "coming-soon", "wifi", "ble", "ethernet"],
    description:
      "Pocket Linux handheld (Raspberry Pi CM0) with 46-key keyboard and 1.9\" display — not ESP32. Community firmware via M5 on-device store expected post-Kickstarter (May 2026).",
    url: "https://shop.m5stack.com/pages/m5-cardputerzero",
    firmware: [
      {
        fork: "stock",
        name: "M5 official (preorder)",
        version: "kickstarter-2026",
        release_date: "2026-05-26",
        url: "https://shop.m5stack.com/pages/m5-cardputerzero",
        notes:
          "Hardware launching on Kickstarter May 2026. Firmware distribution model TBD — likely M5 app store + SD images, not WebUSB ESP flashing. Re-verify when units ship.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "LOW",
      },
    ],
  },
  {
    id: "lilygo-t-deck",
    name: "LilyGo T-Deck",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "keyboard", "trackball", "lora", "meshtastic", "badusb"],
    description:
      "ESP32-S3 QWERTY handheld with trackball. Bruce for BadUSB/CC1101; Meshtastic is the other major firmware line for this hardware.",
    url: "https://lilygo.cc/products/t-deck",
    firmware: [
      bruce("Bruce on T-Deck / T-Deck Pro — BadUSB and CC1101; no NRF24 on Deck form factor."),
      {
        fork: "community",
        name: "Meshtastic",
        version: "check-releases",
        release_date: "2026-05-27",
        url: "https://github.com/meshtastic/firmware/releases/latest",
        notes: "Primary firmware for many T-Deck owners — LoRa mesh, not offensive WiFi. Flash via Meshtastic web flasher or device OTA.",
        flashable_in_browser: true,
        flash_url: "https://flasher.meshtastic.org/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "lilygo-t-display-s3",
    name: "LilyGo T-Display-S3",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "touchscreen", "170x320", "badusb", "wifi"],
    description: "Compact ESP32-S3 board with 1.9\" ST7789 display. Bruce target; common Marauder/CYD-adjacent budget board.",
    url: "https://lilygo.cc/products/t-display-s3",
    firmware: [bruce("Bruce T-Display-S3 — WiFi/BLE/CC1101 shield support; touchscreen pin conflicts documented upstream.")],
  },
  {
    id: "lilygo-t-embed",
    name: "LilyGo T-Embed",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "rotary-encoder", "tft", "speaker"],
    description: "T-Embed without integrated CC1101 — predecessor to T-Embed CC1101. Bruce-supported with full UI stack.",
    url: "https://lilygo.cc/products/t-embed",
    firmware: [bruce("Bruce on original T-Embed — add CC1101/NRF shields per Bruce wiring docs.")],
  },
  {
    id: "lilygo-t-watch-s3",
    name: "LilyGo T-Watch S3",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "wearable", "badusb", "touch"],
    description: "Watch-form ESP32-S3. Bruce supports BadUSB; limited RF compared to T-Embed/Cardputer.",
    url: "https://lilygo.cc/products/t-watch-s3",
    firmware: [bruce("Bruce T-Watch S3 — primarily BadUSB + WiFi tooling in wearable form factor.")],
  },
  {
    id: "lilygo-t-lora-pager",
    name: "LilyGo T-LoRa Pager",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "lora", "pager", "meshtastic", "badusb"],
    description: "Pager-style ESP32-S3 with LoRa. Meshtastic-first hardware; Bruce adds BadUSB path.",
    url: "https://lilygo.cc/products/t-lora-pager",
    firmware: [
      bruce("Bruce BadUSB + WiFi on T-LoRa Pager."),
      {
        fork: "community",
        name: "Meshtastic",
        version: "check-releases",
        release_date: "2026-05-27",
        url: "https://github.com/meshtastic/firmware/releases/latest",
        notes: "Stock use case for this device — LoRa mesh pager firmware.",
        flashable_in_browser: true,
        flash_url: "https://flasher.meshtastic.org/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "m5stickc-plus",
    name: "M5StickC PLUS",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32-pico", "wearable", "compact", "ir"],
    description: "Older compact M5 stick (ESP32-PICO). Bruce LITE builds available; superseded by PLUS2 but still common.",
    url: "https://shop.m5stack.com/products/m5stickc-plus-esp32-pico-mini-iot-developer-kit",
    firmware: [
      bruce("Bruce supports M5StickC PLUS with LITE_VERSION constraints — check Bruce board matrix."),
      nemo("Nemo lists StickCPlus as supported platform."),
    ],
  },
  {
    id: "m5stack-core2",
    name: "M5Stack Core2",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32", "touchscreen", "speaker", "vibration"],
    description: "ESP32 touchscreen IoT core. Bruce community target for WiFi/BLE/RF when paired with radio modules.",
    url: "https://shop.m5stack.com/products/m5stack-core2-esp32-iot-development-kit-v1-1",
    firmware: [bruce("Bruce on M5Core2 — tone speaker, no RGB; add CC1101/NRF via Grove/shields.")],
  },
  {
    id: "m5stack-cores3",
    name: "M5Stack CoreS3",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32-s3", "touchscreen", "camera"],
    description: "ESP32-S3 flagship M5 core with capacitive touch and camera module support.",
    url: "https://shop.m5stack.com/products/m5stack-cores3-esp32s3-lotdevelopment-kit",
    firmware: [bruce("Bruce on CoreS3/SE — ESP32-S3 performance; no microphone path on Bruce matrix.")],
  },
  {
    id: "chameleon-ultra",
    name: "Chameleon Ultra",
    manufacturer: "Proxgrind / RRG ecosystem",
    category: "rfid-nfc",
    tags: ["nfc", "rfid", "hf", "lf", "emulation", "offline"],
    description:
      "Standalone NFC/RFID research and emulation tool. Flash via CLI or MTools BLE; DFU packages on GitHub releases.",
    url: "https://github.com/RfidResearchGroup/ChameleonUltra",
    firmware: [
      {
        fork: "stock",
        name: "Chameleon Ultra FW",
        version: "v2.1.0",
        release_date: "2024-09-02",
        url: "https://github.com/RfidResearchGroup/ChameleonUltra/releases/tag/v2.1.0",
        notes: "Official Ultra firmware v2.1.0 — Ultralight emulation, hardnested, HIDProx LF, CLI rework. Flash via chameleon CLI or MTools.",
        flashable_in_browser: false,
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "chameleon-lite",
    name: "Chameleon Lite",
    manufacturer: "Proxgrind / RRG ecosystem",
    category: "rfid-nfc",
    tags: ["nfc", "hf", "emulation", "compact"],
    description: "Compact NFC emulation device in the Chameleon family. Same RRG tooling chain as Ultra.",
    url: "https://github.com/RfidResearchGroup/ChameleonLite",
    firmware: [
      {
        fork: "stock",
        name: "Chameleon Lite FW",
        version: "check-releases",
        release_date: "2026-05-27",
        url: "https://github.com/RfidResearchGroup/ChameleonLite/releases/latest",
        notes: "Flash via chameleon CLI. Use /releases/latest for current DFU — verify version before flashing.",
        flashable_in_browser: false,
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "MED",
      },
    ],
  },
  {
    id: "esp8266-deauther",
    name: "ESP8266 Deauther",
    manufacturer: "Spacehuhn / community boards",
    category: "wifi",
    tags: ["esp8266", "deauth", "wifi", "oled", "dstike"],
    description:
      "Classic ESP8266 WiFi deauther boards (DSTIKE Deauther, NodeMCU + OLED, etc.). Original Spacehuhn firmware ecosystem.",
    url: "https://github.com/SpacehuhnTech/esp8266_deauther",
    firmware: [
      {
        fork: "stock",
        name: "esp8266_deauther",
        version: "2.6.1",
        release_date: "2021-08-07",
        url: "https://github.com/SpacehuhnTech/esp8266_deauther/releases/tag/2.6.1",
        notes: "Stable 2.6.1 — project maintenance slowed but still the reference deauther FW. Flash via esptool or deauther web installer builds.",
        flashable_in_browser: true,
        flash_url: "https://deauther.com/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "flipper-wifi-devboard",
    name: "Flipper WiFi Dev Board",
    manufacturer: "Flipper Devices",
    category: "flipper-accessory",
    tags: ["esp32-s3", "flipper", "wifi", "marauder", "gpio"],
    description:
      "ESP32-S3 companion for Flipper Zero — runs ESP32 Marauder when flashed standalone via USB, or pairs with Flipper apps when docked.",
    url: "https://shop.flipperzero.one/products/wifi-devboard",
    firmware: [
      marauder("Primary community use — Marauder on WiFi Devboard via FZEE or Marauder flasher."),
      {
        fork: "stock",
        name: "Flipper stock (companion mode)",
        version: "via-ofw",
        release_date: "2026-05-27",
        url: "https://github.com/flipperdevices/flipperzero-firmware",
        notes: "When used as Flipper GPIO accessory, update Flipper OFW — no separate ESP flash needed for companion apps.",
        flashable_in_browser: true,
        flash_url: "https://lab.flipper.net/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "lan-turtle",
    name: "LAN Turtle",
    manufacturer: "Hak5",
    category: "implant",
    tags: ["linux", "ethernet", "shell", "persistent"],
    description: "Covert Ethernet implant running OpenWrt-based Hak5 platform for persistent network access.",
    url: "https://shop.hak5.org/products/lan-turtle",
    firmware: [
      {
        fork: "stock",
        name: "Official (Hak5 portal)",
        version: "check-vendor-portal",
        release_date: "2026-05-27",
        url: "https://downloads.hak5.org/",
        notes: "Firmware hosted on Hak5 downloads portal — client-rendered page; verify version in device UI before upgrading.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "LOW",
      },
    ],
  },
  {
    id: "shark-jack",
    name: "Shark Jack",
    manufacturer: "Hak5",
    category: "implant",
    tags: ["ethernet", "linux", "payloads", "covert"],
    description: "Compact Ethernet attack tool — inline network implants and payload execution.",
    url: "https://shop.hak5.org/products/shark-jack",
    firmware: [
      {
        fork: "stock",
        name: "Official (Hak5 portal)",
        version: "check-vendor-portal",
        release_date: "2026-05-27",
        url: "https://downloads.hak5.org/",
        notes: "Check Hak5 downloads for Shark Jack firmware bundles.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "LOW",
      },
    ],
  },
  {
    id: "packet-squirrel",
    name: "Packet Squirrel",
    manufacturer: "Hak5",
    category: "implant",
    tags: ["ethernet", "mitm", "logging", "openwrt"],
    description: "Inline Ethernet MITM and packet capture appliance from Hak5.",
    url: "https://shop.hak5.org/products/packet-squirrel",
    firmware: [
      {
        fork: "stock",
        name: "Official (Hak5 portal)",
        version: "check-vendor-portal",
        release_date: "2026-05-27",
        url: "https://downloads.hak5.org/",
        notes: "Firmware via Hak5 download portal.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "LOW",
      },
    ],
  },
  {
    id: "wifi-duck",
    name: "WiFi Duck / WHID Elite",
    manufacturer: "Hak5 / community clones",
    category: "badusb",
    tags: ["badusb", "wifi", "hid", "ducky-script"],
    description:
      "WiFi-controlled HID injectors (Hak5 WiFi Duck, WHID Elite clones). Web UI for payload staging over WiFi.",
    url: "https://shop.hak5.org/products/wifi-duck",
    firmware: [
      {
        fork: "stock",
        name: "WiFi Duck (Hak5)",
        version: "check-vendor-portal",
        release_date: "2026-05-27",
        url: "https://shop.hak5.org/products/wifi-duck",
        notes: "Hak5 WiFi Duck firmware updates via vendor docs. WHID Elite uses separate WHID ecosystem — not interchangeable.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "MED",
      },
      {
        fork: "community",
        name: "WHID Elite (community)",
        version: "check-vendor",
        release_date: "2026-05-27",
        url: "https://whid.ninja/",
        notes: "Popular WHID Elite injector — firmware/tools on vendor site, not GitHub releases.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "MED",
      },
    ],
  },
  {
    id: "rtl-sdr-blog-v3",
    name: "RTL-SDR Blog V3",
    manufacturer: "RTL-SDR Blog",
    category: "sdr",
    tags: ["rtlsdr", "receive-only", "sdrsharp", "gqrx"],
    description:
      "USB software-defined radio dongle (receive-only). Used with SDR#, GQRX, URH — not a transmit platform like HackRF.",
    url: "https://www.rtl-sdr.com/product/rtl-sdr-blog-v-3-dongle/",
    firmware: [
      {
        fork: "stock",
        name: "RTL2832U drivers + software",
        version: "vendor-bundle",
        release_date: "2026-05-27",
        url: "https://www.rtl-sdr.com/softwaredefinedradio/",
        notes: "No flashable MCU firmware — configure host drivers (Zadig on Windows) and SDR application stack.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "ubertooth-one",
    name: "Ubertooth One",
    manufacturer: "Great Scott Gadgets",
    category: "sdr",
    tags: ["bluetooth", "ble", "2.4ghz", "sniffing"],
    description: "2.4 GHz wireless development platform for Bluetooth monitoring and experimentation.",
    url: "https://greatscottgadgets.com/ubertooth/one/",
    firmware: [
      {
        fork: "stock",
        name: "Ubertooth firmware",
        version: "2020-12-R1",
        release_date: "2020-12-11",
        url: "https://github.com/greatscottgadgets/ubertooth/releases/tag/2020-12-R1",
        notes: "Stable release line — flash via DFU according to GSG docs. Host tools: Kismet, Wireshark plugins.",
        flashable_in_browser: false,
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "m5stack-stick-s3",
    name: "M5StickS3",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32-s3", "compact", "wearable"],
    description: "Newer M5 stick form factor (ESP32-S3). Nemo first-class; Bruce support expanding.",
    url: "https://shop.m5stack.com/products/m5sticks3-esp32s3",
    firmware: [
      nemo("Nemo lists StickS3 as supported target."),
      bruce("Check Bruce board matrix for StickS3 — same generation as PLUS2/Cardputer."),
    ],
  },
  {
    id: "proxmark3-easy",
    name: "Proxmark3 Easy / Lite",
    manufacturer: "Various (RRG-compatible clones)",
    category: "rfid-nfc",
    tags: ["rfid", "nfc", "clone", "budget"],
    description:
      "Budget Proxmark3 clones (Easy, Lite, V4). Often ship with outdated FW — flash Iceman for full feature parity with RDV4.",
    url: "https://github.com/RfidResearchGroup/proxmark3",
    firmware: [
      {
        fork: "community",
        name: "Iceman (RRG)",
        version: "v4.21611",
        release_date: "2026-04-14",
        url: "https://github.com/RfidResearchGroup/proxmark3/releases/tag/v4.21611",
        notes: "Same Iceman build as RDV4 — verify antenna/flash size for clone hardware before flashing.",
        flashable_in_browser: false,
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "wifi-pineapple-mk7c",
    name: "WiFi Pineapple Pager / MK7C",
    manufacturer: "Hak5",
    category: "wifi",
    tags: ["wifi", "pager", "rogue-ap", "portable"],
    description: "Portable WiFi Pineapple form factor (Pager / MK7C line). Hak5 ecosystem firmware.",
    url: "https://shop.hak5.org/products/wi-fi-pineapple-pager",
    firmware: [
      {
        fork: "stock",
        name: "Official (Hak5 portal)",
        version: "check-vendor-portal",
        release_date: "2026-05-27",
        url: "https://downloads.hak5.org/pineapple",
        notes: "Pineapple firmware via Hak5 downloads — same portal family as MK7.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "LOW",
      },
    ],
  },
  {
    id: "houndbee-cyd",
    name: "houndBEE (CYD)",
    manufacturer: "CK42X",
    category: "esp32",
    tags: ["cyd", "esp32", "ck42x", "coming-soon"],
    description:
      "CK42X-native Cheap Yellow Display firmware (MIT fork of ESP32-DIV + nyanBEE modules). Alpha — not flashable yet.",
    url: "https://github.com/lordbuffcloud/houndBEE-cyd",
    firmware: [
      {
        fork: "community",
        name: "houndBEE-CYD",
        version: "alpha-phase-0",
        release_date: "2026-05-27",
        url: "https://github.com/lordbuffcloud/houndBEE-cyd",
        notes: "Phase 0 scaffolding only — no binaries. Watch ck42x.com/houndbee for first flashable release.",
        flashable_in_browser: false,
        release_tracking: "main_branch_only",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
];

function bumpBruce(firmware: Firmware[]): void {
  for (const fw of firmware) {
    if (fw.name === "Bruce" && fw.version === "1.14") {
      fw.version = "1.15";
      fw.release_date = "2026-05-25";
      fw.url = BRUCE_URL;
      fw.flash_url = BRUCE_FLASH;
      fw.last_verified_at = TODAY;
    }
  }
}

async function main(): Promise<void> {
  const path = resolve(process.cwd(), "data/devices.json");
  const catalog: DevicesCatalog = JSON.parse(await readFile(path, "utf-8"));

  for (const device of catalog.devices) {
    bumpBruce(device.firmware);
  }

  // Refresh Flipper RogueMaster pointer
  const flipper = catalog.devices.find((d) => d.id === "flipper-zero");
  const rm = flipper?.firmware.find((f) => f.name === "RogueMaster");
  if (rm) {
    rm.version = "RM0526-0321-0.420.0-0e7e039";
    rm.release_date = "2026-03-21";
    rm.url = "https://github.com/RogueMaster/flipperzero-firmware-wPlugins/releases/tag/RM0526-0321-0.420.0-0e7e039";
    rm.last_verified_at = TODAY;
  }

  const existingIds = new Set(catalog.devices.map((d) => d.id));
  let added = 0;
  for (const device of NEW_DEVICES) {
    if (existingIds.has(device.id)) continue;
    catalog.devices.push(device);
    existingIds.add(device.id);
    added++;
  }

  catalog.version = "1.1.0";
  catalog.generated = new Date().toISOString();

  await writeFile(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Catalog v${catalog.version}: ${catalog.devices.length} devices (+${added} new), Bruce → 1.15`);
}

main();
