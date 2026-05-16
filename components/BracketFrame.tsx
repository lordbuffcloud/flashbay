import { View, type ViewProps } from "react-native";
import { MonoText } from "./MonoText";
import { cn } from "@/lib/cn";

interface BracketFrameProps extends ViewProps {
  children: React.ReactNode;
  accent?: "green" | "amber";
  className?: string;
}

export function BracketFrame({
  children,
  accent = "green",
  className,
  ...rest
}: BracketFrameProps) {
  const color = accent === "amber" ? "text-terminal-amber" : "text-terminal-green";
  return (
    <View {...rest} className={cn("flex-row items-center", className)}>
      <MonoText className={cn(color, "text-base mr-1")}>[</MonoText>
      <View className="flex-1">{children}</View>
      <MonoText className={cn(color, "text-base ml-1")}>]</MonoText>
    </View>
  );
}
