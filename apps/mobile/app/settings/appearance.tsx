import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettings } from '../../src/store/settings';
import { SettingsSection } from '../../src/components/settings/SettingsRow';

const THEMES = [
  { key: 'light', label: 'Yorug\'', icon: 'sunny-outline' as const },
  { key: 'dark', label: 'Qorong\'i', icon: 'moon-outline' as const },
  { key: 'system', label: 'Tizim', icon: 'phone-portrait-outline' as const },
];

const LANGUAGES = [
  { key: 'uz', label: "O'zbekcha", flag: '🇺🇿', available: true },
  { key: 'ru', label: 'Русский', flag: '🇷🇺', available: false },
  { key: 'en', label: 'English', flag: '🇬🇧', available: false },
];

export default function AppearanceSettings() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  if (!settings) return null;

  const set = (patch: any) => update(patch);

  return (
    <View className="flex-1 bg-eco">
      <View className="bg-white pt-14 pb-3 px-5 border-b border-border-default flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 -ml-2 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </Pressable>
        <Text className="text-lg font-bold text-ink ml-1">
          Ko'rinish va til
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* THEME */}
        <SettingsSection title="Mavzu">
          <View style={{ padding: 16 }}>
            <View
              className="rounded-xl p-3 mb-4 flex-row"
              style={{ backgroundColor: 'rgba(244,183,64,0.08)' }}
            >
              <Ionicons name="construct-outline" size={16} color="#F4B740" />
              <Text className="text-[11px] text-txt-secondary ml-3 flex-1 leading-4">
                Hozircha faqat yorug' mavzu to'liq ishlaydi. Qorong'i mavzu
                keyingi versiyada qo'shiladi.
              </Text>
            </View>

            <View className="flex-row gap-2">
              {THEMES.map((t) => {
                const active = settings.theme === t.key;
                const disabled = t.key === 'dark';
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => !disabled && set({ theme: t.key })}
                    disabled={disabled}
                    className="flex-1 rounded-xl items-center py-4"
                    style={{
                      backgroundColor: active ? '#111111' : '#F6F7F4',
                      borderWidth: 1,
                      borderColor: active ? '#111111' : '#ECEFE9',
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    <Ionicons
                      name={t.icon}
                      size={22}
                      color={active ? '#B8FF3D' : '#111111'}
                    />
                    <Text
                      className="text-[11px] font-bold mt-2"
                      style={{ color: active ? '#B8FF3D' : '#111111' }}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </SettingsSection>

        {/* LANGUAGE */}
        <SettingsSection title="Til">
          {LANGUAGES.map((l, idx) => {
            const active = settings.language === l.key;
            return (
              <View key={l.key}>
                <Pressable
                  onPress={() => l.available && set({ language: l.key })}
                  disabled={!l.available}
                  className="flex-row items-center p-4"
                  style={{ opacity: l.available ? 1 : 0.5 }}
                >
                  <Text style={{ fontSize: 22, marginRight: 12 }}>{l.flag}</Text>
                  <Text
                    className="text-[14px] font-semibold flex-1"
                    style={{ color: '#111111' }}
                  >
                    {l.label}
                  </Text>
                  {!l.available && (
                    <View
                      className="rounded-full px-2 py-0.5"
                      style={{ backgroundColor: '#ECEFE9' }}
                    >
                      <Text className="text-[9px] font-bold text-txt-muted uppercase">
                        Tez orada
                      </Text>
                    </View>
                  )}
                  {active && l.available && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#36B37E"
                    />
                  )}
                </Pressable>
                {idx < LANGUAGES.length - 1 && (
                  <View className="h-px bg-border-default ml-14" />
                )}
              </View>
            );
          })}
        </SettingsSection>
      </ScrollView>
    </View>
  );
}