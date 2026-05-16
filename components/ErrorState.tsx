import { Image, Pressable, View } from "react-native";
import { MonoText } from "./MonoText";
import { images } from "@/constants/images";

interface ErrorStateProps {
  label?: string;
  onRetry?: () => void;
}

export function ErrorState({ label = "CATALOG FETCH FAILED", onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Image
        source={images.stateError}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
      <MonoText className="text-terminal-amber text-sm mt-4">{label}</MonoText>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-4 border border-terminal-amber px-4 py-2 active:bg-terminal-border"
        >
          <MonoText className="text-terminal-amber text-xs">[ RETRY ]</MonoText>
        </Pressable>
      )}
    </View>
  );
}
