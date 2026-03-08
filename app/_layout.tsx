import { toastConfig } from '@/components/ui/popup/toast';
import { queryClient } from '@/lib/api/query-client';
import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/lib/store/auth.store';
import {
  selectOnboardingSeen,
  selectSessionHydrated,
  useSessionStore,
} from '@/lib/store/sessionStore';
import { useUserStore } from '@/lib/store/user.store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { clusterApiUrl } from '@solana/web3.js';
import { QueryClientProvider } from '@tanstack/react-query';
import { MobileWalletProvider } from '@wallet-ui/react-native-web3js';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const chain = 'solana:devnet';
const endpoint = clusterApiUrl('devnet');
const identity = {
  name: 'Cryptonaire',
  uri: 'https://cryptonaire.app',
  icon: 'favicon.png',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Session store — onboarding flag
  const isSessionHydrated = useSessionStore(selectSessionHydrated);
  const onboardingSeen = useSessionStore(selectOnboardingSeen);
  const hydrateSession = useSessionStore((s) => s.hydrate);

  // Auth store — JWT / user
  const isAuthHydrated = useAuthStore(selectIsHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  // User store — live profile
  const fetchUser = useUserStore((s) => s.fetchUser);
  const clearUser = useUserStore((s) => s.clear);

  // Hydrate both stores on first mount — parallel
  useEffect(() => {
    Promise.all([hydrateSession(), hydrateAuth()]);
  }, [hydrateSession, hydrateAuth]);

  // Once auth is confirmed, fetch the live user profile
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    } else {
      clearUser();
    }
  }, [isAuthenticated, fetchUser, clearUser]);

  // Routing logic:
  //  • New user (onboarding not seen)  → /onboarding
  //  • Returning user, not authed      → /onboarding (last slide)
  //  • Returning user, authed          → /(tabs)
  const showOnboarding = !onboardingSeen || !isAuthenticated;

  // Navigate imperatively so the native stack stays in sync with JS state.
  // <Redirect> rendered inside a Stack causes the "(tabs)" screen to be
  // removed natively while JS state doesn't track it, producing the warning.
  useEffect(() => {
    if (!isSessionHydrated || !isAuthHydrated) return;
    if (showOnboarding) {
      router.replace('/onboarding');
    }
  }, [isSessionHydrated, isAuthHydrated, showOnboarding, router]);

  // Block render until both stores have read from SecureStore
  if (!isSessionHydrated || !isAuthHydrated) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <MobileWalletProvider chain={chain} endpoint={endpoint} identity={identity}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding/index" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="loading" options={{ animation: 'fade', headerShown: false }} />
            <Stack.Screen name="game/index" options={{ animation: 'fade', headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="change-username" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>

          <StatusBar style="auto" />

          {/* Toast — must be last child so it renders above everything */}
          <Toast config={toastConfig} />
        </ThemeProvider>
      </MobileWalletProvider>
    </QueryClientProvider>
  );
}
