import { useEffect, useState } from "react";
import { fetchDevices } from "@/lib/fetchDevices";
import type { DevicesCatalog } from "@/types/Device";

interface UseDevicesResult {
  catalog: DevicesCatalog | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDevices(): UseDevicesResult {
  const [catalog, setCatalog] = useState<DevicesCatalog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDevices();
      setCatalog(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { catalog, loading, error, refresh: load };
}
