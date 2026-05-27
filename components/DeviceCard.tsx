import { Pressable, View } from "react-native";
import { MonoText } from "./MonoText";
import {
  formatCategoryLabel,
  formatDeviceStatus,
  getActiveFirmware,
  getLatestFirmware,
} from "@/lib/deviceHelpers";
import { useIsCompact } from "@/hooks/useLayout";
import type { Device } from "@/types/Device";

interface DeviceCardProps {
  device: Device;
  onPress?: (device: Device) => void;
}

export function DeviceCard({ device, onPress }: DeviceCardProps) {
  const compact = useIsCompact();
  const activeFirmware = getActiveFirmware(device);
  const latest = getLatestFirmware(device);
  const flashable = activeFirmware.some((f) => f.flashable_in_browser && f.flash_url);
  const hasLowConfidence = activeFirmware.some((f) => f.confidence === "LOW");
  const statusLabel = formatDeviceStatus(device.status);

  return (
    <Pressable
      onPress={() => onPress?.(device)}
      className="border border-terminal-border bg-terminal-surface px-4 py-4 active:border-terminal-green min-h-[88px]"
      accessibilityRole="button"
    >
      <View
        className={compact ? "gap-2" : "flex-row items-start justify-between gap-3"}
      >
        <View className="flex-1 min-w-0">
          <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <MonoText className="text-terminal-green text-base font-bold flex-shrink">
              {device.name}
            </MonoText>
            {statusLabel && (
              <View className="border border-terminal-amber px-2 py-0.5">
                <MonoText className="text-terminal-amber text-[10px] font-bold">
                  {statusLabel}
                </MonoText>
              </View>
            )}
          </View>
          <MonoText className="text-terminal-muted text-xs mt-1" numberOfLines={1}>
            {device.manufacturer}
          </MonoText>
        </View>

        <View className={compact ? "flex-row flex-wrap items-center gap-2" : "items-end shrink-0"}>
          <View className="border border-terminal-border px-2 py-1">
            <MonoText className="text-terminal-amber text-[10px] tracking-wide">
              {formatCategoryLabel(device.category)}
            </MonoText>
          </View>
          {latest && (
            <MonoText
              className="text-terminal-text text-xs font-bold"
              numberOfLines={compact ? 2 : 1}
            >
              {latest.name} · {latest.version}
            </MonoText>
          )}
        </View>
      </View>

      <MonoText className="text-terminal-muted text-xs mt-2 leading-5" numberOfLines={3}>
        {device.description}
      </MonoText>

      <View className="flex-row items-center mt-3 flex-wrap gap-2">
        <MonoText className="text-terminal-muted text-xs">
          {activeFirmware.length} fork{activeFirmware.length === 1 ? "" : "s"}
        </MonoText>
        {flashable && (
          <MonoText className="text-terminal-green text-xs">web flash</MonoText>
        )}
        {hasLowConfidence && (
          <MonoText className="text-terminal-amber text-xs">needs verify</MonoText>
        )}
        <MonoText className="text-terminal-muted text-xs ml-auto">open →</MonoText>
      </View>
    </Pressable>
  );
}
