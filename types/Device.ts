export type ForkType = "stock" | "community";

export type ReleaseTracking =
  | "tagged_releases"
  | "nightly_only"
  | "main_branch_only"
  | "vendor_portal"
  | "payload_compiler";

export interface Firmware {
  fork: ForkType;
  name: string;
  version: string;
  release_date: string;
  url: string;
  notes: string;
  flashable_in_browser: boolean;
  flash_url?: string;
  /** Marks a fork that is no longer maintained. Surface but mute. */
  archived?: boolean;
  /** How upstream publishes releases — affects "is this current?" semantics. */
  release_tracking?: ReleaseTracking;
  /** ISO-8601 of when this entry was last cross-checked against upstream. */
  last_verified_at?: string;
  /** Research-confidence tag from the verification pass. */
  confidence?: "HIGH" | "MED" | "LOW";
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
