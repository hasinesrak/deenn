import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon } from '@/icons';

import { SurahRow } from '@/components/SurahRow';
import { useTabBarInset } from '@/components/TabBar';
import { DeenText } from '@/components/ui/DeenText';
import { searchSurahs } from '@/db/quranApi';
import { useTheme } from '@/providers/ThemeProvider';
import { radii } from '@/theme/radii';
import { fonts } from '@/theme/typography';
import type { Surah } from '@/types/deen';

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);

  useEffect(() => {
    let cancelled = false;
    searchSurahs(query).then((rows) => {
      if (!cancelled) {
        setSurahs(rows);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <DeenText variant="brand">Quran</DeenText>
        <DeenText color={colors.secondary} style={styles.subtitle}>
          Browse every surah, offline.
        </DeenText>
      </View>
      <View style={[styles.search, { backgroundColor: colors.surfaceAlt }]}>
        <HugeiconsIcon color={colors.muted} icon={Search01Icon} size={18} />
        <TextInput
          accessibilityLabel="Search surahs"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Search by name or number"
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.primary }]}
          underlineColorAndroid="transparent"
          value={query}
        />
      </View>
      <FlatList
        contentContainerStyle={[styles.list, { paddingBottom: tabBarInset + 8 }]}
        data={surahs}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <SurahRow onPress={() => router.push(`/surah/${item.id}`)} surah={item} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    letterSpacing: 0.1,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 16,
    padding: 0,
  },
  list: {
    paddingBottom: 24,
  },
});
