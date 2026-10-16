import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { TopBar } from '../components/TopBar';
import { inflate, useCatalog } from '../store/catalog';
import type { Product } from '../types';
import { card, colors, font, radius, space } from '../theme/tokens';

const MULTIPLIERS = [1, 3, 6, 10];
const ROW_HEIGHT = 236;

const keyExtractor = (p: Product) => String(p.id);

/**
 * A deliberate stress surface. Flipping "optimized" off removes the
 * virtualization budget and the memo-friendly layout hints, which makes the
 * cost of those decisions visible on a real device instead of theoretical.
 */
export default function PerfScreen() {
  const products = useCatalog((s) => s.products);
  const stress = useCatalog((s) => s.stress);
  const setStress = useCatalog((s) => s.setStress);
  const [optimized, setOptimized] = useState(true);

  const data = useMemo(() => inflate(products, stress), [products, stress]);

  const tuning = optimized
    ? {
        initialNumToRender: 8,
        windowSize: 5,
        maxToRenderPerBatch: 8,
        removeClippedSubviews: true,
        getItemLayout: (_: unknown, index: number) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * Math.floor(index / 2),
          index,
        }),
      }
    : {
        initialNumToRender: Math.max(1, data.length),
        windowSize: 21,
        maxToRenderPerBatch: 50,
        removeClippedSubviews: false,
      };

  return (
    <Screen background={colors.surface}>
      <TopBar title="Perf lab" subtitle={`${data.length} products rendered`} />

      <View style={styles.panel}>
        <Text style={font.label}>CATALOG SIZE</Text>
        <View style={styles.chips}>
          {MULTIPLIERS.map((m) => {
            const active = m === stress;
            return (
              <Pressable
                key={m}
                onPress={() => setStress(m)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {m + '×'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={font.h2}>Virtualization tuning</Text>
            <Text style={font.caption}>
              {optimized
                ? 'Windowed rendering, clipped offscreen rows, fixed row height'
                : 'Every row mounted up front — scroll it and feel the drop'}
            </Text>
          </View>
          <Switch
            value={optimized}
            onValueChange={setOptimized}
            trackColor={{ true: colors.brand, false: colors.line }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      <FlatList
        key={optimized ? 'tuned' : 'raw'}
        data={data}
        numColumns={2}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <View style={styles.slot}>
            <ProductCard product={item} />
          </View>
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        {...tuning}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { ...card, margin: space.lg, padding: space.lg, gap: space.md },
  chips: { flexDirection: 'row', gap: space.sm },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { ...font.label, color: colors.inkSoft },
  chipTextActive: { color: colors.surface },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.md,
  },
  switchText: { flex: 1, gap: 2 },
  grid: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  row: { gap: space.md },
  slot: { flex: 1, height: ROW_HEIGHT, paddingBottom: space.md },
});
