import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/cn";

export function MonoText({ className, ...rest }: TextProps & { className?: string }) {
  return <Text {...rest} className={cn("font-mono text-terminal-text", className)} />;
}
