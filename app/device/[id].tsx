import { useLocalSearchParams, Stack } from "expo-router";
import { FlatList, Platform, Pressable, ScrollView, View } from "react-native";
import { useMemo } from "react";
import { useDevices } from "@/hooks/useDevices";
import { FirmwareRow } from "@/components/FirmwareRow";
import { MonoText } from "@/components/MonoText";
import { ErrorState } from "@/components/ErrorState";
import { openExternal } from "@/lib/openExternal";

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalog, loading, error, refresh } = useDevices();

  const device = useMemo(
    () => catalog?.devices.find((d) => d.id === id),
    [catalog, id],
  );

  if (loading) {
    return (
      <View className="flex-1 bg-terminal-black items-center justify-center">
        <Stack.Screen options={{ title: "LOADING…" }} />
        <MonoText className="text-terminal-muted text-xs">LOADING…</MonoText>
      </View>
    );
  }

  if (error || !device) {
    return (
      <View className="flex-1 bg-terminal-black">
        <Stack.Screen options={{ title: "NOT FOUND" }} />
        <ErrorState
          label={error ? "CATALOG FETCH FAILED" : "DEVICE NOT FOUND"}
          onRetry={error ? refresh : undefined}
        />
      </View>
    );
  }

  const mobileFlashHint = device.firmware.some(
    (f) => f.flashable_in_browser && f.flash_url,
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
          <DeviceHeader
            device={device}
            mobileFlashHint={mobileFlashHint}
          />
        }
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      />
    </View>
  );
}

interface DeviceHeaderProps {
  device: NonNullable<ReturnType<typeof useDevices>["catalog"]>["devices"][number];
  mobileFlashHint: boolean;
}

function DeviceHeader({ device, mobileFlashHint }: DeviceHeaderProps) {
  const isMobile = Platform.OS !== "web";

  return (
    <View className="mb-4">
      <View className="flex-row items-baseline justify-between">
        <MonoText className="text-terminal-green text-lg font-bold">
          {device.name}
        </MonoText>
        <MonoText className="text-terminal-muted text-xs">
          {device.manufacturer}
        </MonoText>
      </View>

      <View className="flex-row flex-wrap mt-2">
        <MonoText className="text-terminal-amber text-xs mr-3">
          {device.category.toUpperCase()}
        </MonoText>
        {device.tags.map((tag) => (
          <MonoText key={tag} className="text-terminal-muted text-xs mr-3">
            #{tag}
          </MonoText>
        ))}
      </View>

      <MonoText className="text-terminal-text text-sm mt-3">
        {device.description}
      </MonoText>

      <Pressable
        onPress={() => openExternal(device.url)}
        className="mt-3 self-start border border-terminal-green px-3 py-2 active:bg-terminal-border"
      >
        <MonoText className="text-terminal-green text-xs">
          [ VENDOR PAGE → ]
        </MonoText>
      </Pressable>

      {isMobile && mobileFlashHint && (
        <View className="mt-4 border border-terminal-amber px-4 py-3">
          <MonoText className="text-terminal-amber text-xs">
            [ FLASH ON DESKTOP ]
          </MonoText>
          <MonoText className="text-terminal-muted text-xs mt-2">
            Some firmware here supports in-browser flashing. Open this device page on a
            desktop browser (Chrome / Edge) to flash:
          </MonoText>
          <MonoText className="text-terminal-text text-xs mt-2">
            https://flashbay.ck42x.com/device/{device.id}
          </MonoText>
        </View>
      )}

      <View className="h-px bg-terminal-border mt-4" />
      <MonoText className="text-terminal-muted text-xs uppercase mt-4 mb-2">
        Firmware ({device.firmware.length})
      </MonoText>
    </View>
  );
}
