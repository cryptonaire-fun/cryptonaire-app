import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polygon } from 'react-native-svg';

// ─── Icon Components ──────────────────────────────────────────────────────────

function TrophyIcon({ color }: { color: string }) {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
                d="M6 2h12v6a6 6 0 01-12 0V2z"
                stroke={color}
                strokeWidth={1.8}
                strokeLinejoin="round"
            />
            <Path
                d="M6 2H3a1 1 0 00-1 1v2a4 4 0 004 4"
                stroke={color}
                strokeWidth={1.8}
                strokeLinejoin="round"
            />
            <Path
                d="M18 2h3a1 1 0 011 1v2a4 4 0 01-4 4"
                stroke={color}
                strokeWidth={1.8}
                strokeLinejoin="round"
            />
            <Path
                d="M12 14v4M9 22h6M12 14a6 6 0 006-6"
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path d="M9 22h6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
    );
}

function PlayIcon() {
    return (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="white">
            <Polygon points="6,3 20,12 6,21" fill="white" />
        </Svg>
    );
}

function MenuIcon({ color }: { color: string }) {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
                d="M4 6h16M4 12h16M4 18h16"
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="round"
            />
        </Svg>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TabItem {
    route: string;
    icon: (color: string) => React.ReactNode;
    isCenter?: boolean;
}

const TABS: TabItem[] = [
    {
        route: '/leaderboard',
        icon: (color) => <TrophyIcon color={color} />,
    },
    {
        route: '/',
        icon: () => <PlayIcon />,
        isCenter: true,
    },
    {
        route: '/menu',
        icon: (color) => <MenuIcon color={color} />,
    },
];

const ACTIVE_COLOR = '#60A5FA';
const INACTIVE_COLOR = '#6B7280';

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomTabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const isActive = (route: string) => {
        if (route === '/') return pathname === '/' || pathname === '/index';
        return pathname.startsWith(route);
    };

    return (
        <View
            style={[
                styles.wrapper,
                { bottom: Math.max(insets.bottom + 12, 24) },
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.pill} className='bg-zinc-800 dark:bg-gray-800'>
                {TABS.map((tab) => {
                    const active = isActive(tab.route);

                    if (tab.isCenter) {
                        return (
                            <TouchableOpacity
                                key={tab.route}
                                activeOpacity={0.8}
                                className='bg-brand-600 p-5 rounded-full'
                                onPress={() => router.push(tab.route as any)}
                                style={styles.centerButton}
                                hitSlop={10}
                            >
                                <PlayIcon />
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <Pressable
                            key={tab.route}
                            onPress={() => router.push(tab.route as any)}
                            style={({ pressed }) => [
                                styles.tabButton,
                                pressed && styles.tabButtonPressed,
                            ]}
                            hitSlop={10}
                        >
                            {tab.icon(active ? ACTIVE_COLOR : INACTIVE_COLOR)}
                            {active && <View style={styles.activeDot} />}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 24,
        right: 24,
        alignItems: 'center',
        zIndex: 100,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        // backgroundColor: '#1C1C1E',
        borderRadius: 40,
        height: 80,
        width: '100%',
        paddingHorizontal: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 20,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 4,
    },
    tabButtonPressed: {
        opacity: 0.6,
    },
    centerButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        // backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.55,
                shadowRadius: 12,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    centerButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: ACTIVE_COLOR,
    },
});
