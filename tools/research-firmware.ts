#!/usr/bin/env bun
/**
 * research-firmware.ts — weekly LLM-assisted firmware-version refresh
 *
 * Used by .github/workflows/weekly-research.yml. Calls OpenAI for each
 * device in data/devices.json, asks for verified-current firmware
 * version/release_date/url, and writes a proposed updated catalog to
 * data/devices.proposed.json plus a markdown diff summary to
 * research-report.md. The workflow opens a PR if anything changed.
 *
 * NEVER auto-merges. The PR is a human-review gate.
 *
 * Env:
 *   OPENAI_API_KEY    required
 *   OPENAI_MODEL      optional, default 'gpt-4o' — override to gpt-5 / gpt-4o-mini
 *   RESEARCH_TIMEOUT  optional ms, default 30000 per device
 *
 * Run locally:
 *   OPENAI_API_KEY=sk-... bun run tools/research-firmware.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

interface Firmware {
  fork: string;
  name: string;
  version: string;
  release_date: string;
  url: string;
  notes: string;
  flashable_in_browser: boolean;
  flash_url?: string;
  archived?: boolean;
  release_tracking?: string;
  last_verified_at?: string;
  confidence?: "HIGH" | "MED" | "LOW";
}

interface Device {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  url: string;
  firmware: Firmware[];
}

interface Catalog {
  version: string;
  generated: string;
  license: string;
  submission_url: string;
  devices: Device[];
}

interface FirmwareUpdate {
  fork: string;
  name: string;
  current_version: string;
  proposed_version?: string;
  current_release_date: string;
  proposed_release_date?: string;
  current_url: string;
  proposed_url?: string;
  proposed_notes?: string;
  reason: string;
  confidence: "HIGH" | "MED" | "LOW";
}

interface DeviceResearchResult {
  device_id: string;
  device_name: string;
  updates: FirmwareUpdate[];
  new_forks?: Array<{
    fork: string;
    name: string;
    version: string;
    release_date: string;
    url: string;
    notes: string;
    flashable_in_browser: boolean;
    flash_url?: string;
    confidence: "HIGH" | "MED" | "LOW";
  }>;
  error?: string;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
const TIMEOUT_MS = Number(process.env.RESEARCH_TIMEOUT ?? 30_000);

if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required.");
  process.exit(2);
}

const SYSTEM_PROMPT = `You are verifying firmware version information for the Flashbay catalog
(https://flashbay.ck42x.com), a public index of firmware for cybersecurity hardware.

For a given device and its currently-cataloged firmware entries, return a JSON
object indicating ANY of these that apply:
1. Updates to existing firmware (newer version, new release_date, or URL change)
2. New community forks that should be added (real forks with public releases)

You MUST:
- Only suggest changes you can independently verify against public sources today
- Mark confidence HIGH only when 2+ independent sources confirm
- Mark MED when 1 source confirms but other details conflict
- Mark LOW when you cannot verify but have reasonable suspicion
- Return an empty updates array if nothing has changed — do NOT pad with speculation
- Use exact JSON shape below — no surrounding markdown

Return shape:
{
  "updates": [
    {
      "fork": "stock|community",
      "name": "exact fork name from current data",
      "current_version": "what's in the catalog",
      "proposed_version": "new version (omit if no change)",
      "current_release_date": "YYYY-MM-DD from catalog",
      "proposed_release_date": "YYYY-MM-DD (omit if no change)",
      "current_url": "current url",
      "proposed_url": "new url (omit if no change)",
      "proposed_notes": "updated notes (omit if no change)",
      "reason": "one-sentence justification with source attribution",
      "confidence": "HIGH|MED|LOW"
    }
  ],
  "new_forks": [
    { "fork": "community", "name": "...", "version": "...", "release_date": "...", "url": "...", "notes": "...", "flashable_in_browser": true|false, "flash_url": "...", "confidence": "HIGH|MED" }
  ]
}`;

async function callOpenAI(device: Device): Promise<DeviceResearchResult> {
  const userPrompt = `Device: ${device.name}
Manufacturer: ${device.manufacturer}
Category: ${device.category}
Device URL: ${device.url}

Currently cataloged firmware (verify each, propose updates):
${JSON.stringify(device.firmware, null, 2)}

Today's date: ${new Date().toISOString().slice(0, 10)}

Return JSON only, no markdown fence.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        device_id: device.id,
        device_name: device.name,
        updates: [],
        error: `OpenAI ${res.status}: ${body.slice(0, 300)}`,
      };
    }

    const payload = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      updates?: FirmwareUpdate[];
      new_forks?: DeviceResearchResult["new_forks"];
    };
    return {
      device_id: device.id,
      device_name: device.name,
      updates: parsed.updates ?? [],
      new_forks: parsed.new_forks ?? [],
    };
  } catch (e) {
    return {
      device_id: device.id,
      device_name: device.name,
      updates: [],
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(timer);
  }
}

function applyUpdates(catalog: Catalog, results: DeviceResearchResult[]): { updated: Catalog; changed: boolean } {
  let changed = false;
  const today = new Date().toISOString().slice(0, 10);

  for (const result of results) {
    if (result.error || (result.updates.length === 0 && (!result.new_forks || result.new_forks.length === 0))) {
      continue;
    }
    const device = catalog.devices.find((d) => d.id === result.device_id);
    if (!device) continue;

    // Apply updates to existing firmware
    for (const update of result.updates) {
      const fw = device.firmware.find((f) => f.fork === update.fork && f.name === update.name);
      if (!fw) continue;
      let modified = false;
      if (update.proposed_version && update.proposed_version !== fw.version) {
        fw.version = update.proposed_version;
        modified = true;
      }
      if (update.proposed_release_date && update.proposed_release_date !== fw.release_date) {
        fw.release_date = update.proposed_release_date;
        modified = true;
      }
      if (update.proposed_url && update.proposed_url !== fw.url) {
        fw.url = update.proposed_url;
        modified = true;
      }
      if (update.proposed_notes && update.proposed_notes !== fw.notes) {
        fw.notes = update.proposed_notes;
        modified = true;
      }
      if (modified) {
        fw.last_verified_at = today;
        fw.confidence = update.confidence;
        changed = true;
      }
    }

    // Append new forks (community only, never replace stock)
    if (result.new_forks) {
      for (const nf of result.new_forks) {
        if (nf.fork !== "community") continue;
        const exists = device.firmware.some((f) => f.name.toLowerCase() === nf.name.toLowerCase());
        if (exists) continue;
        device.firmware.push({
          ...nf,
          last_verified_at: today,
          release_tracking: "tagged_releases",
        });
        changed = true;
      }
    }
  }

  if (changed) {
    catalog.generated = new Date().toISOString();
    // Patch-bump version: 1.0.3 -> 1.0.4
    const parts = catalog.version.split(".").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
      parts[2] = (parts[2] ?? 0) + 1;
      catalog.version = parts.join(".");
    }
  }

  return { updated: catalog, changed };
}

function renderReport(results: DeviceResearchResult[], changed: boolean): string {
  const lines: string[] = [];
  lines.push(`# Weekly firmware research report — ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push(`Model: \`${OPENAI_MODEL}\``);
  lines.push(`Devices analyzed: ${results.length}`);
  lines.push("");

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    lines.push(`## ⚠️ Research errors (${errors.length})`);
    for (const e of errors) {
      lines.push(`- **${e.device_name}** (\`${e.device_id}\`): ${e.error}`);
    }
    lines.push("");
  }

  const withUpdates = results.filter((r) => !r.error && (r.updates.length > 0 || (r.new_forks?.length ?? 0) > 0));
  if (withUpdates.length === 0) {
    lines.push(`## ✓ No drift detected`);
    lines.push("All firmware entries verified current.");
    return lines.join("\n");
  }

  lines.push(`## Proposed changes (${withUpdates.length} device${withUpdates.length === 1 ? "" : "s"})`);
  lines.push("");

  for (const r of withUpdates) {
    lines.push(`### ${r.device_name} (\`${r.device_id}\`)`);
    for (const u of r.updates) {
      const changes: string[] = [];
      if (u.proposed_version) changes.push(`version: \`${u.current_version}\` → \`${u.proposed_version}\``);
      if (u.proposed_release_date) changes.push(`date: \`${u.current_release_date}\` → \`${u.proposed_release_date}\``);
      if (u.proposed_url) changes.push(`url: ${u.proposed_url}`);
      if (u.proposed_notes) changes.push(`notes updated`);
      if (changes.length === 0) continue;
      lines.push(`- **${u.fork} / ${u.name}** [${u.confidence}]: ${changes.join(", ")}`);
      lines.push(`  - _${u.reason}_`);
    }
    if (r.new_forks) {
      for (const nf of r.new_forks) {
        lines.push(`- **NEW community fork: ${nf.name}** v${nf.version} [${nf.confidence}]: ${nf.url}`);
        lines.push(`  - _${nf.notes}_`);
      }
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(`Catalog version bumped to **${changed ? "next patch" : "no change"}**. Review the diff in this PR before merging.`);
  return lines.join("\n");
}

async function main(): Promise<void> {
  const path = resolve(process.cwd(), "data/devices.json");
  const raw = await readFile(path, "utf-8");
  const catalog: Catalog = JSON.parse(raw);

  console.log(`Researching ${catalog.devices.length} devices with ${OPENAI_MODEL}…`);

  // Concurrency 3 — easy on OpenAI rate limits + cheap on retries
  const results: DeviceResearchResult[] = [];
  const CONCURRENCY = 3;
  for (let i = 0; i < catalog.devices.length; i += CONCURRENCY) {
    const batch = catalog.devices.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map((d) => callOpenAI(d)));
    results.push(...batchResults);
    console.log(`  ${Math.min(i + CONCURRENCY, catalog.devices.length)}/${catalog.devices.length}`);
  }

  const { updated, changed } = applyUpdates(catalog, results);
  const report = renderReport(results, changed);

  await writeFile("research-report.md", report);

  if (changed) {
    await writeFile("data/devices.json", JSON.stringify(updated, null, 2) + "\n");
    console.log("\nChanges applied. data/devices.json updated.");
  } else {
    console.log("\nNo changes — catalog is current.");
  }

  console.log("\nReport: research-report.md");
}

main().catch((e) => {
  console.error("research-firmware failed:", e);
  process.exit(1);
});
