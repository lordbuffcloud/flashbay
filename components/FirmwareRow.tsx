import { Platform, Pressable, View } from "react-native";
import { MonoText } from "./MonoText";
import { openExternal } from "@/lib/openExternal";
import { cn } from "@/lib/cn";
import { formatRelativeVerified } from "@/lib/deviceHelpers";
import type { Firmware } from "@/types/Device";

interface FirmwareRowProps {
  firmware: Firmware;
}

export function FirmwareRow({ firmware }: FirmwareRowProps) {
  const isStock = firmware.fork === "stock";
  const isArchived = firmware.archived === true;
  const isLowConf = firmware.confidence === "LOW";
  const forkColor = isStock ? "text-terminal-green" : "text-terminal-amber";
  const verifiedLabel = formatRelativeVerified(firmware.last_verified_at);
  const canFlashHere =
    !isArchived &&
    firmware.flashable_in_browser &&
    Platform.OS === "web" &&
    !!firmware.flash_url;

  const surfaceClass = isArchived
    ? "border border-terminal-border bg-terminal-black px-4 py-3 opacity-50"
    : "border border-terminal-border bg-terminal-surface px-4 py-3";

  return (
    <View className={surfaceClass}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap gap-x-2 gap-y-1">
            <MonoText className={cn("text-[10px] uppercase tracking-wide", forkColor)}>
              {firmware.fork}
            </MonoText>
            {isArchived && (
              <MonoText className="text-terminal-muted text-[10px] uppercase">archived</MonoText>
            )}
            {isLowConf && !isArchived && (
              <MonoText className="text-terminal-amber text-[10px] uppercase">unverified</MonoText>
            )}
          </View>
          <MonoText className="text-terminal-text text-base font-bold mt-1">
            {firmware.name}
          </MonoText>
        </View>
        <View className="items-end">
          <MonoText className="text-terminal-green text-xs font-bold">{firmware.version}</MonoText>
          <MonoText className="text-terminal-muted text-[10px] mt-1">{firmware.release_date}</MonoText>
        </View>
      </View>

      {verifiedLabel && (
        <MonoText className="text-terminal-muted text-[10px] mt-2">{verifiedLabel}</MonoText>
      )}

      <MonoText className="text-terminal-text text-xs mt-2 leading-5">{firmware.notes}</MonoText>

      {!isArchived && (
        <View className="flex-row flex-wrap mt-3 gap-2">
          <Pressable
            onPress={() => openExternal(firmware.url)}
            className="border border-terminal-green px-4 py-3 min-h-[44px] justify-center active:bg-terminal-border"
          >
            <MonoText className="text-terminal-green text-xs font-bold">Download</MonoText>
          </Pressable>

          {canFlashHere ? (
            <Pressable
              onPress={() => firmware.flash_url && openExternal(firmware.flash_url)}
              className="border border-terminal-amber px-4 py-3 min-h-[44px] justify-center active:bg-terminal-border"
            >
              <MonoText className="text-terminal-amber text-xs font-bold">Flash in browser</MonoText>
            </Pressable>
          ) : firmware.flashable_in_browser && firmware.flash_url ? (
            <View className="border border-terminal-border px-4 py-3 min-h-[44px] justify-center">
              <MonoText className="text-terminal-muted text-xs">Flash on desktop</MonoText>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
