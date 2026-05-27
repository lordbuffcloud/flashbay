import type { Device, Firmware } from "@/types/Device";

export function getActiveFirmware(device: Device): Firmware[] {
  return device.firmware.filter((f) => f.archived !== true);
}

export function getLatestFirmware(device: Device): Firmware | undefined {
  return [...getActiveFirmware(device)].sort((a, b) =>
    b.release_date.localeCompare(a.release_date),
  )[0];
}

export function countFlashableFirmware(devices: Device[]): number {
  return devices.reduce(
    (total, device) =>
      total +
      device.firmware.filter((f) => f.flashable_in_browser && f.flash_url && !f.archived)
        .length,
    0,
  );
}

export function countFirmwareEntries(devices: Device[]): number {
  return devices.reduce((total, device) => total + getActiveFirmware(device).length, 0);
}

export function formatCategoryLabel(category: string): string {
  return category.replace(/-/g, " ").toUpperCase();
}

export function formatDeviceStatus(status?: Device["status"]): string | null {
  switch (status) {
    case "coming_soon":
      return "COMING SOON";
    case "preorder":
      return "PREORDER";
    default:
      return null;
  }
}

export function formatRelativeVerified(date?: string): string | null {
  if (!date) return null;
  const verified = new Date(date);
  if (Number.isNaN(verified.getTime())) return null;

  const days = Math.floor((Date.now() - verified.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "verified today";
  if (days === 1) return "verified yesterday";
  if (days < 14) return `verified ${days}d ago`;
  return `verified ${date}`;
}
