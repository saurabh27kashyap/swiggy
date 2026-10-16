import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AisleTile } from '../../components/AisleTile';
import { CartBar } from '../../components/CartBar';
import { EmptyState } from '../../components/EmptyState';
import { Rail } from '../../components/Rail';
import { Screen } from '../../components/Screen';
import { ProductGridSkeleton, Skeleton } from '../../components/Skeleton';
import { StoreHeader } from '../../components/StoreHeader';
import { FREE_DELIVERY_ABOVE } from '../../store/cart';
import { useCatalog } from '../../store/catalog';
import { colors, font, lift, PROMISE_MINUTES, radius, space } from '../../theme/tokens';
import { rupees } from '../../utils/format';

const RAIL_SIZE = 12;

export default function HomeScreen() {
  const router = useRouter();
  const products = useCatalog((s) => s.products);
  const aisles = useCatalog((s) => s.aisles);
  const status = useCatalog((s) => s.status);
  const source = useCatalog((s) => s.source);
  const error = useCatalog((s) => s.error);
  const load = useCatalog((s) => s.load);

  // Derived once per catalog change, not on every render of the screen.
  const { trending, deals, fresh } = useMemo(() => {
    const byRating = [...products].sort((a, b) => b.rating - a.rating);
    const byDiscount = [...products].sort(
      (a, b) => b.discountPercentage - a.discountPercentage
    );
    return {
      trending: byRating.slice(0, RAIL_SIZE),
      deals: byDiscount.slice(0, RAIL_SIZE),
      fresh: products.filter((p) => p.category === 'groceries').slice(0, RAIL_SIZE),
    };
  }, [products]);

  const firstLoad = !products.length;

  if (status === 'error' && firstLoad) {
    return (
      <Screen background={colors.accent}>
        <StoreHeader />
        <View style={styles.center}>
          <EmptyState
            emoji={'\u{1F4E6}'}
            title="Store is unreachable"
            message={error ?? 'Check your connection and try again.'}
            actionLabel="Retry"
            onAction={load}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen background={colors.accent}>
      <StoreHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {source === 'cache' ? (
          <View style={styles.offline}>
            <Text style={styles.offlineText}>
              {'⚡ Showing your saved catalog — works without network'}
            </Text>
          </View>
        ) : null}

        <LinearGradient
          colors={[colors.accent, '#7149DE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, lift]}
        >
          <Text style={styles.heroEyebrow}>INSTAMINI DAILY</Text>
          <Text style={styles.heroTitle}>{'Groceries in ' + PROMISE_MINUTES + ' minutes'}</Text>
          <Text style={styles.heroSub}>
            {'Free delivery above ' + rupees(FREE_DELIVERY_ABOVE)}
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[font.h1, styles.sectionTitle]}>Shop by category</Text>
          {firstLoad ? (
            <View style={styles.aisleSkeletons}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} style={styles.aisleSkeleton} />
              ))}
            </View>
          ) : (
            <View style={styles.aisleGrid}>
              {aisles.map((aisle) => (
                <AisleTile key={aisle.slug} aisle={aisle} />
              ))}
            </View>
          )}
        </View>

        {firstLoad ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <>
            <Rail
              title="Trending now"
              subtitle="Top rated in your area"
              products={trending}
            />
            <Rail
              title="Best deals"
              subtitle="Biggest savings today"
              products={deals}
              onSeeAll={() => router.push('/search')}
            />
            <Rail
              title="Fresh and staples"
              subtitle="Daily kitchen refills"
              products={fresh}
              onSeeAll={() => router.push('/category/groceries')}
            />

            <Pressable
              onPress={() => router.push('/perf')}
              style={({ pressed }) => [styles.perfCard, pressed && styles.pressed]}
            >
              <Text style={styles.perfTitle}>{'\u{1F9EA} Perf lab'}</Text>
              <Text style={styles.perfBody}>
                {'Render the catalog many times over and watch the list stay smooth.'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <CartBar />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: 120, gap: space.xxl, paddingTop: space.lg },
  center: { flex: 1, backgroundColor: colors.canvas, justifyContent: 'center' },
  offline: {
    marginHorizontal: space.lg,
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  offlineText: { ...font.caption, color: colors.success },
  hero: {
    marginHorizontal: space.lg,
    borderRadius: radius.lg,
    padding: space.xl,
    gap: space.xs,
  },
  heroEyebrow: { ...font.caption, color: '#D5C6FF', letterSpacing: 1.4 },
  heroTitle: { ...font.display, color: colors.surface },
  heroSub: { ...font.body, color: '#E7DEFF' },
  section: { gap: space.lg },
  sectionTitle: { paddingHorizontal: space.lg },
  aisleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: space.lg,
    columnGap: '4%',
    paddingHorizontal: space.lg,
  },
  aisleSkeletons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: space.lg,
    columnGap: '4%',
    paddingHorizontal: space.lg,
  },
  aisleSkeleton: { width: '22%', height: 70, borderRadius: radius.md },
  perfCard: {
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.xs,
  },
  pressed: { opacity: 0.85 },
  perfTitle: { ...font.h2 },
  perfBody: { ...font.bodySoft, fontSize: 13, lineHeight: 18 },
});
