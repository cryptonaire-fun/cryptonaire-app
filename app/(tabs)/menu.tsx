import { useAuthStore } from '@/lib/store/auth.store';
import { selectUserProfile, useUserStore } from '@/lib/store/user.store';
import { Colors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Helper ───────────────────────────────────────────────────────────────────

function truncateAddress(address?: string) {
    if (!address || address.length < 8) return address ?? '—';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ─── Row component ────────────────────────────────────────────────────────────

interface MenuRowProps {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    onPress: () => void;
    danger?: boolean;
    right?: React.ReactNode;
    theme: typeof Colors.light;
}

function MenuRow({ icon, label, onPress, danger = false, right, theme }: MenuRowProps) {
    const color = danger ? theme.danger : theme.text;
    const iconBg = danger ? theme.dangerBg : theme.iconBg;

    return (
        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
            activeOpacity={0.1}
        >
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.rowLabel, { color }]}>{label}</Text>
            <View style={styles.rowRight}>
                {right ?? <Ionicons name="chevron-forward" size={18} color={danger ? theme.danger : theme.textTertiary} />}
            </View>
        </TouchableOpacity>
    );
}

// ─── Theme Selector ───────────────────────────────────────────────────────────

type SchemeOption = 'light' | 'dark' | 'system';

const SCHEME_OPTIONS: { value: SchemeOption; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
    { value: 'light', label: 'Light', icon: 'sunny' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'system', label: 'System', icon: 'phone-portrait' },
];

function ThemeSelector({
    current,
    onSelect,
    theme,
}: {
    current: SchemeOption;
    onSelect: (v: SchemeOption) => void;
    theme: typeof Colors.light;
}) {
    return (
        <View style={styles.themeRow}>
            {SCHEME_OPTIONS.map(({ value, label, icon }) => {
                const active = current === value;
                return (
                    <TouchableOpacity
                        key={value}
                        style={[
                            styles.themeOption,
                            { backgroundColor: theme.surfaceAlt, borderColor: 'transparent' },
                            active && { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.4)' },
                        ]}
                        onPress={() => onSelect(value)}
                        activeOpacity={0.1}
                    >
                        <Ionicons
                            name={icon}
                            size={16}
                            color={active ? '#3B82F6' : theme.textSecondary}
                        />
                        <Text style={[styles.themeOptionLabel, { color: active ? '#3B82F6' : theme.textSecondary }]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MenuScreen() {
    const profile = useUserStore(selectUserProfile);
    const signOut = useAuthStore((s) => s.signOut);
    const clearUser = useUserStore((s) => s.clear);

    const { colorScheme, setColorScheme } = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    // Track what the user explicitly chose; default to matching the current scheme
    const activeScheme: SchemeOption = (colorScheme as SchemeOption) ?? 'system';

    const walletDisplay = truncateAddress(profile?.walletAddress);
    const username = profile?.username
        ? `@${profile.username.toLowerCase()}`
        : (profile?.walletAddress ? `@${profile.walletAddress.slice(0, 8).toLowerCase()}` : '—');

    function handleChangeUsername() {
        router.push('/change-username');
    }
    function handleWithdrawTokens() {
        Alert.alert('Withdraw Tokens', 'This feature is coming soon.');
    }
    async function handleLogout() {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    clearUser();
                    router.replace('/onboarding' as any);
                },
            },
        ]);
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Header ──────────────────────────────────────────── */}
                <Text style={[styles.screenTitle, { color: theme.text }]}>Settings</Text>

                {/* ── Profile card ────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={28} color="#93C5FD" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileAddress, { color: theme.text }]} numberOfLines={1}>
                            {walletDisplay}
                        </Text>
                        <Text style={[styles.profileUsername, { color: theme.textSecondary }]}>{username}</Text>
                    </View>
                </View>

                {/* ── Appearance ───────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                    <View style={styles.row}>
                        <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
                            <Ionicons name="contrast" size={20} color={theme.icon} />
                        </View>
                        <Text style={[styles.rowLabel, { color: theme.text }]}>Appearance</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.divider, marginLeft: 16 }]} />
                    <View style={styles.themeContainer}>
                        <ThemeSelector
                            current={activeScheme}
                            onSelect={(v) => setColorScheme(v)}
                            theme={theme}
                        />
                    </View>
                </View>

                {/* ── Options ──────────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                    <MenuRow icon="pencil" label="Change Username" onPress={handleChangeUsername} theme={theme} />
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                    <MenuRow icon="wallet" label="Withdraw Tokens" onPress={handleWithdrawTokens} theme={theme} />
                </View>

                {/* ── Logout ───────────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                    <MenuRow icon="log-out" label="Log Out" onPress={handleLogout} theme={theme} danger />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingBottom: 120 },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: 12,
        marginBottom: 20,
        letterSpacing: -0.5,
    },

    // Card
    card: {
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },

    // Profile
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(59,130,246,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(59,130,246,0.3)',
        marginLeft: 16,
        marginVertical: 14,
        marginRight: 0,
    },
    profileInfo: { flex: 1, gap: 4, paddingLeft: 12, paddingRight: 16, paddingVertical: 14 },
    profileAddress: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
    profileUsername: { fontSize: 13, fontWeight: '500' },

    divider: { height: 1, marginLeft: 58 },

    // Row
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        gap: 12,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
    rowRight: { alignItems: 'center', justifyContent: 'center' },

    // Theme selector
    themeContainer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
    themeRow: { flexDirection: 'row', gap: 8 },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    themeOptionLabel: { fontSize: 13, fontWeight: '600' },
});
