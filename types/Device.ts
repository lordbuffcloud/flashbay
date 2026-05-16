export type ForkType = "stock" | "community";

export interface Firmware {
  fork: ForkType;
  name: string;
  version: string;
  release_date: string;
  url: string;
  notes: string;
  flashable_in_browser: boolean;
  flash_url?: string;
}

export interface Device {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  tags: string[];
  description: string;
  url: string;
  firmware: Firmware[];
}

export interface DevicesCatalog {
  version: string;
  generated: string;
  license: string;
  submission_url: string;
  devices: Device[];
}
