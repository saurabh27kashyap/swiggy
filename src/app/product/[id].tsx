import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { QtyStepper } from '../../components/QtyStepper';
import { Screen } from '../../components/Screen';
import { Skeleton } from '../../components/Skeleton';
import { TopBar } from '../../components/TopBar';
import { useCatalog, useProduct } from '../../store/catalog';
import { card, colors, font, lift, PROMISE_MINUTES, radius, space } from '../../theme/tokens';
import { aisleMeta } from '../../utils/aisles';
import { mrp, packLabel, rupees, toInr } from '../../utils/format';

const GALLERY_WIDTH = Dimensions.get('window').width;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const status = useCatalog((s) => s.status);
  const product = useProduct(Number(id));
  const [page, setPage] = useState(0);

  const gallery = useMemo(() => {
    if (!product) return [];
    const images = product.images?.length ? product.images : [product.thumbnail];
    return images.slice(0, 5);
  }, [product]);

  if (!product) {
    return (
      <Screen background={colors.surface}>
        <TopBar title="Product" />
        {status === 'loading' ? (
          <View style={styles.loading}>
            <Skeleton style={styles.loadingImage} />
            <Skeleton style={styles.loadingLine} />
            <Skeleton style={styles.loadingLineShort} />
          </View>
        ) : (
          <EmptyState
            emoji={'\u{1F300}'}
            title="Product not found"
            message="This item is no longer on the shelf."
            actionLabel="Back to shop"
            onAction={() => router.replace('/')}
          />
        )}
      </Screen>
    );
  }

  const price = toInr(product.price);
  const listPrice = mrp(product.price, product.discountPercentage);
  const off = Math.round(product.discountPercentage);
  const aisle = aisleMeta(product.category);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / GALLERY_WIDTH));
  };

  return (
    <Screen background={colors.surface}>
      <TopBar title={aisle.name} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          <FlatList
            data={gallery}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScroll}
            keyExtractor={(uri, i) => `${i}-${uri}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
                contentFit="contain"
                transition={180}
                cachePolicy="memory-disk"
              />
            )}
          />
          {gallery.length > 1 ? (
            <View style={styles.dots}>
              {gallery.map((_, i) => (
                <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {product.brand ? <Text style={font.label}>{product.brand.toUpperCase()}</Text> : null}
          <Text style={font.display}>{product.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>{'★ ' + product.rating.toFixed(1)}</Text>
            </View>
            <Text style={font.caption}>{packLabel(product.id)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{rupees(price)}</Text>
            {listPrice > price ? <Text style={styles.mrp}>{rupees(listPrice)}</Text> : null}
            {off >= 5 ? <Text style={styles.off}>{off + '% off'}</Text> : null}
          </View>

          <View style={styles.badges}>
            <Badge icon={'\u{1F6F5}'} label={PROMISE_MINUTES + ' min delivery'} />
            <Badge
              icon={'\u{1F4E6}'}
              label={product.stock > 0 ? product.stock + ' in stock' : 'Out of stock'}
            />
            <Badge icon={'\u{1F504}'} label="Easy returns" />
          </View>

          <View style={styles.about}>
            <Text style={font.h2}>About this item</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        <View>
          <Text style={font.caption}>{packLabel(product.id)}</Text>
          <Text style={styles.dockPrice}>{rupees(price)}</Text>
        </View>
        <QtyStepper product={product} />
      </BottomBar>
    </Screen>
  );
}

function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

function BottomBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.dock, lift, { paddingBottom: insets.bottom + space.md }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  loading: { padding: space.lg, gap: space.md },
  loadingImage: { height: 220, borderRadius: radius.lg },
  loadingLine: { height: 18, width: '70%' },
  loadingLineShort: { height: 18, width: '40%' },
  gallery: { backgroundColor: colors.canvas, paddingVertical: space.lg },
  image: { width: GALLERY_WIDTH, height: 260 },
  dots: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginTop: space.md },
  dot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.accent, width: 18 },
  body: { padding: space.lg, gap: space.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  ratingPill: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  ratingText: { ...font.caption, color: colors.success },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginTop: space.xs },
  price: { ...font.display, fontSize: 24 },
  mrp: { ...font.bodySoft, textDecorationLine: 'line-through', color: colors.muted },
  off: { ...font.label, color: colors.success },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  badge: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.canvas,
  },
  badgeIcon: { fontSize: 13 },
  badgeLabel: { ...font.caption, color: colors.inkSoft },
  about: { marginTop: space.xl, gap: space.sm },
  description: { ...font.bodySoft, lineHeight: 21 },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  dockPrice: { ...font.h1 },
});
