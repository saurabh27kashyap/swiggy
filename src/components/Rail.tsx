import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';
import { colors, font, space } from '../theme/tokens';

const CARD_WIDTH = 150;

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
  onSeeAll?: () => void;
};

const keyExtractor = (p: Product) => String(p.id);
const Separator = () => <View style={styles.gap} />;

export function Rail({ title, subtitle, products, onSeeAll }: Props) {
  if (!products.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={font.h1}>{title}</Text>
          {subtitle ? <Text style={font.caption}>{subtitle}</Text> : null}
        </View>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <ProductCard product={item} width={CARD_WIDTH} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        initialNumToRender={4}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  headText: { gap: 2 },
  seeAll: { ...font.label, color: colors.brandDark },
  list: { paddingHorizontal: space.lg },
  gap: { width: space.md },
});
