import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { QtyStepper } from './QtyStepper';
import type { Product } from '../types';
import { card, colors, font, lift, radius, space } from '../theme/tokens';
import { mrp, packLabel, rupees, toInr } from '../utils/format';

type Props = {
  product: Product;
  /** Fixed width for horizontal rails; grids leave it out and flex instead. */
  width?: number;
};

/**
 * memo + a per-row cart subscription is what keeps a 1000-item grid smooth:
 * tapping ADD on one card re-renders that card only.
 */
export const ProductCard = memo(function ProductCard({ product, width }: Props) {
  const router = useRouter();
  const price = toInr(product.price);
  const listPrice = mrp(product.price, product.discountPercentage);
  const off = Math.round(product.discountPercentage);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [
        styles.card,
        lift,
        width ? { width } : styles.flexible,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          contentFit="contain"
          transition={160}
          cachePolicy="memory-disk"
        />
        {off >= 5 ? (
          <View style={styles.ribbon}>
            <Text style={styles.ribbonValue}>{off}%</Text>
            <Text style={styles.ribbonLabel}>OFF</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.pack}>{packLabel(product.id)}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.rating}>{'★ ' + product.rating.toFixed(1)}</Text>

      <View style={styles.footer}>
        <View style={styles.priceCol}>
          <Text style={styles.price}>{rupees(price)}</Text>
          {listPrice > price ? <Text style={styles.mrp}>{rupees(listPrice)}</Text> : null}
        </View>
        <QtyStepper product={product} size="sm" />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { ...card, padding: space.sm, gap: 2 },
  flexible: { flex: 1 },
  pressed: { opacity: 0.85 },
  imageWrap: {
    height: 104,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    overflow: 'hidden',
    marginBottom: space.sm,
  },
  image: { flex: 1 },
  ribbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.accent,
    borderBottomRightRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignItems: 'center',
  },
  ribbonValue: { color: colors.surface, fontSize: 10, fontWeight: '800', lineHeight: 12 },
  ribbonLabel: {
    color: colors.surface,
    fontSize: 7,
    fontWeight: '700',
    lineHeight: 9,
    letterSpacing: 0.5,
  },
  pack: { ...font.caption },
  title: { ...font.body, fontSize: 13, fontWeight: '600', lineHeight: 17, minHeight: 34 },
  rating: { ...font.caption, color: colors.success },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
    gap: space.xs,
  },
  priceCol: { flexShrink: 1 },
  price: { ...font.h2, fontSize: 15 },
  mrp: { ...font.caption, textDecorationLine: 'line-through', color: colors.muted },
});
