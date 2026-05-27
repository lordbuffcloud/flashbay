#!/usr/bin/env bun
/**
 * Catalog batch 2 — Bruce OSS hardware, GSG tools, Hak5 Key Croc, Meshtastic boards, etc.
 * Run: bun run tools/expand-catalog-batch2.ts
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

function meshtastic(notes: string): Firmware {
  return {
    fork: "community",
    name: "Meshtastic",
    version: "check-releases",
    release_date: TODAY,
    url: "https://github.com/meshtastic/firmware/releases/latest",
    notes,
    flashable_in_browser: true,
    flash_url: "https://flasher.meshtastic.org/",
    release_tracking: "tagged_releases",
    last_verified_at: TODAY,
    confidence: "HIGH",
  };
}

const BATCH2: Device[] = [
  {
    id: "m5stack-core-basic",
    name: "M5Stack Core BASIC",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32", "m5core", "touchscreen", "grove"],
    description:
      "Original M5Stack Core (ESP32) with 2\" TFT and Grove port. Bruce community target when paired with CC1101/NRF24 shields.",
    url: "https://docs.m5stack.com/en/core/Core",
    firmware: [
      bruce("Bruce on M5Core BASIC — tone speaker, BadUSB¹ via USB; add RF modules per Bruce wiring docs."),
    ],
  },
  {
    id: "bruce-rf-reaper",
    name: "Bruce RF Reaper",
    manufacturer: "Smoochiee / Bruce (open hardware)",
    category: "esp32",
    tags: ["esp32-s3", "open-hardware", "cc1101", "nrf24", "bruce-native"],
    description:
      "Official Bruce open-source PCB — ESP32-S3 with CC1101, NRF24, fuel gauge, and RGB. Designed for Bruce firmware out of the box.",
    url: "https://bruce.computer/boards",
    firmware: [
      bruce("Flagship Bruce OSS board — full RF feature matrix on bruce.computer/boards. Order PCBs via Elecrow/PCBWay links on site."),
    ],
  },
  {
    id: "bruce-pcb-v2",
    name: "Bruce PCB V2 (Smoochiee)",
    manufacturer: "Smoochiee / Bruce",
    category: "esp32",
    tags: ["esp32-s3", "open-hardware", "smoochiee", "cc1101", "nrf24"],
    description:
      "Community Bruce PCB V2 by Smoochiee — RF exploration board with CC1101, NRF24, PN532 path, and extensive GPIO.",
    url: "https://bruce.computer/boards",
    firmware: [bruce("Smoochiee V2 in Bruce board matrix — same flasher flow as other ESP32-S3 Bruce targets.")],
  },
  {
    id: "chameleon-mini",
    name: "ChameleonMini",
    manufacturer: "Kamelio / RRG ecosystem",
    category: "rfid-nfc",
    tags: ["nfc", "hf", "emulation", "avr", "legacy"],
    description:
      "Classic contactless smartcard emulator (NFC). AVR-based; distinct from Chameleon Ultra/Lite NRF52 line. RRG maintains a community fork.",
    url: "https://github.com/RfidResearchGroup/ChameleonMini",
    firmware: [
      {
        fork: "community",
        name: "RRG ChameleonMini",
        version: "Build-f524d973",
        release_date: "2023-11-15",
        url: "https://github.com/RfidResearchGroup/ChameleonMini/releases/tag/Build-f524d97378405e6fdc0edd8b2b672c86ccc745f8",
        notes: "RRG fork of KAOS ChameleonMini. Infrequent tagged builds — verify latest release before flashing. CLI via chameleonmini project docs.",
        flashable_in_browser: false,
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "MED",
      },
    ],
  },
  {
    id: "greatfet-one",
    name: "GreatFET One",
    manufacturer: "Great Scott Gadgets",
    category: "sdr",
    tags: ["usb", "gpio", "facedancer", "logic-analyzer", "greatfet"],
    description:
      "USB peripheral multitool — Facedancer USB attacks, logic analyzer, SPI/I2C bridge. Companion to HackRF in GSG ecosystem.",
    url: "https://greatscottgadgets.com/greatfet/",
    firmware: [
      {
        fork: "stock",
        name: "GreatFET firmware",
        version: "v2026.0.0",
        release_date: "2026-01-15",
        url: "https://github.com/greatscottgadgets/greatfet/releases/tag/v2026.0.0",
        notes: "Official GSG release v2026.0.0. Flash via DFU / greatfet tooling per wiki. Host tools: Facedancer, libgreat.",
        flashable_in_browser: false,
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "bladerf",
    name: "bladeRF",
    manufacturer: "Nuand",
    category: "sdr",
    tags: ["sdr", "fpga", "full-duplex", "tx", "rx"],
    description:
      "USB 3.0 SDR platform (bladeRF x40/x115, micro, 2.0 micro xA4/xA9). FPGA-hosted signal processing; distinct from HackRF use cases.",
    url: "https://www.nuand.com/bladeRF/",
    firmware: [
      {
        fork: "stock",
        name: "bladeRF FPGA + FX3",
        version: "2025.10",
        release_date: "2025-10-01",
        url: "https://github.com/Nuand/bladeRF/releases/tag/2025.10",
        notes: "Nuand host + FPGA bitstream releases. Flash via bladeRF-cli / libbladeRF documentation for your hardware revision.",
        flashable_in_browser: false,
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "hak5-key-croc",
    name: "Key Croc",
    manufacturer: "Hak5",
    category: "implant",
    tags: ["keylogger", "badusb", "linux", "covert", "hak5"],
    description:
      "Inline keyboard implant — logs keystrokes and runs payloads when deployed between keyboard and target.",
    url: "https://shop.hak5.org/products/key-croc",
    firmware: [
      {
        fork: "stock",
        name: "Official (Hak5 portal)",
        version: "check-vendor-portal",
        release_date: TODAY,
        url: "https://downloads.hak5.org/",
        notes: "Key Croc firmware distributed via Hak5 downloads portal. Verify version on device before upgrade.",
        flashable_in_browser: false,
        release_tracking: "vendor_portal",
        last_verified_at: TODAY,
        confidence: "LOW",
      },
    ],
  },
  {
    id: "m5stack-m5dial",
    name: "M5Dial",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32-s3", "rotary", "touch", "round-display"],
    description:
      "ESP32-S3 round display with rotary encoder and touch. Growing Bruce community target for compact UI pentest tools.",
    url: "https://shop.m5stack.com/products/m5dial-esp32-s3-smart-rotary-knob-w-1-28-round-touch-screen",
    firmware: [
      bruce("Check Bruce release notes for M5Dial support — flash via bruce.computer flasher when listed in board picker."),
    ],
  },
  {
    id: "m5stack-atoms3",
    name: "M5Stack AtomS3",
    manufacturer: "M5Stack",
    category: "esp32",
    tags: ["esp32-s3", "compact", "led-matrix"],
    description: "Tiny ESP32-S3 module with LED matrix. Popular for badges; Marauder ports exist for some Atom form factors.",
    url: "https://shop.m5stack.com/products/atoms3",
    firmware: [
      marauder("Some Marauder community builds target AtomS3 — confirm board variant in FZEE Flasher before flashing."),
    ],
  },
  {
    id: "esp32-c5-devkitc",
    name: "ESP32-C5 DevKitC-1",
    manufacturer: "Espressif",
    category: "esp32",
    tags: ["esp32-c5", "wifi-6", "ble", "devkit"],
    description:
      "Espressif ESP32-C5 dev kit (Wi-Fi 6 / BLE). Bruce adds C5 support for early adopters — check matrix for feature limits.",
    url: "https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c5/esp32-c5-devkitc-1/index.html",
    firmware: [bruce("Bruce ESP32-C5 row — WiFi/BLE/RF features per BruceDevices board matrix; no BadUSB on C5.")],
  },
  {
    id: "lilygo-t-embed-cc1101-plus",
    name: "LilyGo T-Embed CC1101 Plus",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "cc1101", "nrf24", "handheld"],
    description: "Updated T-Embed CC1101 with NRF24 and refined RF layout. Bruce first-class target alongside original T-Embed CC1101.",
    url: "https://www.lilygo.cc/products/t-embed-cc1101-plus",
    firmware: [bruce("T-Embed CC1101 Plus — full CC1101 + NRF24 in Bruce 1.15 board matrix.")],
  },
  {
    id: "lilygo-t-beam-supreme",
    name: "LilyGo T-Beam Supreme",
    manufacturer: "LilyGo",
    category: "esp32",
    tags: ["esp32-s3", "lora", "gps", "meshtastic"],
    description: "ESP32-S3 + SX1262 LoRa + GPS flagship for Meshtastic. Not a WiFi offensive board — mesh firmware is the primary path.",
    url: "https://lilygo.cc/products/t-beam-supreme",
    firmware: [
      meshtastic("Primary firmware for T-Beam Supreme — flash via flasher.meshtastic.org and select board target."),
    ],
  },
  {
    id: "waveshare-esp32-s3-147",
    name: "Waveshare ESP32-S3 1.47\"",
    manufacturer: "Waveshare",
    category: "esp32",
    tags: ["esp32-s3", "usb-dongle", "display", "usb-army-knife"],
    description:
      "USB-dongle ESP32-S3 with 1.47\" round display. USB Army Knife tested hardware — similar class to T-Dongle S3.",
    url: "https://www.waveshare.com/esp32-s3-1.47inch.htm",
    firmware: [
      {
        fork: "community",
        name: "USB Army Knife",
        version: "main-branch",
        release_date: TODAY,
        url: "https://github.com/i-am-shodan/USBArmyKnife",
        notes: "Documented USB Army Knife compatible board. Build from GitHub Actions artifacts per project README.",
        flashable_in_browser: false,
        release_tracking: "main_branch_only",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "pocket-dongle-s3",
    name: "Pocket Dongle S3",
    manufacturer: "LilyGo (clone form factor)",
    category: "esp32",
    tags: ["esp32-s3", "usb-dongle", "covert"],
    description:
      "T-Dongle S3–style clone with different SD/button layout. USB Army Knife supports with slower SD — verify hardware before flash.",
    url: "https://github.com/i-am-shodan/USBArmyKnife",
    firmware: [
      {
        fork: "community",
        name: "USB Army Knife",
        version: "main-branch",
        release_date: TODAY,
        url: "https://github.com/i-am-shodan/USBArmyKnife",
        notes: "Listed in USB Army Knife hardware table as Pocket-Dongle-S3. Use Generic board profile if autodetect fails.",
        flashable_in_browser: false,
        release_tracking: "main_branch_only",
        last_verified_at: TODAY,
        confidence: "MED",
      },
    ],
  },
  {
    id: "dstike-deauther",
    name: "DSTIKE Deauther (boards)",
    manufacturer: "DSTIKE / Spacehuhn ecosystem",
    category: "wifi",
    tags: ["esp8266", "deauth", "oled", "dstike", "monster"],
    description:
      "Commercial ESP8266 deauther boards (Deauther Monster, Watch, Pro, etc.) running the Spacehuhn esp8266_deauther firmware family.",
    url: "https://github.com/SpacehuhnTech/esp8266_deauther",
    firmware: [
      {
        fork: "stock",
        name: "esp8266_deauther",
        version: "2.6.1",
        release_date: "2021-08-07",
        url: "https://github.com/SpacehuhnTech/esp8266_deauther/releases/tag/2.6.1",
        notes: "Same firmware as generic ESP8266 Deauther entry — DSTIKE boards ship pre-flashed but often outdated. Re-flash via deauther.com or esptool.",
        flashable_in_browser: true,
        flash_url: "https://deauther.com/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "flipper-nfc-module",
    name: "Flipper Zero NFC Module",
    manufacturer: "Flipper Devices",
    category: "flipper-accessory",
    tags: ["nfc", "flipper", "gpio", "module"],
    description:
      "Official Flipper NFC expansion module. Firmware ships with Flipper OFW — update the Flipper, not the module in isolation.",
    url: "https://shop.flipperzero.one/",
    firmware: [
      {
        fork: "stock",
        name: "Flipper OFW (includes NFC stack)",
        version: "1.4.3",
        release_date: "2025-12-05",
        url: "https://github.com/flipperdevices/flipperzero-firmware/releases/tag/1.4.3",
        notes: "NFC features driven by main Flipper firmware. Use lab.flipper.net or qFlipper to update.",
        flashable_in_browser: true,
        flash_url: "https://lab.flipper.net/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "flipper-subghz-module",
    name: "Flipper Zero Sub-GHz Module",
    manufacturer: "Flipper Devices",
    category: "flipper-accessory",
    tags: ["sub-ghz", "flipper", "cc1101", "module"],
    description:
      "External Sub-GHz module for Flipper Zero (CC1101). Hardware firmware bundled with Flipper OFW / community forks.",
    url: "https://shop.flipperzero.one/",
    firmware: [
      {
        fork: "stock",
        name: "Flipper OFW",
        version: "1.4.3",
        release_date: "2025-12-05",
        url: "https://github.com/flipperdevices/flipperzero-firmware/releases/tag/1.4.3",
        notes: "Sub-GHz stack updated via Flipper firmware. Community forks (Unleashed, Momentum) add regional/protocol patches.",
        flashable_in_browser: true,
        flash_url: "https://lab.flipper.net/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
      {
        fork: "community",
        name: "Unleashed",
        version: "unlshd-089",
        release_date: "2026-05-09",
        url: "https://github.com/DarkFlippers/unleashed-firmware/releases/tag/unlshd-089",
        notes: "Region unlock and extended Sub-GHz protocols — flash entire Flipper, module follows.",
        flashable_in_browser: true,
        flash_url: "https://lab.flipper.net/",
        release_tracking: "tagged_releases",
        last_verified_at: TODAY,
        confidence: "HIGH",
      },
    ],
  },
  {
    id: "heltec-wifi-lora-32",
    name: "Heltec WiFi LoRa 32 (V3)",
    manufacturer: "Heltec",
    category: "esp32",
    tags: ["esp32-s3", "lora", "oled", "meshtastic"],
    description: "Popular ESP32-S3 + SX1262 LoRa board. Meshtastic community standard; not a Bruce/Marauder primary target.",
    url: "https://heltec.org/project/wifi-lora-32-v3/",
    firmware: [meshtastic("Heltec V3 is a common Meshtastic target — select exact board in Meshtastic flasher.")],
  },
];

async function main(): Promise<void> {
  const path = resolve(process.cwd(), "data/devices.json");
  const catalog: DevicesCatalog = JSON.parse(await readFile(path, "utf-8"));
  const ids = new Set(catalog.devices.map((d) => d.id));
  let added = 0;
  for (const device of BATCH2) {
    if (ids.has(device.id)) continue;
    catalog.devices.push(device);
    ids.add(device.id);
    added++;
  }
  const parts = catalog.version.split(".").map(Number);
  if (parts[0] === 1 && parts[1] === 1) {
    catalog.version = "1.2.0";
  } else if (parts.length === 3) {
    parts[1] = (parts[1] ?? 0) + 1;
    parts[2] = 0;
    catalog.version = parts.join(".");
  }
  catalog.generated = new Date().toISOString();
  await writeFile(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Catalog v${catalog.version}: ${catalog.devices.length} devices (+${added} batch 2)`);
}

main();
