import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Aisle } from '../types';
import { colors, font, radius, space } from '../theme/tokens';

export const AisleTile = memo(function AisleTile({ aisle }: { aisle: Aisle }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/category/${aisle.slug}`)}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>{aisle.emoji}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {aisle.name}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tile: { width: '22%', alignItems: 'center', gap: space.xs },
  pressed: { opacity: 0.6 },
  emoji: {
    fontSize: 26,
    textAlign: 'center',
    width: '100%',
    paddingVertical: space.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  name: { ...font.caption, color: colors.inkSoft, textAlign: 'center', lineHeight: 13 },
});
