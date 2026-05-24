import { useCallback, useEffect, useState } from "react";
import { fetchDevices, getBundledCatalog } from "@/lib/fetchDevices";
import type { DevicesCatalog } from "@/types/Device";

interface UseDevicesResult {
  catalog: DevicesCatalog;
  syncing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDevices(): UseDevicesResult {
  const [catalog, setCatalog] = useState<DevicesCatalog>(() => getBundledCatalog());
  const [syncing, setSyncing] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await fetchDevices();
      setCatalog(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { catalog, syncing, error, refresh: load };
}
