import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettings } from '../../src/store/settings';
import { SettingsSection, SettingsToggle, SettingsRow, SettingsDivider } from '../../src/components/settings/SettingsRow';

const BATTLE_TYPES = [
  { key: 'team', label: 'Team Battle' },
  { key: 'school', label: 'School Battle' },
  { key: 'city', label: 'City Battle' },
  { key: 'quick', label: 'Quick Battle' },
  { key: 'country', label: 'Country Battle' },
  { key: 'other', label: 'Other Battle' },
];

export default function BattleSettings() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);

  if (!settings) return null;

  const set = (patch: any) => update(patch);

  const preferredLabel =
    BATTLE_TYPES.find((t) => t.key === settings.preferredBattleType)?.label ??
    'Tanlanmagan';

  return (
    <View className="flex-1 bg-eco">
      <View className="bg-white pt-14 pb-3 px-5 border-b border-border-default flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </Pressable>
        <Text className="text-lg font-bold text-ink ml-1">Battle sozlamalari</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <SettingsSection title="Bildirishnomalar">
          <SettingsToggle
            icon="trophy-outline"
            label="Battle yangiliklari"
            description="Yangi battle, natijalar, chaqiriqlar"
            value={settings.battleNotifications}
            onValueChange={(v) => set({ battleNotifications: v })}
          />
        </SettingsSection>

        <SettingsSection title="Chaqiriqlar">
          <SettingsToggle
            icon="mail-unread-outline"
            label="Avtomatik qabul qilish"
            description="Jamoadoshlar chaqiriqlarini avtomatik qabul qilish"
            value={settings.autoAcceptInvites}
            onValueChange={(v) => set({ autoAcceptInvites: v })}
          />
        </SettingsSection>

        <SettingsSection title="Matchmaking">
          <SettingsRow
            icon="flash-outline"
            label="Sevimli battle turi"
            value={preferredLabel}
            onPress={() => {
              // Simple cycle — keyingi versiyada picker
              const idx = BATTLE_TYPES.findIndex(
                (t) => t.key === settings.preferredBattleType
              );
              const next = BATTLE_TYPES[(idx + 1) % BATTLE_TYPES.length];
              set({ preferredBattleType: next.key });
            }}
          />
          <SettingsDivider />
          <SettingsRow
            icon="location-outline"
            label="Matchmaking hududi"
            value={settings.matchmakingRegion ?? 'Global'}
            onPress={() => {
              const regions = ['global', 'uzbekistan', 'tashkent'];
              const idx = regions.indexOf(settings.matchmakingRegion ?? 'global');
              const next = regions[(idx + 1) % regions.length];
              set({ matchmakingRegion: next });
            }}
          />
        </SettingsSection>

        <SettingsSection title="Reyting">
          <SettingsToggle
            icon="podium-outline"
            label="Battle reytingida ko'rinish"
            description="Jamoaviy va individual reytingda ko'rinish"
            value={settings.showInBattleRanking}
            onValueChange={(v) => set({ showInBattleRanking: v })}
          />
        </SettingsSection>

        {/* Link to global notifications */}
        <Pressable
          onPress={() => router.push('/settings/notifications')}
          className="bg-white rounded-2xl border border-border-default p-4 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-xl bg-eco items-center justify-center mr-3">
            <Ionicons name="notifications-outline" size={19} color="#111111" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-ink">
              Umumiy bildirishnomalar
            </Text>
            <Text className="text-[11px] text-txt-muted mt-0.5">
              Push va email sozlamalari global
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#DDE1D9" />
        </Pressable>
      </ScrollView>
    </View>
  );
}