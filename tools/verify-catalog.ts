import assert from "node:assert/strict";

import catalog from "../data/devices.json";
import type { DevicesCatalog } from "../types/Device";
import { classifyLinkStatus, isLinkCheckOk } from "./link-health";

const devicesCatalog = catalog as DevicesCatalog;

assert.equal(classifyLinkStatus(200), "healthy");
assert.equal(classifyLinkStatus(301), "healthy");
assert.equal(classifyLinkStatus(404), "broken");
assert.equal(classifyLinkStatus(410), "broken");
assert.equal(classifyLinkStatus(429), "transient");
assert.equal(classifyLinkStatus(503), "transient");
assert.equal(classifyLinkStatus("TIMEOUT"), "transient");
assert.equal(classifyLinkStatus("ERROR"), "transient");
assert.equal(isLinkCheckOk(200), true);
assert.equal(isLinkCheckOk(404), false);
assert.equal(isLinkCheckOk(429), true);
assert.equal(isLinkCheckOk("TIMEOUT"), true);

const device = (id: string) => {
  const match = devicesCatalog.devices.find((candidate) => candidate.id === id);
  assert.ok(match, `missing catalog device: ${id}`);
  return match!;
};

const firmware = (deviceId: string, name: string) => {
  const match = device(deviceId).firmware.find((candidate) => candidate.name === name);
  assert.ok(match, `missing ${name} firmware for ${deviceId}`);
  return match!;
};

// Baseline pinned to the 2026-11-18 verified refresh (catalog v1.4.0).
assert.equal(
  device("m5stickc-plus").url,
  "https://docs.m5stack.com/en/core/StickC-Plus",
);
assert.equal(
  device("m5stack-core-basic").url,
  "https://docs.m5stack.com/en/core/Basic",
);
assert.equal(
  firmware("usb-rubber-ducky-mk2", "Mark II (PayloadStudio architecture)").url,
  "https://documentation.hak5.org/hak5-usb-rubber-ducky",
);

const launcherDeviceIds = [
  "m5stack-cardputer",
  "m5stack-cardputer-adv",
  "m5stickc-plus",
  "m5stickc-plus2",
  "m5stack-core-basic",
  "m5stack-core2",
  "m5stack-cores3",
  "m5stack-stick-s3",
  "cheap-yellow-display",
  "lilygo-t-deck",
  "lilygo-t-dongle-s3",
  "lilygo-tembed-cc1101",
  "lilygo-t-embed",
  "lilygo-t-watch-s3",
  "lilygo-t-lora-pager",
];

// Board-support confidence stays MED where the 2026-11-18 pass could not
// fully confirm the Launcher 3.0.0 target matrix for that exact board.
const launcherMedConfidence = new Set(["m5stack-cardputer-adv", "m5stickc-plus"]);

for (const deviceId of launcherDeviceIds) {
  const entry = firmware(deviceId, "Launcher");
  assert.equal(entry.version, "3.0.0");
  assert.equal(entry.release_date, "2026-11-06");
  assert.equal(entry.url, "https://github.com/bmorcelli/Launcher/releases/tag/3.0.0");
  assert.equal(entry.flashable_in_browser, true);
  assert.equal(entry.flash_url, "https://bmorcelli.github.io/Launcher/webflasher.html");
  assert.equal(entry.release_tracking, "tagged_releases");
  assert.equal(entry.last_verified_at, "2026-11-18");
  assert.equal(entry.confidence, launcherMedConfidence.has(deviceId) ? "MED" : "HIGH");
}

const evilCardputer = firmware("m5stack-cardputer", "Evil-M5Project");
assert.equal(evilCardputer.version, "1.5.8");
assert.equal(evilCardputer.release_date, "2026-11-15");
assert.equal(evilCardputer.release_tracking, "main_branch_only");
assert.equal(evilCardputer.confidence, "HIGH");

const evilCore2 = firmware("m5stack-core2", "Evil-M5Project");
assert.equal(evilCore2.version, "1.5.1");
assert.equal(evilCore2.release_date, "2026-07-23");
assert.equal(evilCore2.release_tracking, "main_branch_only");
assert.equal(evilCore2.confidence, "HIGH");

const cydMarauder = firmware("cheap-yellow-display", "ESP32 Marauder (CYD)");
assert.equal(cydMarauder.version, "v1.4.3");
assert.equal(cydMarauder.release_date, "2025-04-17");
assert.equal(cydMarauder.release_tracking, "tagged_releases");
assert.equal(cydMarauder.confidence, "HIGH");

for (const entry of devicesCatalog.devices) {
  const names = entry.firmware.map((candidate) => candidate.name);
  assert.equal(new Set(names).size, names.length, `duplicate firmware in ${entry.id}`);
}

console.log(
  `Catalog integrity verified: ${devicesCatalog.devices.length} devices, ${devicesCatalog.devices.reduce((total, entry) => total + entry.firmware.length, 0)} firmware entries.`,
);
