import { Pressable, ScrollView, View } from "react-native";
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
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      {DEVICE_CATEGORIES.map((cat) => {
        const isActive = cat.id === active;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(cat.id)}
            className={
              isActive
                ? "border border-terminal-green bg-terminal-green mr-2 px-3 py-1.5"
                : "border border-terminal-border mr-2 px-3 py-1.5 active:bg-terminal-border"
            }
          >
            <MonoText
              className={isActive ? "text-terminal-black text-xs" : "text-terminal-muted text-xs"}
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
