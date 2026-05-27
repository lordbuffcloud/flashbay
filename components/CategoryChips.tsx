import { Pressable, ScrollView, View } from "react-native";
import { MonoText } from "./MonoText";
import { DEVICE_CATEGORIES, ALL_CATEGORY } from "@/constants/categories";
import { useIsCompact } from "@/hooks/useLayout";

interface CategoryChipsProps {
  active: string;
  onChange: (categoryId: string) => void;
}

export function CategoryChips({ active, onChange }: CategoryChipsProps) {
  const compact = useIsCompact();

  if (compact) {
    return (
      <View className="px-3 py-2 flex-row flex-wrap gap-2">
        {DEVICE_CATEGORIES.map((cat) => (
          <Chip key={cat.id} cat={cat} isActive={cat.id === active} onPress={() => onChange(cat.id)} />
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
    >
      {DEVICE_CATEGORIES.map((cat) => (
        <Chip key={cat.id} cat={cat} isActive={cat.id === active} onPress={() => onChange(cat.id)} />
      ))}
    </ScrollView>
  );
}

function Chip({
  cat,
  isActive,
  onPress,
}: {
  cat: (typeof DEVICE_CATEGORIES)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={
        isActive
          ? "border border-terminal-green bg-terminal-green px-3 py-2.5 min-h-[40px] justify-center"
          : "border border-terminal-border bg-terminal-surface px-3 py-2.5 min-h-[40px] justify-center active:border-terminal-muted"
      }
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <MonoText
        className={
          isActive ? "text-terminal-black text-xs font-bold" : "text-terminal-muted text-xs"
        }
      >
        {cat.label}
      </MonoText>
    </Pressable>
  );
}

export { ALL_CATEGORY };
