import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CartBar } from '../../components/CartBar';
import { EmptyState } from '../../components/EmptyState';
import { FilterBar } from '../../components/FilterBar';
import { ProductCard } from '../../components/ProductCard';
import { Screen } from '../../components/Screen';
import { useCatalogQuery } from '../../hooks/useCatalogQuery';
import { useDebounced } from '../../hooks/useDebounced';
import type { Product } from '../../types';
import { colors, font, radius, space } from '../../theme/tokens';
import { activeFilterCount, clearFilters } from '../../utils/query';

const SUGGESTIONS = ['Perfume', 'Rice', 'Shampoo', 'Chips', 'Watch', 'Lipstick'];
const MIN_CHARS = 2;

const keyExtractor = (p: Product) => String(p.id);

export default function SearchScreen() {
  const [text, setText] = useState('');
  const term = useDebounced(text, 220);

  // Same hook the aisle screen uses — the filter and sort rules are not
  // reimplemented here, only pointed at a search term instead of an aisle.
  const { query, setQuery, items } = useCatalogQuery({ search: term });

  const idle = term.trim().length < MIN_CHARS;
  const typing = text.trim().length >= MIN_CHARS && text !== term;
  const filtersOn = activeFilterCount(query) > 0;

  return (
    <Screen background={colors.surface}>
      <View style={styles.bar}>
        <Text style={styles.icon}>{'⌕'}</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Search the store"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {text.length > 0 ? (
          <Pressable onPress={() => setText('')} hitSlop={10} accessibilityLabel="Clear search">
            <Text style={styles.clear}>{'✕'}</Text>
          </Pressable>
        ) : null}
      </View>

      {idle ? (
        <View style={styles.idle}>
          <Text style={font.label}>POPULAR SEARCHES</Text>
          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setText(s)}
                style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              >
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <>
          <FilterBar query={query} onChange={setQuery} resultCount={items.length} />

          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => <ProductCard product={item} />}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            windowSize={7}
            removeClippedSubviews
            ListHeaderComponent={
              <Text style={styles.count}>
                {typing
                  ? 'Searching…'
                  : `${items.length} results for "${term.trim()}"`}
              </Text>
            }
            ListEmptyComponent={
              typing ? null : filtersOn ? (
                <EmptyState
                  emoji={'\u{1F9F9}'}
                  title="No items match"
                  message={`Nothing for "${term.trim()}" with these filters.`}
                  actionLabel="Clear filters"
                  onAction={() => setQuery(clearFilters(query))}
                />
              ) : (
                <EmptyState
                  emoji={'\u{1F50D}'}
                  title="Nothing matched"
                  message={`We could not find "${term.trim()}". Try a shorter word.`}
                />
              )
            }
          />
        </>
      )}

      <CartBar />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    margin: space.lg,
    marginBottom: space.sm,
    paddingHorizontal: space.md,
    height: 46,
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  icon: { fontSize: 18, color: colors.muted, fontWeight: '700' },
  input: { flex: 1, ...font.body, height: '100%' },
  clear: { fontSize: 14, color: colors.muted, paddingHorizontal: space.xs },
  idle: { paddingHorizontal: space.lg, gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  pressed: { opacity: 0.7 },
  chipText: { ...font.label, color: colors.accent },
  grid: { paddingHorizontal: space.lg, paddingBottom: 120, gap: space.md },
  row: { gap: space.md },
  count: { ...font.label, paddingBottom: space.sm },
});
