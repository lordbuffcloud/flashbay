import { FlatList, Image, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useDevices } from "@/hooks/useDevices";
import { MonoText } from "@/components/MonoText";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { openExternal } from "@/lib/openExternal";
import { images } from "@/constants/images";
import type { Device, Firmware } from "@/types/Device";

interface FlashableEntry {
  device: Device;
  firmware: Firmware;
}

/**
 * Flash Wizard — central launchpad for in-browser firmware flashing.
 *
 * v1 (this commit):
 *   - Lists every firmware in the catalog with `flashable_in_browser: true`
 *   - Web: launches the firmware's external flasher in a new tab
 *   - Mobile: shows "flash on desktop" handoff with copyable URL
 *
 * v1.x (planned):
 *   - For ESP32 firmware without an external flasher (e.g. Marauder build that ships
 *     just the .bin), run esptool-js in-app for direct WebSerial flashing.
 *   - For Nyanbee + flashers Cris owns, optionally embed-style flash steps inline
 *     instead of redirecting out.
 */
export default function FlashWizardScreen() {
  const { catalog, loading, error, refresh } = useDevices();
  const isWeb = Platform.OS === "web";

  const flashables = useMemo<FlashableEntry[]>(() => {
    if (!catalog) return [];
    const out: FlashableEntry[] = [];
    for (const device of catalog.devices) {
      for (const firmware of device.firmware) {
        if (firmware.flashable_in_browser && firmware.flash_url) {
          out.push({ device, firmware });
        }
      }
    }
    return out;
  }, [catalog]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <View className="flex-1 bg-terminal-black">
        <Header isWeb={isWeb} count={flashables.length} />
        {error ? (
          <ErrorState onRetry={refresh} />
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
            ListEmptyComponent={
              loading ? (
                <View className="py-12 items-center">
                  <MonoText className="text-terminal-muted text-xs">
                    LOADING CATALOG…
                  </MonoText>
                </View>
              ) : (
                <EmptyState label="NO FLASHABLE FIRMWARE" />
              )
            }
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
        <MonoText className="text-terminal-green text-base font-bold">
          FLASH WIZARD
        </MonoText>
        <MonoText className="text-terminal-muted text-xs">
          {count} READY
        </MonoText>
      </View>
      <MonoText className="text-terminal-muted text-xs mt-1">
        {isWeb
          ? "WebUSB / WebSerial supported on Chrome + Edge. Connect device, launch flasher."
          : "Mobile is browse-only. Open this page on a desktop browser to flash."}
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
      <View className="flex-row items-baseline justify-between">
        <MonoText className="text-terminal-green text-base font-bold">
          {device.name}
        </MonoText>
        <MonoText className="text-terminal-amber text-xs uppercase">
          [{firmware.fork.toUpperCase()}]
        </MonoText>
      </View>
      <MonoText className="text-terminal-text text-sm mt-1">
        {firmware.name}{" "}
        <MonoText className="text-terminal-muted">v{firmware.version}</MonoText>
      </MonoText>
      <MonoText className="text-terminal-muted text-xs mt-2">
        {firmware.notes}
      </MonoText>

      <View className="flex-row items-center mt-3">
        {canFlashHere ? (
          <Pressable
            onPress={() => openExternal(desktopUrl)}
            className="border border-terminal-green px-3 py-2 mr-2 active:bg-terminal-border"
          >
            <MonoText className="text-terminal-green text-xs">
              [ LAUNCH FLASHER → ]
            </MonoText>
          </Pressable>
        ) : (
          <Pressable
            onPress={copyDesktopHint}
            className="border border-terminal-amber px-3 py-2 mr-2 active:bg-terminal-border"
          >
            <MonoText className="text-terminal-amber text-xs">
              [ COPY DESKTOP URL ]
            </MonoText>
          </Pressable>
        )}
      </View>

      {!canFlashHere && (
        <MonoText className="text-terminal-muted text-xs mt-2">
          {desktopUrl}
        </MonoText>
      )}
    </View>
  );
}
