import LevelMap from '@/components/ui/map/LevelMap';
import { selectUserPoints, useUserStore } from '@/lib/store/user.store';
import { Colors } from '@/lib/theme';
import { FontAwesome5 } from '@expo/vector-icons';

import { useFocusEffect } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useCallback } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function PlayScreen() {
  const currentLevel = useUserStore((s) => s.profile?.level);
  const points = useUserStore(selectUserPoints);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{}} className='flex flex-row mx-10 rounded-full px-10 absolute top-20 z-50 left-0 right-0 bg-zinc-800 dark:bg-gray-800 items-center justify-between p-4'>
        <Image className='w-10 h-10 bg-white dark:bg-transparent rounded-full' source={require('../../assets/images/icon.png')} />

        <View className="flex-row items-center gap-2 bg-zinc-700 dark:bg-gray-700 px-3 py-1.5 rounded-full">
          <FontAwesome5 name="star" solid size={14} color="#FBBF24" />
          <Text className='text-lg font-bold text-amber-400'>{points}</Text>
        </View>
      </View>
      <LevelMap currentLevel={currentLevel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
