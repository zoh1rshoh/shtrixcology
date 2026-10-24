import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { useSettings } from '../../src/store/settings';

const ALL_SETTINGS = [
    { key: 'account', title: 'Hisob va profil', desc: 'Ism, username, bio, rasm', icon: 'person-outline' as const, route: '/settings/account', section: 'HISOB', keywords: ['ism', 'username', 'bio', 'rasm', 'avatar', 'name'] },
    { key: 'security', title: 'Xavfsizlik va seanslar', desc: 'Parol, qurilmalar', icon: 'shield-checkmark-outline' as const, route: '/settings/security', section: 'HISOB', keywords: ['parol', 'password', 'seans', 'qurilma', 'session'] },
    { key: 'privacy', title: 'Maxfiylik', desc: "Ko'rinish va ruxsatlar", icon: 'lock-closed-outline' as const, route: '/settings/privacy', section: 'HISOB', keywords: ['maxfiy', 'privacy', 'ko\'rinish', 'visibility'] },
    { key: 'notifications', title: 'Bildirishnomalar', desc: 'Push, email sozlamalari', icon: 'notifications-outline' as const, route: '/settings/notifications', section: 'ILOVA', keywords: ['bildirishnoma', 'notification', 'push', 'email'] },
    { key: 'appearance', title: "Ko'rinish va til", desc: 'Mavzu, til, animatsiya', icon: 'color-palette-outline' as const, route: '/settings/appearance', section: 'ILOVA', keywords: ['mavzu', 'theme', 'til', 'language', 'dark', 'light'] },
    { key: 'accessibility', title: 'Foydalanish qulayligi', desc: 'Shrift, kontrast', icon: 'accessibility-outline' as const, route: '/settings/accessibility', section: 'ILOVA', keywords: ['shrift', 'font', 'kontrast', 'accessibility'] },
    { key: 'connected', title: "Bog'langan hisoblar", desc: 'Google, Telegram, Apple', icon: 'link-outline' as const, route: '/settings/connected', section: 'ULANISHLAR', keywords: ['google', 'telegram', 'apple', 'oauth', 'connect'] },
    { key: 'battle', title: 'Battle sozlamalari', desc: 'Musobaqa va jamoalar', icon: 'trophy-outline' as const, route: '/settings/battle', section: 'ULANISHLAR', keywords: ['battle', 'musobaqa', 'jamoa', 'team'] },
    { key: 'support', title: 'Yordam va xavfsizlik', desc: 'FAQ, shikoyat qilish', icon: 'help-buoy-outline' as const, route: '/settings/support', section: 'BOSHQA', keywords: ['yordam', 'support', 'help', 'shikoyat', 'report'] },
    { key: 'data', title: "Ma'lumotlar", desc: "Eksport, hisobni o'chirish", icon: 'folder-outline' as const, route: '/settings/data', section: 'BOSHQA', keywords: ['eksport', 'export', 'delete', 'o\'chirish', 'data'] },
];

const CATEGORIES = [
    { section: 'HISOB', items: ALL_SETTINGS.filter((s) => s.section === 'HISOB') },
    { section: 'ILOVA', items: ALL_SETTINGS.filter((s) => s.section === 'ILOVA') },
    { section: 'ULANISHLAR', items: ALL_SETTINGS.filter((s) => s.section === 'ULANISHLAR') },
    { section: 'BOSHQA', items: ALL_SETTINGS.filter((s) => s.section === 'BOSHQA') },
];

