import { FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import type { Device } from "@/types/Device";

export default function SearchScreen() {
  const { catalog, syncing, error, refresh } = useDevices();
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [category, setCategory] = useState<string>("all");

  const results = useFilteredDevices(catalog.devices, { query, category });

  function handleDevicePress(device: Device) {
    router.push({ pathname: "/device/[id]", params: { id: device.id } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <View className="flex-1 bg-terminal-black">
        <View className="border-b border-terminal-border px-4 py-3">
          <MonoText className="text-terminal-green text-base font-bold">Search catalog</MonoText>
          <MonoText className="text-terminal-muted text-xs mt-1">
            Match device names, manufacturers, fork names, or tags.
          </MonoText>
        </View>

        <View className="px-3 pt-3 pb-1 gap-2">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. flipper, bruce, sub-ghz, hak5…"
          />
          <CatalogStats catalog={catalog} visibleCount={results.length} syncing={syncing} />
        </View>

        <CategoryChips active={category} onChange={setCategory} />

        {error ? (
          <ErrorState label="Remote sync failed — showing bundled catalog" onRetry={refresh} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DeviceCard device={item} onPress={handleDevicePress} />
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
            ListEmptyComponent={<EmptyState label="NO MATCHES" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
