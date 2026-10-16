import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FilterSheet, type SheetMode } from './FilterSheet';
import { colors, font, radius, space } from '../theme/tokens';
import {
  activeFilterCount,
  describeFilters,
  SORT_OPTIONS,
  withoutFilter,
  type CatalogQuery,
} from '../utils/query';

type Props = {
  query: CatalogQuery;
  onChange: (next: CatalogQuery) => void;
  resultCount: number;
};

/**
 * Sort + filter entry points and the active-filter chips.
 *
 * Both the aisle screen and the search screen render this exact component, so
 * the two surfaces cannot drift apart in behaviour or wording.
 */
export function FilterBar({ query, onChange, resultCount }: Props) {
  const [sheet, setSheet] = useState<SheetMode>(null);
  const count = activeFilterCount(query);
  const chips = describeFilters(query);
  const sortLabel = SORT_OPTIONS.find((o) => o.key === query.sort)?.label ?? 'Popularity';

  return (
    <View style={styles.wrap}>
      <View style={styles.buttons}>
        <Pressable
          onPress={() => setSheet('sort')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText} numberOfLines={1}>
            {sortLabel}
          </Text>
          <Text style={styles.caret}>{'▾'}</Text>
        </Pressable>

        <Pressable
          onPress={() => setSheet('filters')}
          style={({ pressed }) => [
            styles.button,
            count > 0 && styles.buttonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.buttonText, count > 0 && styles.buttonTextActive]}>Filters</Text>
          {count > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {chips.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {chips.map((chip) => (
            <Pressable
              key={chip.key}
              onPress={() => onChange(withoutFilter(query, chip.key))}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              accessibilityLabel={`Remove filter ${chip.label}`}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
              <Text style={styles.chipClose}>{'✕'}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <FilterSheet
        mode={sheet}
        query={query}
        resultCount={resultCount}
        onChange={onChange}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, backgroundColor: colors.surface, paddingVertical: space.md },
  buttons: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  buttonActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  pressed: { opacity: 0.65 },
  buttonText: { ...font.label, color: colors.ink },
  buttonTextActive: { color: colors.brandDark },
  caret: { fontSize: 10, color: colors.inkSoft },
  badge: {
    minWidth: 17,
    height: 17,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.surface, fontSize: 10, fontWeight: '800' },
  chipRow: { gap: space.sm, paddingHorizontal: space.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  chipText: { ...font.caption, color: colors.accent },
  chipClose: { fontSize: 11, color: colors.accent, fontWeight: '700' },
});
