import { Button } from '@/components/ui/button/Button';
import { useToast } from '@/components/ui/popup/toast';
import { useUpdateUsernameMutation } from '@/lib/api/mutations';
import { selectUserProfile, useUserStore } from '@/lib/store/user.store';
import { Colors } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangeUsernameScreen() {
    const profile = useUserStore(selectUserProfile);
    const { colorScheme } = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const toast = useToast();

    const [username, setUsername] = useState(profile?.username || '');
    const updateMutation = useUpdateUsernameMutation();

    const handleSave = async () => {
        const trimmed = username.trim();
        if (trimmed.length < 3 || trimmed.length > 30) {
            toast.error('Invalid Username', 'Username must be between 3 and 30 characters.');
            return;
        }

        try {
            await updateMutation.mutateAsync({ username: trimmed });
            toast.success('Success', 'Your username has been updated!');
            router.back();
        } catch (error: any) {
            const message = error?.response?.data?.error || error.message || 'Failed to update username';
            toast.error('Error', message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => router.back()}
                        className="px-2"
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.icon} />
                    </Button>
                    <Text style={[styles.title, { color: theme.text }]}>Change Username</Text>
                    <View style={styles.headerRight} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>
                        Choose a unique display name (3-30 characters). This is how other players will see you on the leaderboard.
                    </Text>

                    <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                        <Text style={[styles.atSymbol, { color: theme.textTertiary }]}>@</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="username"
                            placeholderTextColor={theme.textTertiary}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={30}
                            returnKeyType="done"
                            onSubmitEditing={handleSave}
                        />
                    </View>

                    <Button
                        variant="primary"
                        block
                        loading={updateMutation.isPending}
                        onPress={handleSave}
                        disabled={!username.trim() || username.trim() === profile?.username}
                        className="mt-6"
                    >
                        Save Username
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    label: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    atSymbol: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 4,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
});
