import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billFor, useCartLines } from '../store/cart';
import { colors, font, lift, radius, space } from '../theme/tokens';
import { rupees } from '../utils/format';

/**
 * The floating "view cart" dock. Present on every browsing screen so the cart
 * is always one tap away, the way a quick-commerce storefront works.
 */
export function CartBar({ inset = false }: { inset?: boolean }) {
  const router = useRouter();
  const lines = useCartLines();
  const insets = useSafeAreaInsets();
  const bill = useMemo(() => billFor(lines), [lines]);

  if (bill.items === 0) return null;

  return (
    <View style={[styles.dock, { paddingBottom: inset ? insets.bottom + space.md : space.md }]}>
      <Pressable
        onPress={() => router.push('/cart')}
        style={({ pressed }) => [styles.bar, lift, pressed && styles.pressed]}
      >
        <View>
          <Text style={styles.count}>
            {bill.items} {bill.items === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.total}>{rupees(bill.toPay)}</Text>
        </View>
        <Text style={styles.cta}>{'View cart ›'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pressed: { opacity: 0.9 },
  count: { ...font.caption, color: '#FFE2D5' },
  total: { ...font.h2, color: colors.surface, fontSize: 16 },
  cta: { ...font.h2, color: colors.surface, fontSize: 15 },
});
