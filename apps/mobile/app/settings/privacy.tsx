import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettings } from '../../src/store/settings';
import { SettingsSection, SettingsToggle, SettingsDivider } from '../../src/components/settings/SettingsRow';

const VISIBILITY_OPTIONS = [
  { key: 'public', label: 'Ommaviy', desc: 'Hamma ko\'radi' },
  { key: 'friends', label: 'Do\'stlar', desc: 'Faqat jamoadoshlar' },
  { key: 'private', label: 'Maxfiy', desc: 'Hech kim ko\'rmaydi' },
];

export default function PrivacySettings() {
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
        <Text className="text-lg font-bold text-ink ml-1">Maxfiylik</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <SettingsSection title="Profil ko'rinishi">
          <View style={{ padding: 16 }}>
            <Text className="text-[12px] text-txt-secondary leading-5 mb-4">
              Sizning profilingizni kim ko'ra olishini tanlang
            </Text>
            {VISIBILITY_OPTIONS.map((opt) => {
              const active = settings.profileVisibility === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => set({ profileVisibility: opt.key })}
                  className="rounded-xl p-3 mb-2 flex-row items-center"
                  style={{
                    backgroundColor: active ? '#111111' : '#F6F7F4',
                    borderWidth: 1,
                    borderColor: active ? '#111111' : '#ECEFE9',
                  }}
                >
                  <View
                    className="rounded-full items-center justify-center mr-3"
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: active ? '#B8FF3D' : '#FFFFFF',
                      borderWidth: active ? 0 : 2,
                      borderColor: '#DDE1D9',
                    }}
                  >
                    {active && (
                      <Ionicons name="checkmark" size={12} color="#111111" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      className="text-[14px] font-bold"
                      style={{ color: active ? '#B8FF3D' : '#111111' }}
                    >
                      {opt.label}
                    </Text>
                    <Text
                      className="text-[11px] mt-0.5"
                      style={{
                        color: active
                          ? 'rgba(255,255,255,0.5)'
                          : '#8A9187',
                      }}
                    >
                      {opt.desc}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </SettingsSection>

        <SettingsSection title="Faollik">
          <SettingsToggle
            icon="podium-outline"
            label="Reytinglarda ko'rinish"
            description="Global va shahar reytingida ko'rsatilish"
            value={settings.showInRankings}
            onValueChange={(v) => set({ showInRankings: v })}
          />
          <SettingsDivider />
          <SettingsToggle
            icon="location-outline"
            label="Joylashuvni ko'rsatish"
            description="Shahar va tuman ko'rsatiladi"
            value={settings.showLocation}
            onValueChange={(v) => set({ showLocation: v })}
          />
        </SettingsSection>

        <SettingsSection title="Chaqiriqlar">
          <SettingsToggle
            icon="mail-open-outline"
            label="Battle taklif qabul qilish"
            description="Boshqa jamoalardan takliflar"
            value={settings.allowInvites}
            onValueChange={(v) => set({ allowInvites: v })}
          />
        </SettingsSection>

        {/* INFO */}
        <View
          className="rounded-2xl p-4 flex-row"
          style={{ backgroundColor: 'rgba(124,92,252,0.06)' }}
        >
          <Ionicons name="information-circle" size={20} color="#7C5CFC" />
          <View className="flex-1 ml-3">
            <Text className="text-[12px] font-bold text-ink">
              Ma'lumot ko'rinishi
            </Text>
            <Text className="text-[11px] text-txt-muted mt-1 leading-4">
              Maxfiylik sozlamalari faqat ko'rinishni boshqaradi. Hisob
              xavfsizligi uchun zarur ma'lumotlar (masalan, telefon raqam
              tasdiqlash) har qanday holatda saqlanadi.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}