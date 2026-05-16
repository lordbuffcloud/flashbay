import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DevicesCatalog } from "@/types/Device";
import bundledCatalog from "@/data/devices.json";

const REMOTE_URL =
  "https://raw.githubusercontent.com/lordbuffcloud/flashbay/main/data/devices.json";

const CACHE_KEY = "flashbay:devices-cache:v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface CacheEnvelope {
  fetched_at: number;
  catalog: DevicesCatalog;
}

export async function fetchDevices(): Promise<DevicesCatalog> {
  // 1. Try cache first
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CacheEnvelope;
      const age = Date.now() - parsed.fetched_at;
      if (age < CACHE_TTL_MS) return parsed.catalog;
    }
  } catch {
    // cache read failure — fall through to network
  }

  // 2. Try remote
  try {
    const res = await fetch(REMOTE_URL, { cache: "no-cache" });
    if (res.ok) {
      const catalog = (await res.json()) as DevicesCatalog;
      const envelope: CacheEnvelope = { fetched_at: Date.now(), catalog };
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(envelope)).catch(() => {});
      return catalog;
    }
  } catch {
    // network failure — fall through to bundled
  }

  // 3. Last resort: bundled JSON
  return bundledCatalog as DevicesCatalog;
}
