import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, space } from '../theme/tokens';

type Props = {
  emoji: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Every list in the app routes its empty, error and offline cases through here. */
export function EmptyState({ emoji, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={font.h1}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xxxl,
    paddingHorizontal: space.xxl,
  },
  emoji: { fontSize: 44 },
  message: { ...font.bodySoft, textAlign: 'center', lineHeight: 20 },
  action: {
    marginTop: space.md,
    backgroundColor: colors.brand,
    paddingHorizontal: space.xxl,
    paddingVertical: space.md,
    borderRadius: radius.sm,
  },
  pressed: { opacity: 0.85 },
  actionText: { ...font.h2, color: colors.surface, fontSize: 14 },
});
