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
    <View className="border border-terminal-border bg-terminal-surface px-3 py-2 flex-row items-center">
      <MonoText className="text-terminal-green text-sm mr-2">/</MonoText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#5A5A5A"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 text-terminal-text font-mono text-sm py-0"
      />
      {value.length > 0 && (
        <MonoText
          onPress={() => onChangeText("")}
          className="text-terminal-amber text-xs ml-2 px-1"
        >
          clear
        </MonoText>
      )}
    </View>
  );
}
