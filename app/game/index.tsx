import { useColorScheme } from '@/hooks/use-color-scheme';
import { gameApi } from '@/lib/api/game';
import { selectCurrentQuestion, selectIsGameReady, useGameStore } from '@/lib/store/game.store';
import { ColorTheme, Colors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const POINTS_PER_CORRECT = 10;
const TOKENS_PER_CORRECT = 1;
/** Milliseconds before auto-advancing to the next question after an answer. */
const ANSWER_DELAY_MS = 1200;

// ─── Types ────────────────────────────────────────────────────────────────────

type AnswerState = "idle" | "correct" | "wrong";

// ─── Component ────────────────────────────────────────────────────────────────

export default function GameScreen() {
    const { level } = useLocalSearchParams<{ level: string }>();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const isDark = colorScheme === 'dark';

    // ── Store ─────────────────────────────────────────────────────────────────
    const question = useGameStore(selectCurrentQuestion);
    const isGameReady = useGameStore(selectIsGameReady);
    const isFetchingNext = useGameStore((s) => s.isFetchingNext);
    const totalAnswered = useGameStore((s) => s.totalAnswered);
    const totalCorrect = useGameStore((s) => s.totalCorrect);
    const answerQuestion = useGameStore((s) => s.answerQuestion);
    const generateError = useGameStore((s) => s.generateError);
    const reset = useGameStore((s) => s.reset);

    // ── Local UI state ────────────────────────────────────────────────────────
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answerState, setAnswerState] = useState<AnswerState>("idle");
    const [isLocked, setIsLocked] = useState(false); // prevent double-tap

    // Fade animation for the question card
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAnswer = useCallback(
        (option: string) => {
            if (isLocked || answerState !== "idle") return;

            setSelectedOption(option);
            setIsLocked(true);

            // Check answer — updates store counters and advances index
            const isCorrect = answerQuestion(option);
            setAnswerState(isCorrect ? "correct" : "wrong");

            // Award points/tokens fire-and-forget on correct answer
            if (isCorrect) {
                gameApi
                    .addToUserBoth({ points: POINTS_PER_CORRECT, tokens: TOKENS_PER_CORRECT })
                    .catch(() => { /* silently ignore */ });
            }

            // Fade out → advance → fade in
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    // Reset local UI state for next question
                    setSelectedOption(null);
                    setAnswerState("idle");
                    setIsLocked(false);

                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                });
            }, ANSWER_DELAY_MS);
        },
        [isLocked, answerState, answerQuestion, fadeAnim],
    );

    // Reset store when leaving (back navigation)
    useEffect(() => {
        return () => {
            // Only reset if navigating away, not on re-render
        };
    }, []);

    // ── Derived values ────────────────────────────────────────────────────────

    const parsedLevel = parseInt(level ?? "1", 10);
    const progressPercent = totalAnswered === 0 ? 0 : totalCorrect / Math.max(totalAnswered, 1);

    // Debug: log raw question shape once so we can verify server response format
    useEffect(() => {
        if (question) {
            console.log('[Game] question.options sample:', JSON.stringify(question.options));
            console.log('[Game] question.correctAnswer:', JSON.stringify(question.correctAnswer));
        }
    }, [question?.question]); // re-log on each new question

    // ── Render: error fallback ─────────────────────────────────────────────────

    if (generateError && !isGameReady) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={styles.centered}>
                    <Text style={[styles.errorTitle, { color: theme.danger ?? '#EF4444' }]}>
                        Could Not Load Questions
                    </Text>
                    <Text style={[styles.errorBody, { color: theme.textSecondary }]}>
                        {generateError}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryBtn, { borderColor: theme.surfaceBorder }]}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.retryBtnText, { color: theme.text }]}>← Back to Map</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Render: loading (should only flash briefly) ────────────────────────────

    if (!isGameReady || !question) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Preparing questions…
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Render: game ─────────────────────────────────────────────────────────

    return (
        <View className='pt-20' style={[styles.safeArea, { backgroundColor: theme.background }]}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { reset(); router.back(); }}
                    hitSlop={12}
                    style={[styles.backIconBtn, { backgroundColor: theme.iconBg }]}
                >
                    <Ionicons name="chevron-back" size={22} color={theme.icon} />
                </TouchableOpacity>

                <Text style={[styles.levelBadge, { color: theme.text }]}>Level {parsedLevel}</Text>

                {/* Right spacer — same width as back button to keep level centred */}
                <View style={styles.headerRight}>
                    {isFetchingNext && <ActivityIndicator size="small" color="#3B82F6" />}
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* ── Stats row ── */}
                <View style={styles.statsRow}>
                    <StatBadge label="Answered" value={totalAnswered} theme={theme} />
                    <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
                    <StatBadge label="Correct" value={totalCorrect} accent="#22C55E" theme={theme} />
                    <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
                    <StatBadge label="Wrong" value={totalAnswered - totalCorrect} accent="#EF4444" theme={theme} />
                </View>

                {/* ── Progress bar ── */}
                <View style={styles.progressSection}>
                    <View style={[styles.progressTrack, { backgroundColor: isDark ? '#27272A' : '#E5E7EB' }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${Math.round(progressPercent * 100)}%` as any },
                            ]}
                        />
                    </View>
                    <View style={styles.progressLabelRow}>
                        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                            {totalCorrect} correct
                        </Text>
                        <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>
                            {Math.round(progressPercent * 100)}%
                        </Text>
                        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                            {totalAnswered} attempted
                        </Text>
                    </View>
                </View>

                {/* ── Question Card ── */}
                <Animated.View
                    style={[
                        styles.questionCard,
                        { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, opacity: fadeAnim },
                    ]}
                >
                    <View style={styles.questionNumberRow}>
                        <View style={styles.questionNumberPill}>
                            <Text style={styles.questionNumberText}>Q{totalAnswered + 1}</Text>
                        </View>
                    </View>
                    <Text style={[styles.questionText, { color: theme.text }]}>
                        {question.question}
                    </Text>
                </Animated.View>

                {/* ── Options ── */}
                <Animated.View style={{ paddingHorizontal: 20, gap: 40, opacity: fadeAnim }}>
                    {question.options.map((option, idx) => {
                        const optionStr = typeof option === 'string' ? option : JSON.stringify(option);
                        const isSelected = selectedOption === option;
                        const showCorrect = answerState !== "idle" && option === question.correctAnswer;
                        const showWrong = isSelected && answerState === "wrong";

                        let bg = isDark ? '#18181B' : '#FFFFFF';
                        let border = isDark ? '#27272A' : '#E5E7EB';
                        let textColor = isDark ? '#E4E4E7' : '#09090B';
                        let labelBg = isDark ? '#27272A' : '#F3F4F6';

                        if (showCorrect) {
                            bg = 'rgba(34,197,94,0.12)';
                            border = '#22C55E';
                            textColor = '#22C55E';
                            labelBg = 'rgba(34,197,94,0.2)';
                        } else if (showWrong) {
                            bg = 'rgba(239,68,68,0.12)';
                            border = '#EF4444';
                            textColor = '#EF4444';
                            labelBg = 'rgba(239,68,68,0.2)';
                        }

                        const label = String.fromCharCode(65 + idx);

                        return (
                            <Pressable
                                key={`${idx}-${optionStr}`}
                                onPress={() => handleAnswer(option)}
                                className='flex flex-row items-center gap-4'
                                style={({ pressed }) => [
                                    {

                                        borderRadius: 16,
                                        borderWidth: 1.5,
                                        borderColor: isSelected ? (showCorrect ? '#22C55E' : '#EF4444') : border,
                                        backgroundColor: bg,
                                        paddingVertical: 16,
                                        paddingHorizontal: 16,
                                        gap: 14,
                                        // Subtle shadow for depth
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: isDark ? 0.3 : 0.04,
                                        shadowRadius: 4,
                                        elevation: 1,
                                    },
                                    pressed && answerState === 'idle' ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : null,
                                ]}
                            >
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        borderWidth: 1,
                                        borderColor: border,
                                    }}
                                >
                                    <Text className='text-primary' style={{ fontSize: 14, fontWeight: '800' }}>
                                        {label}
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        flex: 1,
                                        fontSize: 16,
                                        fontWeight: '600',
                                        lineHeight: 24,
                                        color: textColor,
                                    }}
                                    numberOfLines={3}
                                >
                                    {optionStr}
                                </Text>
                            </Pressable>
                        );
                    })}
                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─── Small helper component ────────────────────────────────────────────────────

function StatBadge({
    label,
    value,
    accent,
    theme,
}: {
    label: string;
    value: number;
    accent?: string;
    theme: ColorTheme;
}) {
    return (
        <View style={styles.statBadge}>
            <Text style={[styles.statValue, { color: accent ?? theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1 },

    // ── Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 10,
    },
    backIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelBadge: { flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    headerRight: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Stats
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 14,
    },
    statDivider: { width: 1, height: 32 },
    statBadge: { flex: 1, alignItems: 'center', gap: 3 },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },

    // ── Progress
    progressSection: { marginHorizontal: 20, marginBottom: 16, gap: 6 },
    progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#3B82F6' },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { fontSize: 12, fontWeight: '500' },

    // ── Question card
    questionCard: {
        marginHorizontal: 20,
        borderRadius: 18,
        borderWidth: 1,
        padding: 20,
        gap: 12,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    questionNumberRow: { flexDirection: 'row' },
    questionNumberPill: {
        backgroundColor: 'rgba(59,130,246,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    questionNumberText: { fontSize: 12, fontWeight: '700', color: '#3B82F6', letterSpacing: 0.5 },
    questionText: { fontSize: 17, fontWeight: '600', lineHeight: 26 },

    // ── Fallback screens
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
    loadingText: { fontSize: 16, fontWeight: '500' },
    errorTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
    errorBody: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
    retryBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        marginTop: 8,
    },
    retryBtnText: { fontSize: 15, fontWeight: '600' },
});
