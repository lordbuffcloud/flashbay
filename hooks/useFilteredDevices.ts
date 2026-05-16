import { useMemo } from "react";
import type { Device } from "@/types/Device";

interface FilterOptions {
  query?: string;
  category?: string;
}

export function useFilteredDevices(
  devices: Device[] | undefined,
  { query = "", category = "all" }: FilterOptions,
): Device[] {
  return useMemo(() => {
    if (!devices) return [];
    const q = query.trim().toLowerCase();
    return devices.filter((device) => {
      if (category !== "all" && device.category !== category) return false;
      if (!q) return true;
      if (device.name.toLowerCase().includes(q)) return true;
      if (device.manufacturer.toLowerCase().includes(q)) return true;
      if (device.tags.some((t) => t.toLowerCase().includes(q))) return true;
      if (device.firmware.some((f) => f.name.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [devices, query, category]);
}
