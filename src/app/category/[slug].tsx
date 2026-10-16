import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CartBar } from '../../components/CartBar';
import { EmptyState } from '../../components/EmptyState';
import { FilterBar } from '../../components/FilterBar';
import { ProductCard } from '../../components/ProductCard';
import { Screen } from '../../components/Screen';
import { ProductGridSkeleton } from '../../components/Skeleton';
import { TopBar } from '../../components/TopBar';
import { useCatalogQuery } from '../../hooks/useCatalogQuery';
import { useCatalog } from '../../store/catalog';
import type { Product } from '../../types';
import { colors, font, radius, space } from '../../theme/tokens';
import { aisleMeta } from '../../utils/aisles';
import { activeFilterCount, clearFilters } from '../../utils/query';

const keyExtractor = (p: Product) => String(p.id);

export default function AisleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const products = useCatalog((s) => s.products);
  const aisles = useCatalog((s) => s.aisles);
  const listRef = useRef<FlatList<Product>>(null);

  const { query, setQuery, items, total } = useCatalogQuery({ aisle: slug });
  const meta = aisleMeta(slug ?? '');
  const filtersOn = activeFilterCount(query) > 0;

  // Changing sort or filters must not leave the user stranded mid-list.
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [query]);

  const siblings = useMemo(() => aisles.filter((a) => a.slug !== slug), [aisles, slug]);

  const subtitle = products.length
    ? items.length === total
      ? `${total} items in stock`
      : `${items.length} of ${total} items`
    : undefined;

  return (
    <Screen background={colors.surface}>
      <TopBar title={`${meta.emoji}  ${meta.name}`} subtitle={subtitle} />

      {!products.length ? (
        <View style={styles.loading}>
          <ProductGridSkeleton count={6} />
        </View>
      ) : (
        <>
          <FilterBar query={query} onChange={setQuery} resultCount={items.length} />

          <FlatList
            ref={listRef}
            data={items}
            numColumns={2}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => <ProductCard product={item} />}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            initialNumToRender={8}
            windowSize={7}
            removeClippedSubviews
            ListHeaderComponent={
              siblings.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.aisleChips}
                  style={styles.aisleStrip}
                >
                  {siblings.map((a) => (
                    <Pressable
                      key={a.slug}
                      onPress={() => router.replace(`/category/${a.slug}`)}
                      style={({ pressed }) => [styles.aisleChip, pressed && styles.pressed]}
                    >
                      <Text style={styles.aisleChipText}>{`${a.emoji} ${a.name}`}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null
            }
            ListEmptyComponent={
              filtersOn ? (
                <EmptyState
                  emoji={'\u{1F9F9}'}
                  title="No items match"
                  message="Your filters are a little too tight for this aisle."
                  actionLabel="Clear filters"
                  onAction={() => setQuery(clearFilters(query))}
                />
              ) : (
                <EmptyState
                  emoji={'\u{1F6D1}'}
                  title="Aisle is empty"
                  message="Nothing is stocked here right now."
                  actionLabel="Back to shop"
                  onAction={() => router.replace('/')}
                />
              )
            }
          />
        </>
      )}

      <CartBar inset />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingTop: space.lg },
  grid: { paddingHorizontal: space.lg, paddingBottom: 140, gap: space.md },
  row: { gap: space.md },
  aisleStrip: { marginHorizontal: -space.lg, marginBottom: space.xs },
  aisleChips: { gap: space.sm, paddingHorizontal: space.lg },
  pressed: { opacity: 0.65 },
  aisleChip: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  aisleChipText: { ...font.caption, color: colors.inkSoft },
});
