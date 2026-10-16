import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCart, useQty } from '../store/cart';
import type { Product } from '../types';
import { colors, font, radius, space } from '../theme/tokens';

type Props = {
  product: Product;
  size?: 'sm' | 'md';
};

function tap() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

/**
 * ADD -> stepper, the Instamart interaction. Reads only its own quantity from
 * the cart store, so one tap never re-renders the rest of the grid.
 */
export const QtyStepper = memo(function QtyStepper({ product, size = 'md' }: Props) {
  const qty = useQty(product.id);
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);

  const compact = size === 'sm';

  const onAdd = useCallback(() => {
    tap();
    add(product);
  }, [add, product]);

  const onInc = useCallback(() => {
    tap();
    inc(product.id);
  }, [inc, product.id]);

  const onDec = useCallback(() => {
    tap();
    dec(product.id);
  }, [dec, product.id]);

  const soldOut = product.stock <= 0;

  if (soldOut) {
    return (
      <View style={[styles.shell, compact && styles.shellCompact, styles.soldOut]}>
        <Text style={styles.soldOutText}>Sold out</Text>
      </View>
    );
  }

  if (qty === 0) {
    return (
      <Pressable
        onPress={onAdd}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Add ${product.title} to cart`}
        style={({ pressed }) => [
          styles.shell,
          compact && styles.shellCompact,
          styles.addShell,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.addText, compact && styles.textCompact]}>ADD</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.shell, compact && styles.shellCompact, styles.stepper]}>
      <Pressable onPress={onDec} hitSlop={8} accessibilityLabel="Decrease quantity" style={styles.step}>
        <Text style={styles.stepGlyph}>&#8722;</Text>
      </Pressable>
      <Text style={[styles.qty, compact && styles.textCompact]}>{qty}</Text>
      <Pressable onPress={onInc} hitSlop={8} accessibilityLabel="Increase quantity" style={styles.step}>
        <Text style={styles.stepGlyph}>+</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shellCompact: { height: 30 },
  addShell: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: space.lg,
  },
  pressed: { opacity: 0.7 },
  addText: { ...font.label, color: colors.brandDark, fontSize: 13, letterSpacing: 0.6 },
  textCompact: { fontSize: 12 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand,
    paddingHorizontal: space.xs,
  },
  step: { paddingHorizontal: space.sm, paddingVertical: space.xs },
  stepGlyph: { color: colors.surface, fontSize: 18, fontWeight: '800', lineHeight: 20 },
  qty: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: 14,
    minWidth: 18,
    textAlign: 'center',
  },
  soldOut: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, paddingHorizontal: space.md },
  soldOutText: { ...font.caption, color: colors.muted },
});