export default function SettingsHome() {
    const user = useAuth((s) => s.user);
    const settings = useSettings((s) => s.settings);
    const loadSettings = useSettings((s) => s.load);
    const [search, setSearch] = useState('');

    useFocusEffect(
        useCallback(() => {
            if (!settings) loadSettings();
        }, [settings, loadSettings])
    );

    const filtered = search.trim()
        ? CATEGORIES.map((cat) => ({
            ...cat,
            items: cat.items.filter((it: any) => {
                const q = search.toLowerCase();
                return (
                    it.title.toLowerCase().includes(q) ||
                    it.desc.toLowerCase().includes(q) ||
                    it.keywords.some((k: string) => k.includes(q))
                );
            }),
        })).filter((cat) => cat.items.length > 0)
        : CATEGORIES;

    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <View className="flex-1 bg-eco">
            {/* HEADER */}
            <View className="bg-white pt-14 pb-3 px-5 border-b border-border-default">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 -ml-2 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={22} color="#111111" />
                    </Pressable>
                    <Text className="text-lg font-bold text-ink ml-1">Sozlamalar</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* PROFILE SUMMARY */}
                <View className="px-5 mt-5">
                    <Pressable
                        onPress={() => router.push('/settings/account')}
                        className="bg-white rounded-3xl border border-border-default p-5 flex-row items-center"
                    >
                        <View
                            className="rounded-full items-center justify-center mr-4"
                            style={{
                                width: 60,
                                height: 60,
                                backgroundColor: '#B8FF3D',
                            }}
                        >
                            <Text className="text-ink font-bold text-xl">
                                {getInitials(settings?.displayName ?? user?.fullName ?? '')}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-ink" numberOfLines={1}>
                                {settings?.displayName ?? user?.fullName ?? 'Foydalanuvchi'}
                            </Text>
                            <Text className="text-xs text-txt-muted mt-0.5" numberOfLines={1}>
                                {user?.phone ?? user?.email ?? ''}
                            </Text>
                            <View className="flex-row items-center mt-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
                                <Text className="text-[11px] font-semibold text-success">
                                    Faol hisob
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#DDE1D9" />
                    </Pressable>
                </View>

                {/* SEARCH */}
                <View className="px-5 mt-5">
                    <View
                        className="bg-white rounded-2xl border border-border-default flex-row items-center px-4"
                        style={{ height: 48 }}
                    >
                        <Ionicons name="search" size={18} color="#8A9187" />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Sozlamalarni qidirish..."
                            placeholderTextColor="#8A9187"
                            className="flex-1 ml-2 text-[15px] text-ink"
                        />
                        {search.length > 0 && (
                            <Pressable onPress={() => setSearch('')} className="p-1">
                                <Ionicons name="close-circle" size={18} color="#DDE1D9" />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* CATEGORIES */}
                {filtered.map((cat) => (
                    <View key={cat.section} className="px-5 mt-7">
                        <Text className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-3">
                            {cat.section}
                        </Text>
                        <View className="bg-white rounded-2xl border border-border-default overflow-hidden">
                            {cat.items.map((it, idx) => (
                                <View key={it.key}>
                                    <Pressable
                                        onPress={() => router.push(it.route as any)}
                                        className="flex-row items-center p-4 active:bg-eco"
                                    >
                                        <View
                                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                            style={{ backgroundColor: '#F6F7F4' }}
                                        >
                                            <Ionicons name={it.icon} size={19} color="#111111" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[15px] font-semibold text-ink">
                                                {it.title}
                                            </Text>
                                            <Text className="text-[11px] text-txt-muted mt-0.5">
                                                {it.desc}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color="#DDE1D9"
                                        />
                                    </Pressable>
                                    {idx < cat.items.length - 1 && (
                                        <View className="h-px bg-border-default ml-16" />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
                {filtered.length === 0 && search.trim() && (
                    <View className="px-5 mt-12 items-center">
                        <View
                            className="rounded-full items-center justify-center mb-4"
                            style={{ width: 64, height: 64, backgroundColor: '#ECEFE9' }}
                        >
                            <Ionicons name="search" size={28} color="#8A9187" />
                        </View>
                        <Text className="text-[15px] font-bold text-ink">
                            Hech narsa topilmadi
                        </Text>
                        <Text className="text-[12px] text-txt-muted text-center mt-1">
                            Boshqa so'z bilan urinib ko'ring
                        </Text>
                    </View>
                )}
                {/* DANGER ZONE */}
                <View className="px-5 mt-7">
                    <Text className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-3">
                        XAVFLI HARAKATLAR
                    </Text>
                    <View className="bg-white rounded-2xl border border-error/20 overflow-hidden">
                        <Pressable
                            onPress={() => router.push('/settings/data')}
                            className="flex-row items-center p-4 active:bg-error/5"
                        >
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: 'rgba(229,72,77,0.08)' }}
                            >
                                <Ionicons name="trash-outline" size={19} color="#E5484D" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[15px] font-semibold text-error">
                                    Hisobni o'chirish
                                </Text>
                                <Text className="text-[11px] text-txt-muted mt-0.5">
                                    Barcha ma'lumotlar o'chiriladi
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#E5484D" />
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}