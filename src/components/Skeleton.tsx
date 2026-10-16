import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, space } from '../theme/tokens';

/**
 * A shimmer block. Shaped like the content it replaces, so the layout does not
 * jump when real data lands — a spinner cannot do that.
 */
export function Skeleton({ style }: { style?: ViewStyle | ViewStyle[] }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return <Animated.View style={[styles.base, style, { opacity }]} />;
}

/** Placeholder matching the product grid, used on first paint. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cardSlot}>
          <Skeleton style={styles.image} />
          <Skeleton style={styles.lineWide} />
          <Skeleton style={styles.lineNarrow} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.line, borderRadius: radius.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  cardSlot: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: space.sm,
    padding: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  image: { height: 92, borderRadius: radius.md },
  lineWide: { height: 12, width: '85%' },
  lineNarrow: { height: 12, width: '50%' },
});
