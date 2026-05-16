import { FlatList, RefreshControl, TextInput, View } from "react-native";
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
import type { Device } from "@/types/Device";

export default function SearchScreen() {
  const { catalog, loading, error, refresh } = useDevices();
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [category, setCategory] = useState<string>("all");

  const results = useFilteredDevices(catalog?.devices, { query, category });

  function handleDevicePress(device: Device) {
    router.push({ pathname: "/device/[id]", params: { id: device.id } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={["top"]}>
      <View className="flex-1 bg-terminal-black">
        <View className="border-b border-terminal-border px-4 py-3">
          <View className="flex-row items-center">
            <MonoText className="text-terminal-green text-base mr-2">{">"}</MonoText>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="SEARCH NAME / MANUFACTURER / FORK / TAG"
              placeholderTextColor="#3F3F3F"
              autoCapitalize="characters"
              autoCorrect={false}
              className="flex-1 text-terminal-text font-mono text-sm"
            />
            {query.length > 0 && (
              <MonoText
                onPress={() => setQuery("")}
                className="text-terminal-amber text-xs ml-2"
              >
                [×]
              </MonoText>
            )}
          </View>
        </View>

        <CategoryChips active={category} onChange={setCategory} />

        {error ? (
          <ErrorState onRetry={refresh} />
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
                refreshing={loading}
                onRefresh={refresh}
                tintColor="#39FF14"
                colors={["#39FF14"]}
              />
            }
            ListHeaderComponent={
              <View className="pb-3">
                <MonoText className="text-terminal-muted text-xs">
                  {results.length} of {catalog?.devices.length ?? 0} devices
                </MonoText>
              </View>
            }
            ListEmptyComponent={
              loading ? (
                <View className="py-12 items-center">
                  <MonoText className="text-terminal-muted text-xs">
                    LOADING CATALOG…
                  </MonoText>
                </View>
              ) : (
                <EmptyState label="NO MATCHES" />
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
