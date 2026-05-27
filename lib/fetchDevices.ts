import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DevicesCatalog } from "@/types/Device";
import bundledCatalog from "@/data/devices.json";

export function getBundledCatalog(): DevicesCatalog {
  return bundledCatalog as DevicesCatalog;
}

const REMOTE_URL =
  "https://raw.githubusercontent.com/lordbuffcloud/flashbay/main/data/devices.json";

/** Bump when catalog schema or baseline version changes — invalidates stale browser cache. */
const CACHE_KEY = "flashbay:devices-cache:v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface CacheEnvelope {
  fetched_at: number;
  catalog: DevicesCatalog;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function isCacheFresh(envelope: CacheEnvelope, bundled: DevicesCatalog): boolean {
  const age = Date.now() - envelope.fetched_at;
  if (age >= CACHE_TTL_MS) return false;
  // Drop caches from older catalog generations (e.g. v1.0.4 / 16 devices).
  if (compareVersions(envelope.catalog.version, bundled.version) < 0) return false;
  if (envelope.catalog.devices.length < bundled.devices.length) return false;
  return true;
}

async function readCache(bundled: DevicesCatalog): Promise<DevicesCatalog | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope;
    if (!isCacheFresh(parsed, bundled)) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.catalog;
  } catch {
    return null;
  }
}

async function writeCache(catalog: DevicesCatalog): Promise<void> {
  const envelope: CacheEnvelope = { fetched_at: Date.now(), catalog };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(envelope)).catch(() => {});
}

export async function fetchDevices(): Promise<DevicesCatalog> {
  const bundled = getBundledCatalog();

  // 1. Prefer live GitHub catalog (always current after a data-only push).
  try {
    const res = await fetch(`${REMOTE_URL}?t=${bundled.version}`, { cache: "no-store" });
    if (res.ok) {
      const catalog = (await res.json()) as DevicesCatalog;
      await writeCache(catalog);
      return catalog;
    }
  } catch {
    // network failure — fall through
  }

  // 2. Fresh local cache (same version as bundled or newer).
  const cached = await readCache(bundled);
  if (cached) return cached;

  // 3. Bundled JSON baked into the static export.
  return bundled;
}
