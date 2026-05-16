import { Image, View } from "react-native";
import { MonoText } from "./MonoText";
import { images } from "@/constants/images";

interface EmptyStateProps {
  label?: string;
}

export function EmptyState({ label = "NO DEVICES FOUND" }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Image
        source={images.stateEmpty}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
      <MonoText className="text-terminal-muted text-sm mt-4">{label}</MonoText>
    </View>
  );
}
