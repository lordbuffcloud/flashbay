import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContentWidth } from "@/hooks/useLayout";

interface ScreenShellProps {
  children: ReactNode;
  /** Include bottom safe area (tab bar / home indicator). Default true. */
  edges?: ("top" | "bottom")[];
  style?: ViewStyle;
}

export function ScreenShell({
  children,
  edges = ["top", "bottom"],
  style,
}: ScreenShellProps) {
  const contentWidth = useContentWidth();

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#000000" }, style]}
      edges={edges}
    >
      <View className="flex-1 bg-terminal-black items-center">
        <View
          style={{
            flex: 1,
            width: contentWidth,
            maxWidth: "100%",
          }}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}
