import { Button } from "@/components/ui/button/Button";
import { useToast } from "@/components/ui/popup/toast";
import { useVerifySignInMutation } from "@/lib/api/mutations";
import { useAuthStore } from "@/lib/store/auth.store";
import { useSessionStore } from "@/lib/store/sessionStore";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Assets ───────────────────────────────────────────────────────────────────

const Slide1 = require("@/assets/animations/coins.json");
const Slide2 = require("@/assets/animations/shield.json");
const Slide3 = require("@/assets/animations/trophy.json");

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
    {
        key: "learn",
        title: "Learn crypto, fast",
        text: "Quick questions. Bitesize explanations.",
        anim: Slide1,
    },
    {
        key: "fair",
        title: "Fair play",
        text: "Anti-fraud in place. Keep it clean.",
        anim: Slide2,
    },
    {
        key: "rank",
        title: "Climb the ranks",
        text: "Earn weekly points and badges.",
        anim: Slide3,
    },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cryptographically safe random hex nonce (16 bytes → 32 hex chars) */
function generateNonce(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}



// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const [index, setIndex] = useState(0);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const setOnboardingSeen = useSessionStore((s) => s.setOnboardingSeen);
    const storeSignIn = useAuthStore((s) => s.signIn);
    const router = useRouter();
    const toast = useToast();

    const fadeAnim = useRef(new Animated.Value(1)).current;

    const verifyMutation = useVerifySignInMutation();

    // ── Slide transitions ────────────────────────────────────────────────────

    const transitionTo = (nextIndex: number) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setIndex(nextIndex);
    };

    const handleSkip = async () => {
        await setOnboardingSeen(true);
        router.replace("/(tabs)");
    };

    // ── SIWS Sign-In ─────────────────────────────────────────────────────────

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            // transact() opens an MWA session and gives us unconstrained wallet access
            const authResult = await transact(async (wallet) => {
                const signInPayload = {
                    domain: "cryptonaire.app",
                    statement: "Sign in to Cryptonaire",
                    nonce: generateNonce(),
                    issuedAt: new Date().toISOString(),
                };

                return wallet.authorize({
                    identity: {
                        name: "Cryptonaire",
                        uri: "https://cryptonaire.app",
                        icon: "favicon.png",
                    },
                    chain: "solana:devnet",
                    sign_in_payload: signInPayload,
                });
            });

            // sign_in_result contains already-Base64-encoded signed_message + signature
            const signInResult = authResult?.sign_in_result;
            if (!signInResult) {
                throw new Error("Wallet did not return a sign-in result. Ensure your wallet supports SIWS.");
            }

            // MWA returns address as Base64, but the backend expects Base58
            const addressBytes = Uint8Array.from(atob(signInResult.address), (c) => c.charCodeAt(0));
            const base58Address = new PublicKey(addressBytes).toBase58();

            const payload = {
                address: base58Address,
                signedMessage: signInResult.signed_message,
                signature: signInResult.signature,
            };

            // Verify with backend → get JWT + user
            // Backend wraps response in { success, data: { token, user } }
            const { data: { token, user } } = await verifyMutation.mutateAsync(payload) as any;

            // Persist to SecureStore via auth store
            await storeSignIn(token, {
                id: user.walletAddress,
                walletAddress: user.walletAddress,
                username: user.username,
            });

            // Mark onboarding done + navigate home
            await setOnboardingSeen(true);
            router.replace("/(tabs)");

        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Something went wrong. Please try again.";

            const isCancelled =
                message.toLowerCase().includes("cancel") ||
                message.toLowerCase().includes("user rejected") ||
                message.toLowerCase().includes("session closed");

            if (!isCancelled) {
                toast.error("Sign-in failed", message);
                console.error("Sign-in", message, err)
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    const slide = SLIDES[index];
    const isLast = index === SLIDES.length - 1;

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-zinc-950">

            {/* ── Skip ──────────────────────────────────────────────────────── */}
            <View className="flex-row justify-end px-6 pt-2">
                {!isLast && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={handleSkip}
                        accessibilityLabel="Skip onboarding"
                    >
                        Skip
                    </Button>
                )}
            </View>

            {/* ── Main card ─────────────────────────────────────────────────── */}
            <View className="flex-1 items-center justify-center px-6">
                <Animated.View
                    style={[styles.card, { opacity: fadeAnim }]}
                    className="w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 items-center p-8 gap-6"
                >
                    {/* Lottie */}
                    <View className="h-52 w-52">
                        <LottieView source={slide.anim} autoPlay loop style={styles.lottie} />
                    </View>

                    {/* Text */}
                    <View className="items-center gap-2">
                        <Text className="text-zinc-900 dark:text-white text-2xl font-bold text-center tracking-tight">
                            {slide.title}
                        </Text>
                        <Text className="text-zinc-600 dark:text-zinc-400 text-base text-center leading-relaxed">
                            {slide.text}
                        </Text>
                    </View>

                    {/* CTA */}
                    {isLast ? (
                        <Button
                            variant="wallet"
                            size="lg"
                            block
                            loading={isSigningIn}
                            onPress={handleSignIn}
                            accessibilityLabel="Login via Wallet"
                            leftIcon={
                                <Text className="text-zinc-950 font-bold text-base">◎</Text>
                            }
                        >
                            Login via Wallet
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="lg"
                            block
                            onPress={() => transitionTo(index + 1)}
                            accessibilityLabel="Next slide"
                        >
                            Next
                        </Button>
                    )}
                </Animated.View>
            </View>

            {/* ── Dot indicator ─────────────────────────────────────────────── */}
            <View className="flex-row justify-center gap-2 pb-10">
                {SLIDES.map((_, idx) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => transitionTo(idx)}
                        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                        accessibilityLabel={`Go to slide ${idx + 1}`}
                    >
                        <View
                            className={`h-1.5 rounded-full ${idx === index ? "w-8 bg-brand-500" : "w-2 bg-zinc-300 dark:bg-zinc-700"
                                }`}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    lottie: {
        width: "100%",
        height: "100%",
    },
});
