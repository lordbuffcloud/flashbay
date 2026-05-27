import { FlatList, Image, Platform, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useDevices } from "@/hooks/useDevices";
import { useFilteredDevices } from "@/hooks/useFilteredDevices";
import { DeviceCard } from "@/components/DeviceCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { MonoText } from "@/components/MonoText";
import { CategoryChips } from "@/components/CategoryChips";
import { SearchBar } from "@/components/SearchBar";
import { CatalogStats } from "@/components/CatalogStats";
import { ScreenShell } from "@/components/ScreenShell";
import { openExternal } from "@/lib/openExternal";
import { useIsCompact } from "@/hooks/useLayout";
import { images } from "@/constants/images";
import type { Device } from "@/types/Device";

const SUBMIT_URL =
  "https://github.com/lordbuffcloud/flashbay/issues/new?template=firmware-submission.yml";

export default function DeviceBrowseScreen() {
  const { catalog, syncing, error, refresh } = useDevices();
  const router = useRouter();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const devices = useFilteredDevices(catalog.devices, { category, query });

  function handleDevicePress(device: Device) {
    router.push({ pathname: "/device/[id]", params: { id: device.id } });
  }

  return (
    <ScreenShell edges={["top", "bottom"]}>
      <View className="flex-1">
        <Header />
        <View className="px-3 pt-3 pb-1 gap-2">
          <SearchBar value={query} onChangeText={setQuery} />
          <CatalogStats catalog={catalog} visibleCount={devices.length} syncing={syncing} />
        </View>
        <CategoryChips active={category} onChange={setCategory} />
        {error ? (
          <ErrorState label="Remote sync failed — showing bundled catalog" onRetry={refresh} />
        ) : (
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DeviceCard device={item} onPress={handleDevicePress} />
            )}
            ItemSeparatorComponent={() => <View className="h-2" />}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={syncing}
                onRefresh={refresh}
                tintColor="#39FF14"
                colors={["#39FF14"]}
              />
            }
            ListEmptyComponent={<EmptyState label="NO MATCHING DEVICES" />}
          />
        )}
        <SubmitBar />
      </View>
    </ScreenShell>
  );
}

function Header() {
  const compact = useIsCompact();

  return (
    <View className="border-b border-terminal-border px-4 py-3 flex-row items-center justify-between gap-3">
      <Image
        source={images.wordmark}
        style={{ width: compact ? 140 : 160, height: compact ? 28 : 32, maxWidth: "70%" }}
        resizeMode="contain"
      />
      <MonoText className="text-terminal-muted text-xs shrink-0">
        {Platform.OS === "web" ? "WEB" : Platform.OS.toUpperCase()}
      </MonoText>
    </View>
  );
}

function SubmitBar() {
  return (
    <View className="border-t border-terminal-border px-4 py-3.5 bg-terminal-surface">
      <MonoText
        className="text-terminal-amber text-xs leading-5"
        onPress={() => openExternal(SUBMIT_URL)}
      >
        Submit firmware via GitHub issue →
      </MonoText>
    </View>
  );
}
