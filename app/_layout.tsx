import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Flashbay is always dark — Operator Console aesthetic, no light-mode variant.
export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#000000' },
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#39FF14',
          headerTitleStyle: { fontFamily: 'SpaceMono', color: '#F5F5F5' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="device/[id]" options={{ title: 'DEVICE', headerBackTitle: 'Back' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
