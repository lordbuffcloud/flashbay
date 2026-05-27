import { TextInput, View } from "react-native";
import { MonoText } from "./MonoText";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search devices, forks, tags…",
}: SearchBarProps) {
  return (
    <View className="border border-terminal-border bg-terminal-surface px-3 py-3 flex-row items-center min-h-[48px]">
      <MonoText className="text-terminal-green text-sm mr-2">/</MonoText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#5A5A5A"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 text-terminal-text font-mono text-base py-0 min-h-[24px]"
        style={{ outlineStyle: "none" } as object}
      />
      {value.length > 0 && (
        <PressableClear onPress={() => onChangeText("")} />
      )}
    </View>
  );
}

function PressableClear({ onPress }: { onPress: () => void }) {
  return (
    <View className="ml-2 px-2 py-2 min-h-[36px] min-w-[36px] items-center justify-center">
      <MonoText onPress={onPress} className="text-terminal-amber text-xs">
        clear
      </MonoText>
    </View>
  );
}
