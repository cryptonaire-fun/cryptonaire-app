import { LeaderboardEntry } from '@/lib/api/leaderboard';
import { useLeaderboardQuery } from '@/lib/api/queries';
import { useAuthStore } from '@/lib/store/auth.store';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function truncateAddress(address: string) {
    if (!address || address.length < 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// ─── Entry Component ──────────────────────────────────────────────────────────

function LeaderboardRow({ item, isCurrentUser }: { item: LeaderboardEntry; isCurrentUser: boolean }) {
    let rankColor = 'text-zinc-500 dark:text-zinc-400';
    let rankBg = 'bg-zinc-200 dark:bg-zinc-800/80';

    if (item.rank === 1) {
        rankColor = 'text-yellow-500 dark:text-yellow-400';
        rankBg = 'bg-yellow-500/10 border border-yellow-500/30';
    } else if (item.rank === 2) {
        rankColor = 'text-zinc-500 dark:text-zinc-300';
        rankBg = 'bg-zinc-300/20 dark:bg-zinc-300/10 border border-zinc-400/30 dark:border-zinc-300/30';
    } else if (item.rank === 3) {
        rankColor = 'text-amber-600';
        rankBg = 'bg-amber-600/10 border border-amber-600/30';
    }

    return (
        <View className={`flex-row items-center p-4 mx-4 mb-2 rounded-2xl ${isCurrentUser ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'}`}>
            {/* Rank Badge */}
            <View className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${rankBg}`}>
                <Text className={`font-bold text-base ${rankColor}`}>{item.rank}</Text>
            </View>

            {/* User Info */}
            <View className="flex-1">
                <Text className="text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                    {truncateAddress(item.walletAddress)}
                </Text>
                {isCurrentUser && (
                    <Text className="text-brand-400 text-xs mt-0.5">You</Text>
                )}
            </View>

            {/* Points */}
            <View className="items-end">
                <Text className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">{item.points.toLocaleString()}</Text>
                <Text className="text-zinc-400 dark:text-zinc-500 text-xs">PTS</Text>
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
    const { data: response, isLoading, isError, refetch, isRefetching } = useLeaderboardQuery({ limit: 100 });
    const userWallet = useAuthStore((s) => s.user?.walletAddress);
    const entries = response?.data?.entries || [];

    return (
        <SafeAreaView className="flex-1 bg-gray-100 dark:bg-zinc-950" edges={['top']}>
            <View className="px-6 pt-4 pb-6">
                <Text className="text-zinc-900 dark:text-white text-3xl font-bold tracking-tight">Leaderboard</Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-1">Top players this week</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#60A5FA" />
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-zinc-500 dark:text-zinc-400 text-center mb-4">Failed to load leaderboard</Text>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item, index) => item.id || (item as any)._id || item.walletAddress || String(index)}
                    renderItem={({ item }) => (
                        <LeaderboardRow
                            item={item}
                            isCurrentUser={item.walletAddress === userWallet}
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor="#60A5FA"
                        />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center mt-20">
                            <Text className="text-zinc-400 dark:text-zinc-500 text-base">No players ranked yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
