import { Pressable, View } from "react-native";
import { MonoText } from "./MonoText";
import {
  formatCategoryLabel,
  getActiveFirmware,
  getLatestFirmware,
} from "@/lib/deviceHelpers";
import type { Device } from "@/types/Device";

interface DeviceCardProps {
  device: Device;
  onPress?: (device: Device) => void;
}

export function DeviceCard({ device, onPress }: DeviceCardProps) {
  const activeFirmware = getActiveFirmware(device);
  const latest = getLatestFirmware(device);
  const flashable = activeFirmware.some((f) => f.flashable_in_browser && f.flash_url);
  const hasLowConfidence = activeFirmware.some((f) => f.confidence === "LOW");

  return (
    <Pressable
      onPress={() => onPress?.(device)}
      className="border border-terminal-border bg-terminal-surface px-4 py-3 active:border-terminal-green"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <MonoText className="text-terminal-green text-base font-bold">
            {device.name}
          </MonoText>
          <MonoText className="text-terminal-muted text-xs mt-1">
            {device.manufacturer}
          </MonoText>
        </View>
        <View className="items-end">
          <MonoText className="text-terminal-amber text-[10px] tracking-wide">
            {formatCategoryLabel(device.category)}
          </MonoText>
          {latest && (
            <MonoText className="text-terminal-text text-xs mt-1 font-bold">
              {latest.name} · {latest.version}
            </MonoText>
          )}
        </View>
      </View>

      <MonoText className="text-terminal-muted text-xs mt-2 leading-5" numberOfLines={2}>
        {device.description}
      </MonoText>

      <View className="flex-row items-center mt-3 flex-wrap gap-x-3 gap-y-1">
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
