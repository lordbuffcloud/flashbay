import { View } from "react-native";
import { MonoText } from "./MonoText";
import {
  countFirmwareEntries,
  countFlashableFirmware,
} from "@/lib/deviceHelpers";
import type { DevicesCatalog } from "@/types/Device";

interface CatalogStatsProps {
  catalog: DevicesCatalog;
  visibleCount?: number;
  syncing?: boolean;
}

export function CatalogStats({ catalog, visibleCount, syncing }: CatalogStatsProps) {
  const deviceCount = catalog.devices.length;
  const firmwareCount = countFirmwareEntries(catalog.devices);
  const flashableCount = countFlashableFirmware(catalog.devices);
  const generated = catalog.generated.slice(0, 10);

  return (
    <View className="border border-terminal-border bg-terminal-surface px-3 py-2.5">
      <View className="flex-row flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <MonoText className="text-terminal-muted text-xs flex-shrink">
          catalog v{catalog.version}
          {syncing ? " · syncing…" : ` · updated ${generated}`}
        </MonoText>
        {typeof visibleCount === "number" && visibleCount !== deviceCount && (
          <MonoText className="text-terminal-amber text-xs">{visibleCount} shown</MonoText>
        )}
      </View>
      <MonoText className="text-terminal-text text-xs mt-1.5 leading-5">
        {deviceCount} devices · {firmwareCount} firmware · {flashableCount} web-flashable
      </MonoText>
    </View>
  );
}
