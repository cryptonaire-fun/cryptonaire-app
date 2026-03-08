import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "outline" | "ghost" | "soft" | "danger" | "wallet";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Stretch button to full width */
    block?: boolean;
    /** Icon rendered to the left of the label */
    leftIcon?: ReactNode;
    /** Icon rendered to the right of the label */
    rightIcon?: ReactNode;
    /** Show a loading spinner and disable the button */
    loading?: boolean;
    /** Button label */
    children?: ReactNode;
    /** Extra NativeWind classes for the outer TouchableOpacity */
    className?: string;
    /** Extra NativeWind classes for the inner Text label */
    labelClassName?: string;
}

// ─── Variant maps ─────────────────────────────────────────────────────────────

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
    primary: "bg-primary",
    outline: "bg-transparent border border-zinc-300 dark:border-zinc-700",
    ghost: "bg-transparent",
    soft: "bg-amber-400/15",
    danger: "bg-red-500",
    wallet: "bg-amber-400",       // same amber base, gets a purple shadow via StyleSheet
};

const VARIANT_LABEL: Record<ButtonVariant, string> = {
    primary: "text-white",
    outline: "text-zinc-900 dark:text-zinc-100",
    ghost: "text-zinc-600 dark:text-zinc-300",
    soft: "text-amber-600 dark:text-amber-400",
    danger: "text-white",
    wallet: "text-zinc-950",
};

const VARIANT_INDICATOR_COLOR: Record<ButtonVariant, string> = {
    primary: "#ffffff",
    outline: "#a1a1aa",
    ghost: "#a1a1aa",
    soft: "#fbbf24",
    danger: "#ffffff",
    wallet: "#09090b",
};

// ─── Size maps ────────────────────────────────────────────────────────────────

const SIZE_CONTAINER: Record<ButtonSize, string> = {
    sm: "h-9  px-3 rounded-xl  gap-1.5",
    md: "h-11 px-4 rounded-2xl gap-2",
    lg: "h-14 px-5 rounded-2xl gap-2",
};

const SIZE_LABEL: Record<ButtonSize, string> = {
    sm: "text-sm  font-semibold",
    md: "text-[15px] font-bold",
    lg: "text-base font-bold",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
    variant = "primary",
    size = "md",
    block = false,
    leftIcon,
    rightIcon,
    loading = false,
    children,
    className,
    labelClassName,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            activeOpacity={0.82}
            disabled={isDisabled}
            style={[
                variant === "wallet" ? styles.walletShadow :
                    (variant === "ghost" || variant === "outline" ? null : styles.shadow),
                style,
            ]}
            className={cn(
                // Base
                "flex-row items-center justify-center",
                // Variant
                VARIANT_CONTAINER[variant],
                // Size
                SIZE_CONTAINER[size],
                // Block
                block && "w-full",
                // Disabled opacity
                isDisabled && "opacity-50",
                // Consumer overrides
                className,
            )}
            accessibilityRole="button"
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={VARIANT_INDICATOR_COLOR[variant]}
                />
            ) : (
                <>
                    {leftIcon && (
                        <View className="shrink-0">{leftIcon}</View>
                    )}

                    {children && (
                        <Text
                            className={cn(
                                "tracking-wide",
                                VARIANT_LABEL[variant],
                                SIZE_LABEL[size],
                                labelClassName,
                            )}
                        >
                            {children}
                        </Text>
                    )}

                    {rightIcon && (
                        <View className="shrink-0">{rightIcon}</View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
}

// ─── StyleSheet shadows (NativeWind can't handle these) ───────────────────────

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    walletShadow: {
        // Purple Solana-ish glow
        shadowColor: "#9945FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
    },
});
