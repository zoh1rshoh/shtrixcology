import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettings } from '../../src/store/settings';
import { SettingsSection, SettingsToggle, SettingsDivider } from '../../src/components/settings/SettingsRow';

export default function NotificationSettings() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);

  if (!settings) return null;

  const set = (patch: any) => update(patch);

  return (
    <View className="flex-1 bg-eco">
      <View className="bg-white pt-14 pb-3 px-5 border-b border-border-default flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </Pressable>
        <Text className="text-lg font-bold text-ink ml-1">Bildirishnomalar</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <SettingsSection title="Yetkazish kanallari">
          <SettingsToggle
            icon="notifications-outline"
            label="Push bildirishnomalar"
            description="Qurilmangizga yuboriladi"
            value={settings.pushEnabled}
            onValueChange={(v) => set({ pushEnabled: v })}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="mail-outline"
            label="Email bildirishnomalar"
            description="Email manzilingizga yuboriladi"
            value={settings.emailEnabled}
            onValueChange={(v) => set({ emailEnabled: v })}
          />
        </SettingsSection>

        <SettingsSection title="Turlar">
          <SettingsToggle
            icon="cube-outline"
            label="Passport yangilanishlari"
            description="Passport holati o'zgarganda"
            value={settings.passportUpdates}
            onValueChange={(v) => set({ passportUpdates: v })}
            disabled={!settings.pushEnabled && !settings.emailEnabled}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="gift-outline"
            label="Mukofotlar"
            description="SHT va sovg'alar haqida"
            value={settings.rewardNotifications}
            onValueChange={(v) => set({ rewardNotifications: v })}
            disabled={!settings.pushEnabled && !settings.emailEnabled}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="calendar-outline"
            label="Haftalik hisobot"
            description="Har dushanba — natijalar"
            value={settings.weeklyDigest}
            onValueChange={(v) => set({ weeklyDigest: v })}
            disabled={!settings.emailEnabled}
          />
        </SettingsSection>

        <SettingsSection title="Marketing">
          <SettingsToggle
            icon="megaphone-outline"
            label="Aksiya va yangiliklar"
            description="SHTRIXCOLOGY yangiliklari"
            value={settings.marketingEmails}
            onValueChange={(v) => set({ marketingEmails: v })}
          />
        </SettingsSection>

        {/* Battle hint */}
        <Pressable
          onPress={() => router.push('/settings/battle')}
          className="bg-white rounded-2xl border border-border-default p-4 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-xl bg-lime/30 items-center justify-center mr-3">
            <Ionicons name="trophy-outline" size={19} color="#111111" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-ink">
              Battle bildirishnomalari
            </Text>
            <Text className="text-[11px] text-txt-muted mt-0.5">
              Alohida sozlamalarga o'tish
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#DDE1D9" />
        </Pressable>
      </ScrollView>
    </View>
  );
}