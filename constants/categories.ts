export interface Category {
  id: string;
  label: string;
}

export const ALL_CATEGORY: Category = { id: "all", label: "ALL" };

export const DEVICE_CATEGORIES: readonly Category[] = [
  ALL_CATEGORY,
  { id: "multi-tool", label: "MULTI-TOOL" },
  { id: "sdr", label: "SDR" },
  { id: "rfid-nfc", label: "RFID / NFC" },
  { id: "wifi", label: "WIFI" },
  { id: "badusb", label: "BADUSB" },
  { id: "implant", label: "IMPLANT" },
  { id: "esp32", label: "ESP32" },
  { id: "flipper-accessory", label: "FLIPPER ACC." },
] as const;
