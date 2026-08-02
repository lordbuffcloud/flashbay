#!/usr/bin/env bun
/**
 * verify-links.ts — HEAD-check every URL in data/devices.json
 *
 * Used by .github/workflows/weekly-verify.yml on a cron schedule.
 *
 * Behavior:
 *   - HEADs every `url` and `flash_url` across every device + firmware
 *   - Treats 200-399 as healthy, permanent 400/404/410 responses as broken,
 *     and rate limits, server errors, timeouts, and network failures as transient.
 *   - Writes results to verify-links-report.json (consumed by the GH Action).
 *   - Exits non-zero if any link is broken, so the Action step fails.
 *
 * Run locally:
 *   bun run tools/verify-links.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { classifyLinkStatus, isLinkCheckOk, type LinkHealth, type LinkStatus } from "./link-health";

interface Firmware {
  fork: string;
  name: string;
  version: string;
  url: string;
  flash_url?: string;
  archived?: boolean;
}

interface Device {
  id: string;
  name: string;
  url: string;
  firmware: Firmware[];
}

interface Catalog {
  version: string;
  devices: Device[];
}

interface LinkCheck {
  device_id: string;
  firmware_name?: string;
  field: "device.url" | "firmware.url" | "firmware.flash_url";
  url: string;
  status: LinkStatus;
  classification: LinkHealth;
  ok: boolean;
  error?: string;
}

interface Report {
  generated_at: string;
  catalog_version: string;
  total_links: number;
  broken_count: number;
  transient_count: number;
  results: LinkCheck[];
}

const TIMEOUT_MS = 15_000;
const USER_AGENT = "Flashbay-LinkVerifier/1.0 (+https://github.com/lordbuffcloud/flashbay)";

async function headCheck(url: string): Promise<{ status: LinkStatus; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Try HEAD first; fall back to GET if HEAD is rejected (some servers don't allow HEAD)
    let res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: controller.signal,
    });
    if ([403, 404, 405, 501].includes(res.status)) {
      res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": USER_AGENT },
        redirect: "follow",
        signal: controller.signal,
      });
    }
    return { status: res.status };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return { status: "TIMEOUT" };
    }
    return { status: "ERROR", error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  const path = resolve(process.cwd(), "data/devices.json");
  const raw = await readFile(path, "utf-8");
  const catalog: Catalog = JSON.parse(raw);

  const checks: Array<{ check: LinkCheck["field"]; device_id: string; firmware_name?: string; url: string }> = [];

  for (const device of catalog.devices) {
    checks.push({ check: "device.url", device_id: device.id, url: device.url });
    for (const fw of device.firmware) {
      // Skip archived firmware — their URLs may legitimately 404 (repos archived/deleted)
      if (fw.archived) continue;
      checks.push({ check: "firmware.url", device_id: device.id, firmware_name: fw.name, url: fw.url });
      if (fw.flash_url) {
        checks.push({ check: "firmware.flash_url", device_id: device.id, firmware_name: fw.name, url: fw.flash_url });
      }
    }
  }

  console.log(`Checking ${checks.length} links across ${catalog.devices.length} devices…`);

  // Run with concurrency 8 — kind to servers, fast enough
  const results: LinkCheck[] = [];
  const CONCURRENCY = 8;
  for (let i = 0; i < checks.length; i += CONCURRENCY) {
    const batch = checks.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (c) => {
        const probe = await headCheck(c.url);
        const classification = classifyLinkStatus(probe.status);
        const result: LinkCheck = {
          device_id: c.device_id,
          firmware_name: c.firmware_name,
          field: c.check,
          url: c.url,
          status: probe.status,
          classification,
          ok: isLinkCheckOk(probe.status),
        };
        if (probe.error) result.error = probe.error;
        return result;
      }),
    );
    results.push(...batchResults);
    const completed = Math.min(i + CONCURRENCY, checks.length);
    console.log(`  ${completed}/${checks.length}`);
  }

  const broken = results.filter((result) => result.classification === "broken");
  const transient = results.filter((result) => result.classification === "transient");

  const report: Report = {
    generated_at: new Date().toISOString(),
    catalog_version: catalog.version,
    total_links: results.length,
    broken_count: broken.length,
    transient_count: transient.length,
    results,
  };

  await writeFile("verify-links-report.json", JSON.stringify(report, null, 2));

  console.log("");
  console.log(`Total checked: ${report.total_links}`);
  console.log(`Broken:        ${report.broken_count}`);
  console.log(`Transient:     ${report.transient_count}`);

  if (transient.length > 0) {
    console.log("");
    console.log("Transient/unverified links:");
    for (const result of transient) {
      const where = result.firmware_name
        ? `${result.device_id} / ${result.firmware_name} (${result.field})`
        : `${result.device_id} (${result.field})`;
      console.log(`  [${result.status}] ${where} → ${result.url}`);
      if (result.error) console.log(`         ${result.error}`);
    }
  }

  if (broken.length > 0) {
    console.log("");
    console.log("Broken links:");
    for (const b of broken) {
      const where = b.firmware_name ? `${b.device_id} / ${b.firmware_name} (${b.field})` : `${b.device_id} (${b.field})`;
      console.log(`  [${b.status}] ${where} → ${b.url}`);
      if (b.error) console.log(`         ${b.error}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("verify-links failed:", e);
  process.exit(2);
});
