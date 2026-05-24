import { useLocalSearchParams, Stack } from "expo-router";
import { FlatList, Platform, Pressable, View } from "react-native";
import { useMemo } from "react";
import { useDevices } from "@/hooks/useDevices";
import { FirmwareRow } from "@/components/FirmwareRow";
import { MonoText } from "@/components/MonoText";
import { ErrorState } from "@/components/ErrorState";
import { formatCategoryLabel, getActiveFirmware } from "@/lib/deviceHelpers";
import { openExternal } from "@/lib/openExternal";
import type { Device } from "@/types/Device";

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalog, syncing, error, refresh } = useDevices();

  const device = useMemo(() => {
    const found = catalog.devices.find((d) => d.id === id);
    if (!found) return undefined;
    const sorted = [...found.firmware].sort((a, b) => {
      if (a.archived === true && b.archived !== true) return 1;
      if (b.archived === true && a.archived !== true) return -1;
      return b.release_date.localeCompare(a.release_date);
    });
    return { ...found, firmware: sorted };
  }, [catalog, id]);

  if (!device && !syncing) {
    return (
      <View className="flex-1 bg-terminal-black">
        <Stack.Screen options={{ title: "Not found" }} />
        <ErrorState
          label={error ? "Catalog sync failed" : "Device not found"}
          onRetry={error ? refresh : undefined}
        />
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 bg-terminal-black items-center justify-center">
        <Stack.Screen options={{ title: "Loading…" }} />
        <MonoText className="text-terminal-muted text-xs">Loading device…</MonoText>
      </View>
    );
  }

  const activeCount = getActiveFirmware(device).length;
  const mobileFlashHint = device.firmware.some(
    (f) => f.flashable_in_browser && f.flash_url && !f.archived,
  );

  return (
    <View className="flex-1 bg-terminal-black">
      <Stack.Screen options={{ title: device.name }} />
      <FlatList
        data={device.firmware}
        keyExtractor={(item) => `${item.fork}-${item.name}-${item.version}`}
        renderItem={({ item }) => <FirmwareRow firmware={item} />}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListHeaderComponent={
          <DeviceHeader device={device} activeCount={activeCount} mobileFlashHint={mobileFlashHint} />
        }
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      />
    </View>
  );
}

interface DeviceHeaderProps {
  device: Device;
  activeCount: number;
  mobileFlashHint: boolean;
}

function DeviceHeader({ device, activeCount, mobileFlashHint }: DeviceHeaderProps) {
  const isMobile = Platform.OS !== "web";

  return (
    <View className="mb-4">
      <MonoText className="text-terminal-green text-xl font-bold">{device.name}</MonoText>
      <MonoText className="text-terminal-muted text-sm mt-1">{device.manufacturer}</MonoText>

      <View className="flex-row flex-wrap mt-3 gap-2">
        <View className="border border-terminal-amber px-2 py-1">
          <MonoText className="text-terminal-amber text-[10px]">
            {formatCategoryLabel(device.category)}
          </MonoText>
        </View>
        {device.tags.slice(0, 6).map((tag) => (
          <View key={tag} className="border border-terminal-border px-2 py-1">
            <MonoText className="text-terminal-muted text-[10px]">{tag}</MonoText>
          </View>
        ))}
      </View>

      <MonoText className="text-terminal-text text-sm mt-4 leading-6">{device.description}</MonoText>

      <Pressable
        onPress={() => openExternal(device.url)}
        className="mt-4 self-start border border-terminal-green px-3 py-2 active:bg-terminal-border"
      >
        <MonoText className="text-terminal-green text-xs">Vendor / project page →</MonoText>
      </Pressable>

      {isMobile && mobileFlashHint && (
        <View className="mt-4 border border-terminal-amber bg-terminal-surface px-4 py-3">
          <MonoText className="text-terminal-amber text-xs font-bold">Flash on desktop</MonoText>
          <MonoText className="text-terminal-muted text-xs mt-2 leading-5">
            Some firmware supports in-browser flashing. Open this page in Chrome or Edge on a desktop:
          </MonoText>
          <MonoText className="text-terminal-text text-xs mt-2">
            https://flashbay.ck42x.com/device/{device.id}
          </MonoText>
        </View>
      )}

      <View className="h-px bg-terminal-border mt-5" />
      <MonoText className="text-terminal-muted text-xs mt-4 mb-2">
        Firmware · {activeCount} active · {device.firmware.length} total
      </MonoText>
    </View>
  );
}
