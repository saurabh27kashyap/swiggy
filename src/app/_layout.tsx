import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCatalog } from '../store/catalog';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  const load = useCatalog((s) => s.load);

  // One catalog fetch for the whole app, kicked off before the first screen paints.
  useEffect(() => {
    load();
  }, [load]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="category/[slug]" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="order" options={{ gestureEnabled: false }} />
          <Stack.Screen name="perf" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
