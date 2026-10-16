import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, space } from '../theme/tokens';
import {
  clearFilters,
  DISCOUNT_OPTIONS,
  PRICE_BANDS,
  RATING_OPTIONS,
  SORT_OPTIONS,
  type CatalogQuery,
  type PriceBand,
} from '../utils/query';

export type SheetMode = 'sort' | 'filters' | null;

type Props = {
  mode: SheetMode;
  query: CatalogQuery;
  resultCount: number;
  onChange: (next: CatalogQuery) => void;
  onClose: () => void;
};

/**
 * One sheet, two modes. Filters apply on tap rather than behind an "Apply"
 * button: in a 10-minute store the user is in a hurry, and every extra tap is a
 * chance to abandon. Sort closes on pick (there is nothing left to choose),
 * filters stay open so several can be stacked.
 */
export function FilterSheet({ mode, query, resultCount, onChange, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={mode !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.handle} />
        <Text style={styles.heading}>{mode === 'sort' ? 'Sort by' : 'Filters'}</Text>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {mode === 'sort' ? (
            <View>
              {SORT_OPTIONS.map((option) => {
                const active = option.key === query.sort;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      onChange({ ...query, sort: option.key });
                      onClose();
                    }}
                    style={({ pressed }) => [styles.radioRow, pressed && styles.pressed]}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>
                    <Text style={[font.body, active && styles.activeLabel]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.sections}>
              <Section title="Price">
                {PRICE_BANDS.map((band) => (
                  <Chip
                    key={band.key}
                    label={band.label}
                    active={query.price === band.key}
                    onPress={() =>
                      onChange({
                        ...query,
                        price: query.price === band.key ? undefined : (band.key as PriceBand),
                      })
                    }
                  />
                ))}
              </Section>

              <Section title="Customer rating">
                {RATING_OPTIONS.map((value) => (
                  <Chip
                    key={value}
                    label={value + '★ & above'}
                    active={query.minRating === value}
                    onPress={() =>
                      onChange({
                        ...query,
                        minRating: query.minRating === value ? undefined : value,
                      })
                    }
                  />
                ))}
              </Section>

              <Section title="Discount">
                {DISCOUNT_OPTIONS.map((value) => (
                  <Chip
                    key={value}
                    label={value + '% off or more'}
                    active={query.minDiscount === value}
                    onPress={() =>
                      onChange({
                        ...query,
                        minDiscount: query.minDiscount === value ? undefined : value,
                      })
                    }
                  />
                ))}
              </Section>

              <View style={styles.switchRow}>
                <Text style={font.body}>In stock only</Text>
                <Switch
                  value={query.inStockOnly}
                  onValueChange={(v) => onChange({ ...query, inStockOnly: v })}
                  trackColor={{ true: colors.brand, false: colors.line }}
                  thumbColor={colors.surface}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {mode === 'filters' ? (
          <View style={styles.footer}>
            <Pressable onPress={() => onChange(clearFilters(query))} hitSlop={8}>
              <Text style={styles.clearAll}>Clear all</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.apply, pressed && styles.pressed]}
            >
              <Text style={styles.applyText}>
                {resultCount === 1 ? 'Show 1 item' : `Show ${resultCount} items`}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={font.label}>{title.toUpperCase()}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(16,20,24,0.45)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    maxHeight: '78%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: space.md,
  },
  heading: { ...font.h1, marginBottom: space.md },
  body: { flexGrow: 0 },
  pressed: { opacity: 0.7 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.brand },
  radioDot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.brand },
  activeLabel: { fontWeight: '700' },
  sections: { gap: space.xl, paddingBottom: space.lg },
  section: { gap: space.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  chipText: { ...font.label, color: colors.inkSoft },
  chipTextActive: { color: colors.brandDark },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.lg,
    marginTop: space.sm,
  },
  clearAll: { ...font.label, color: colors.inkSoft },
  apply: {
    backgroundColor: colors.brand,
    borderRadius: radius.sm,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
  },
  applyText: { ...font.h2, color: colors.surface, fontSize: 14 },
});
