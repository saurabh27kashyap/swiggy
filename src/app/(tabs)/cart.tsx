import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { QtyStepper } from '../../components/QtyStepper';
import { Screen } from '../../components/Screen';
import {
  billFor,
  DELIVERY_FEE,
  FREE_DELIVERY_ABOVE,
  useCart,
  useCartLines,
} from '../../store/cart';
import { card, colors, font, lift, PROMISE_MINUTES, radius, space } from '../../theme/tokens';
import { packLabel, rupees, toInr } from '../../utils/format';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lines = useCartLines();
  const clear = useCart((s) => s.clear);
  const bill = useMemo(() => billFor(lines), [lines]);
  const items = useMemo(() => Object.values(lines), [lines]);

  if (!items.length) {
    return (
      <Screen background={colors.canvas}>
        <Text style={styles.screenTitle}>Your cart</Text>
        <View style={styles.center}>
          <EmptyState
            emoji={'\u{1F6D2}'}
            title="Cart is empty"
            message="Add a few things and they will show up here."
            actionLabel="Start shopping"
            onAction={() => router.replace('/')}
          />
        </View>
      </Screen>
    );
  }

  const shortOf = FREE_DELIVERY_ABOVE - bill.itemTotal;

  const placeOrder = () => {
    router.push({
      pathname: '/order',
      params: { total: String(bill.toPay), items: String(bill.items) },
    });
    clear();
  };

  return (
    <Screen background={colors.canvas}>
      <Text style={styles.screenTitle}>Your cart</Text>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.promise}>
          <Text style={styles.promiseText}>
            {'\u{1F6F5} Arriving in ' + PROMISE_MINUTES + ' minutes'}
          </Text>
        </View>

        <View style={styles.block}>
          {items.map((line, i) => {
            const unit = toInr(line.product.price);
            return (
              <View key={line.product.id} style={[styles.line, i > 0 && styles.lineDivider]}>
                <Image
                  source={{ uri: line.product.thumbnail }}
                  style={styles.thumb}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
                <View style={styles.lineMeta}>
                  <Text style={styles.lineTitle} numberOfLines={2}>
                    {line.product.title}
                  </Text>
                  <Text style={font.caption}>{packLabel(line.product.id)}</Text>
                  <Text style={styles.linePrice}>{rupees(unit * line.qty)}</Text>
                </View>
                <QtyStepper product={line.product} size="sm" />
              </View>
            );
          })}
        </View>

        {bill.delivery > 0 ? (
          <View style={styles.nudge}>
            <Text style={styles.nudgeText}>
              {'Add ' + rupees(shortOf) + ' more to get free delivery'}
            </Text>
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Bill details</Text>
          <Row label={`Item total (${bill.items})`} value={rupees(bill.itemTotal)} />
          <Row
            label="Delivery fee"
            value={bill.delivery === 0 ? 'FREE' : rupees(DELIVERY_FEE)}
            highlight={bill.delivery === 0}
          />
          <Row label="Handling charge" value={rupees(bill.handling)} />
          <View style={styles.totalRow}>
            <Text style={font.h2}>To pay</Text>
            <Text style={font.h2}>{rupees(bill.toPay)}</Text>
          </View>
          {bill.savings > 0 ? (
            <View style={styles.savings}>
              <Text style={styles.savingsText}>
                {'You saved ' + rupees(bill.savings) + ' on this order'}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + space.sm }]}>
        <Pressable
          onPress={placeOrder}
          style={({ pressed }) => [styles.cta, lift, pressed && styles.pressed]}
        >
          <Text style={styles.ctaTotal}>{rupees(bill.toPay)}</Text>
          <Text style={styles.ctaLabel}>{'Place order ›'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={font.bodySoft}>{label}</Text>
      <Text style={[font.body, highlight && styles.free]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenTitle: { ...font.h1, padding: space.lg, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center' },
  content: { padding: space.lg, gap: space.lg, paddingBottom: 140 },
  promise: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  promiseText: { ...font.label, color: colors.accent },
  block: { ...card, padding: space.lg, gap: space.md },
  blockTitle: { ...font.h2, marginBottom: space.xs },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  lineDivider: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: space.md },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: colors.canvas,
  },
  lineMeta: { flex: 1, gap: 2 },
  lineTitle: { ...font.body, fontWeight: '600', fontSize: 13 },
  linePrice: { ...font.h2, fontSize: 14 },
  nudge: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.md,
    padding: space.md,
  },
  nudgeText: { ...font.label, color: colors.brandDark },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  free: { color: colors.success, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space.md,
  },
  savings: { backgroundColor: colors.successSoft, borderRadius: radius.sm, padding: space.sm },
  savingsText: { ...font.caption, color: colors.success },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    backgroundColor: colors.canvas,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
  },
  pressed: { opacity: 0.9 },
  ctaTotal: { ...font.h2, color: colors.surface, fontSize: 16 },
  ctaLabel: { ...font.h2, color: colors.surface, fontSize: 15 },
});
