import { Pressable, View } from "react-native";
import { MonoText } from "./MonoText";
import type { Device } from "@/types/Device";

interface DeviceCardProps {
  device: Device;
  onPress?: (device: Device) => void;
}

export function DeviceCard({ device, onPress }: DeviceCardProps) {
  const forks = device.firmware.length;
  const flashable = device.firmware.some((f) => f.flashable_in_browser);

  return (
    <Pressable
      onPress={() => onPress?.(device)}
      className="border border-terminal-border bg-terminal-surface px-4 py-3 active:bg-terminal-border"
    >
      <View className="flex-row items-baseline justify-between">
        <MonoText className="text-terminal-green text-base font-bold">
          {device.name}
        </MonoText>
        <MonoText className="text-terminal-muted text-xs">
          {device.manufacturer}
        </MonoText>
      </View>

      <MonoText className="text-terminal-muted text-xs mt-2">
        {device.description}
      </MonoText>

      <View className="flex-row items-center mt-2 flex-wrap">
        <MonoText className="text-terminal-amber text-xs mr-3">
          {device.category.toUpperCase()}
        </MonoText>
        <MonoText className="text-terminal-muted text-xs mr-3">
          {forks} fork{forks === 1 ? "" : "s"}
        </MonoText>
        {flashable && (
          <MonoText className="text-terminal-green text-xs">
            [FLASHABLE]
          </MonoText>
        )}
      </View>
    </Pressable>
  );
}
