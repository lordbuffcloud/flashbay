import { Pressable, ScrollView } from "react-native";
import { MonoText } from "./MonoText";
import { DEVICE_CATEGORIES, ALL_CATEGORY } from "@/constants/categories";

interface CategoryChipsProps {
  active: string;
  onChange: (categoryId: string) => void;
}

export function CategoryChips({ active, onChange }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
    >
      {DEVICE_CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(cat.id)}
            className={
              isActive
                ? "border border-terminal-green bg-terminal-green px-3 py-2"
                : "border border-terminal-border bg-terminal-surface px-3 py-2 active:border-terminal-muted"
            }
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
      })}
    </ScrollView>
  );
}

export { ALL_CATEGORY };
