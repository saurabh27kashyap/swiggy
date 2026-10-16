import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { card, colors, font, lift, PROMISE_MINUTES, radius, space } from '../theme/tokens';
import { rupees } from '../utils/format';

const TOTAL_SECONDS = PROMISE_MINUTES * 60;

/**
 * A real order takes ten minutes; a demo cannot. The clock runs ten times
 * faster so the whole journey is watchable in about a minute.
 */
const DEMO_SPEED = 10;

const STEPS = [
  { title: 'Order placed', detail: 'We have your order' },
  { title: 'Packing at darkstore', detail: 'Picker is collecting your items' },
  { title: 'Out for delivery', detail: 'Rider is on the way' },
  { title: 'Delivered', detail: 'Enjoy your order' },
];

/** Remaining seconds at which each step becomes active. */
const STEP_AT = [TOTAL_SECONDS, 420, 240, 0];

export default function OrderScreen() {
  const router = useRouter();
  const { total, items } = useLocalSearchParams<{ total?: string; items?: string }>();
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - DEMO_SPEED));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const done = remaining === 0;
  const fraction = 1 - remaining / TOTAL_SECONDS;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: fraction,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [fraction, progress]);

  const stepIndex = useMemo(() => {
    let index = 0;
    STEP_AT.forEach((threshold, i) => {
      if (remaining <= threshold) index = i;
    });
    return index;
  }, [remaining]);

  const orderId = useMemo(
    () => 'IM' + Math.floor(100000 + Math.random() * 899999).toString(),
    []
  );

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['4%', '100%'],
  });

  return (
    <Screen background={colors.accent}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.accent, '#7149DE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.eyebrow}>{done ? 'DELIVERED' : 'ARRIVING IN'}</Text>
          <Text style={styles.clock}>{done ? 'Done' : `${mm}:${ss}`}</Text>
          <Text style={styles.orderId}>{'Order ' + orderId}</Text>

          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width }]} />
          </View>
        </LinearGradient>

        <View style={styles.sheet}>
          <View style={styles.block}>
            {STEPS.map((step, i) => {
              const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'todo';
              return (
                <View key={step.title} style={styles.step}>
                  <View style={styles.rail}>
                    <View
                      style={[
                        styles.bullet,
                        state === 'done' && styles.bulletDone,
                        state === 'active' && styles.bulletActive,
                      ]}
                    >
                      {state === 'done' ? <Text style={styles.tick}>{'✓'}</Text> : null}
                    </View>
                    {i < STEPS.length - 1 ? (
                      <View style={[styles.connector, i < stepIndex && styles.connectorDone]} />
                    ) : null}
                  </View>

                  <View style={styles.stepText}>
                    <Text style={[font.h2, state === 'todo' && styles.muted]}>{step.title}</Text>
                    <Text style={font.caption}>{step.detail}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.block}>
            <Text style={font.h2}>Order summary</Text>
            <View style={styles.row}>
              <Text style={font.bodySoft}>{(items ?? '0') + ' items'}</Text>
              <Text style={font.body}>{rupees(Number(total ?? 0))}</Text>
            </View>
            <View style={styles.row}>
              <Text style={font.bodySoft}>Paid via</Text>
              <Text style={font.body}>UPI</Text>
            </View>
            <View style={styles.row}>
              <Text style={font.bodySoft}>Delivering to</Text>
              <Text style={font.body}>Koramangala 5th Block</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.cta, lift, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>Back to shop</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.xxl },
  hero: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.xs },
  eyebrow: { ...font.caption, color: '#D5C6FF', letterSpacing: 1.4 },
  clock: { fontSize: 46, fontWeight: '800', color: colors.surface, letterSpacing: -1 },
  orderId: { ...font.caption, color: '#E7DEFF' },
  track: {
    height: 6,
    backgroundColor: colors.accentDark,
    borderRadius: radius.pill,
    marginTop: space.lg,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.brand, borderRadius: radius.pill },
  sheet: {
    backgroundColor: colors.canvas,
    marginTop: -space.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.lg,
    gap: space.lg,
  },
  block: { ...card, padding: space.lg, gap: space.md },
  step: { flexDirection: 'row', gap: space.md },
  rail: { alignItems: 'center', width: 22 },
  bullet: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  bulletDone: { borderColor: colors.success, backgroundColor: colors.success },
  tick: { color: colors.surface, fontSize: 11, fontWeight: '800' },
  connector: { flex: 1, width: 2, backgroundColor: colors.line, marginVertical: 2 },
  connectorDone: { backgroundColor: colors.success },
  stepText: { flex: 1, gap: 1, paddingBottom: space.lg },
  muted: { color: colors.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cta: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  ctaText: { ...font.h2, color: colors.surface, fontSize: 15 },
});
