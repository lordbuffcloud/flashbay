import { FlatList, Platform, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useDevices } from "@/hooks/useDevices";
import { MonoText } from "@/components/MonoText";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { openExternal } from "@/lib/openExternal";
import { formatCategoryLabel } from "@/lib/deviceHelpers";
import type { Device, Firmware } from "@/types/Device";

interface FlashableEntry {
  device: Device;
  firmware: Firmware;
}

export default function FlashWizardScreen() {
  const { catalog, syncing, error, refresh } = useDevices();
  const isWeb = Platform.OS === "web";

  const flashables = useMemo<FlashableEntry[]>(() => {
    const out: FlashableEntry[] = [];
    for (const device of catalog.devices) {
      for (const firmware of device.firmware) {
        if (firmware.flashable_in_browser && firmware.flash_url && !firmware.archived) {
          out.push({ device, firmware });
        }
      }
    }
    return out.sort((a, b) => a.device.name.localeCompare(b.device.name));
  }, [catalog]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <View className="flex-1 bg-terminal-black">
        <Header isWeb={isWeb} count={flashables.length} />
        {error ? (
          <ErrorState label="Remote sync failed — showing bundled catalog" onRetry={refresh} />
        ) : (
          <FlatList
            data={flashables}
            keyExtractor={(item) =>
              `${item.device.id}::${item.firmware.fork}::${item.firmware.name}`
            }
            renderItem={({ item }) => (
              <FlashableRow entry={item} canFlashHere={isWeb} />
            )}
            ItemSeparatorComponent={() => <View className="h-2" />}
            contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={syncing}
                onRefresh={refresh}
                tintColor="#39FF14"
                colors={["#39FF14"]}
              />
            }
            ListEmptyComponent={<EmptyState label="NO FLASHABLE FIRMWARE" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

interface HeaderProps {
  isWeb: boolean;
  count: number;
}

function Header({ isWeb, count }: HeaderProps) {
  return (
    <View className="border-b border-terminal-border px-4 py-3">
      <View className="flex-row items-baseline justify-between">
        <MonoText className="text-terminal-green text-base font-bold">Flash wizard</MonoText>
        <MonoText className="text-terminal-muted text-xs">{count} ready</MonoText>
      </View>
      <MonoText className="text-terminal-muted text-xs mt-2 leading-5">
        {isWeb
          ? "Launch external flashers via WebUSB / WebSerial. Use Chrome or Edge on desktop."
          : "Browse flash targets here. Open flashbay on a desktop browser to run in-browser installers."}
      </MonoText>
    </View>
  );
}

interface FlashableRowProps {
  entry: FlashableEntry;
  canFlashHere: boolean;
}

function FlashableRow({ entry, canFlashHere }: FlashableRowProps) {
  const { device, firmware } = entry;
  const desktopUrl = firmware.flash_url ?? "";

  function copyDesktopHint() {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(desktopUrl).catch(() => {});
    }
  }

  return (
    <View className="border border-terminal-border bg-terminal-surface px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <MonoText className="text-terminal-green text-base font-bold">{device.name}</MonoText>
          <MonoText className="text-terminal-muted text-xs mt-1">
            {formatCategoryLabel(device.category)}
          </MonoText>
        </View>
        <MonoText className="text-terminal-amber text-[10px] uppercase">{firmware.fork}</MonoText>
      </View>

      <MonoText className="text-terminal-text text-sm mt-2">
        {firmware.name}{" "}
        <MonoText className="text-terminal-green text-sm">{firmware.version}</MonoText>
      </MonoText>

      <MonoText className="text-terminal-muted text-xs mt-2 leading-5" numberOfLines={3}>
        {firmware.notes}
      </MonoText>

      <View className="flex-row flex-wrap items-center mt-3 gap-2">
        {canFlashHere ? (
          <Pressable
            onPress={() => openExternal(desktopUrl)}
            className="border border-terminal-green px-3 py-2 active:bg-terminal-border"
          >
            <MonoText className="text-terminal-green text-xs">Launch flasher</MonoText>
          </Pressable>
        ) : (
          <Pressable
            onPress={copyDesktopHint}
            className="border border-terminal-amber px-3 py-2 active:bg-terminal-border"
          >
            <MonoText className="text-terminal-amber text-xs">Copy flasher URL</MonoText>
          </Pressable>
        )}
        <Pressable
          onPress={() => openExternal(firmware.url)}
          className="border border-terminal-border px-3 py-2 active:bg-terminal-border"
        >
          <MonoText className="text-terminal-muted text-xs">Release page</MonoText>
        </Pressable>
      </View>

      {!canFlashHere && (
        <MonoText className="text-terminal-muted text-[10px] mt-2">{desktopUrl}</MonoText>
      )}
    </View>
  );
}
