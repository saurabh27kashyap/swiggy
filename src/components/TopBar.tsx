import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, space } from '../theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

/** Back-and-title bar used by the stack screens that sit outside the tabs. */
export function TopBar({ title, subtitle, right }: Props) {
  const router = useRouter();

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        accessibilityLabel="Go back"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Text style={styles.chevron}>{'‹'}</Text>
      </Pressable>

      <View style={styles.titles}>
        <Text style={font.h1} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={font.caption}>{subtitle}</Text> : null}
      </View>

      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  chevron: { fontSize: 24, lineHeight: 26, color: colors.ink, fontWeight: '700' },
  titles: { flex: 1, gap: 1 },
});
