import { CustomTabBar } from '@/components/ui/CustomTabBar';
// import { useAuthStore } from '@/lib/store/auth.store';
import { Tabs } from 'expo-router';
import React from 'react';


export default function TabLayout() {

  // const { signOut } = useAuthStore();
  // useEffect(() => {
  //   signOut();
  // }, []);
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="menu" />
      {/* Keep explore registered but not shown in custom bar */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
