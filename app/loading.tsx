import { useGameStore } from '@/lib/store/game.store';
import { Colors } from '@/lib/theme';
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
    const { level } = useLocalSearchParams<{ level: string }>();
    const { colorScheme } = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [dotCount, setDotCount] = useState(0);
    const dotInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasNavigated = useRef(false);

    const generateBatch = useGameStore((s) => s.generateBatch);
    const isGenerating = useGameStore((s) => s.isGenerating);
    const questions = useGameStore((s) => s.questions);
    const storeLevel = useGameStore((s) => s.level);

    // Only call generateBatch if the LevelMap didn't already start it for this level.
    // (LevelMap fires generateBatch on tap so generation is in-flight during navigation.)
    useEffect(() => {
        const parsedLevel = parseInt(level ?? "1", 10);
        const alreadyReady = (isGenerating || questions.length > 0) && storeLevel === parsedLevel;
        if (!alreadyReady) {
            generateBatch(parsedLevel);
        }
    }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

    // Navigate to game once questions are ready (and we haven't navigated yet)
    useEffect(() => {
        if (!isGenerating && questions.length > 0 && !hasNavigated.current) {
            hasNavigated.current = true;
            router.replace({
                pathname: "/game" as any,
                params: { level: level ?? "1" },
            });
        }
    }, [isGenerating, questions.length, level]);

    // Fallback: navigate anyway after 10 s in case generation errors
    useEffect(() => {
        const fallback = setTimeout(() => {
            if (!hasNavigated.current) {
                hasNavigated.current = true;
                router.replace({
                    pathname: "/game" as any,
                    params: { level: level ?? "1" },
                });
            }
        }, 10_000);
        return () => clearTimeout(fallback);
    }, [level]);

    // Animated dots
    useEffect(() => {
        dotInterval.current = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
        }, 500);
        return () => {
            if (dotInterval.current) clearInterval(dotInterval.current);
        };
    }, []);

    const dots = ".".repeat(dotCount);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LottieView
                source={require("@/assets/animations/loading.json")}
                autoPlay
                loop
                style={styles.animation}
            />
            <Text style={[styles.label, { color: theme.text }]}>
                Loading
                <Text style={styles.dots}>{dots}</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    animation: { width: 180, height: 180 },
    label: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 1,
        width: 120,
        textAlign: "center",
    },
    dots: { color: "#3B82F6" },
});
