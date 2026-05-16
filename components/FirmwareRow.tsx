import { Platform, Pressable, View } from "react-native";
import { MonoText } from "./MonoText";
import { openExternal } from "@/lib/openExternal";
import { cn } from "@/lib/cn";
import type { Firmware } from "@/types/Device";

interface FirmwareRowProps {
  firmware: Firmware;
}

export function FirmwareRow({ firmware }: FirmwareRowProps) {
  const isStock = firmware.fork === "stock";
  const forkColor = isStock ? "text-terminal-green" : "text-terminal-amber";
  const canFlashHere =
    firmware.flashable_in_browser && Platform.OS === "web" && !!firmware.flash_url;

  return (
    <View className="border border-terminal-border bg-terminal-surface px-4 py-3">
      <View className="flex-row items-baseline justify-between">
        <View className="flex-row items-baseline">
          <MonoText className={cn("text-xs uppercase mr-2", forkColor)}>
            [{firmware.fork.toUpperCase()}]
          </MonoText>
          <MonoText className="text-terminal-text text-base font-bold">
            {firmware.name}
          </MonoText>
        </View>
        <MonoText className="text-terminal-muted text-xs">{firmware.version}</MonoText>
      </View>

      <MonoText className="text-terminal-muted text-xs mt-1">
        {firmware.release_date}
      </MonoText>

      <MonoText className="text-terminal-text text-xs mt-2">{firmware.notes}</MonoText>

      <View className="flex-row mt-3">
        <Pressable
          onPress={() => openExternal(firmware.url)}
          className="border border-terminal-green px-3 py-2 mr-2 active:bg-terminal-border"
        >
          <MonoText className="text-terminal-green text-xs">[ DOWNLOAD → ]</MonoText>
        </Pressable>

        {canFlashHere ? (
          <Pressable
            onPress={() => firmware.flash_url && openExternal(firmware.flash_url)}
            className="border border-terminal-amber px-3 py-2 active:bg-terminal-border"
          >
            <MonoText className="text-terminal-amber text-xs">[ FLASH → ]</MonoText>
          </Pressable>
        ) : firmware.flashable_in_browser && firmware.flash_url ? (
          <View className="border border-terminal-border px-3 py-2">
            <MonoText className="text-terminal-muted text-xs">
              [ FLASH ON DESKTOP ]
            </MonoText>
          </View>
        ) : null}
      </View>
    </View>
  );
}
