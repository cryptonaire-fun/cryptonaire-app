/**
 * Centralized color tokens for light and dark themes.
 * Usage:
 *   const { colorScheme } = useColorScheme();
 *   const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
 */
export interface ColorTheme {
    background: string;
    surface: string;
    surfaceBorder: string;
    surfaceAlt: string;
    divider: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    icon: string;
    iconBg: string;
    danger: string;
    dangerBg: string;
}

export const Colors: { light: ColorTheme; dark: ColorTheme } = {
    light: {
        background: '#F5F5F7',
        surface: '#FFFFFF',
        surfaceBorder: '#E5E7EB',
        surfaceAlt: '#F3F4F6',
        divider: '#E5E7EB',
        text: '#09090B',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        icon: '#3F3F46',
        iconBg: 'rgba(0,0,0,0.06)',
        danger: '#DC2626',
        dangerBg: 'rgba(220,38,38,0.10)',
    },
    dark: {
        background: '#0A0A0B',
        surface: '#18181B',
        surfaceBorder: '#27272A',
        surfaceAlt: '#111113',
        divider: '#27272A',
        text: '#E4E4E7',
        textSecondary: '#71717A',
        textTertiary: '#52525B',
        icon: '#E4E4E7',
        iconBg: 'rgba(255,255,255,0.07)',
        danger: '#EF4444',
        dangerBg: 'rgba(239,68,68,0.12)',
    },
};
