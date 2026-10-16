import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, PROMISE_MINUTES, radius, space } from '../theme/tokens';

/**
 * The storefront header: delivery promise, address, and a tap-through search
 * field. Kept as one component because every browsing surface reuses it.
 */
export function StoreHeader({ address = 'Koramangala 5th Block' }: { address?: string }) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.promiseCol}>
          <Text style={styles.eyebrow}>{'DELIVERY IN ' + PROMISE_MINUTES + ' MINUTES'}</Text>
          <Pressable style={styles.addressRow} hitSlop={6}>
            <Text style={styles.address} numberOfLines={1}>
              {address}
            </Text>
            <Text style={styles.chevron}>{'▾'}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.avatar} accessibilityLabel="Account">
          <Text style={styles.avatarText}>SK</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/search')}
        style={({ pressed }) => [styles.search, pressed && styles.pressed]}
      >
        <Text style={styles.searchIcon}>{'⌕'}</Text>
        <Text style={styles.searchText}>Search for atta, dal, coke and more</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.accent,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promiseCol: { flex: 1, gap: 2 },
  eyebrow: { ...font.caption, color: '#C9B8FF', letterSpacing: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  address: { ...font.h1, color: colors.surface, flexShrink: 1 },
  chevron: { color: colors.surface, fontSize: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...font.label, color: colors.surface },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 44,
  },
  pressed: { opacity: 0.9 },
  searchIcon: { fontSize: 18, color: colors.muted, fontWeight: '700' },
  searchText: { ...font.body, color: colors.muted, fontWeight: '500' },
});
