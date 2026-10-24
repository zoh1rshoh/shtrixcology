import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettings } from '../../src/store/settings';
import { SettingsSection, SettingsToggle } from '../../src/components/settings/SettingsRow';

const FONT_SIZES = [
  { key: 'small', label: 'Kichik', size: 13 },
  { key: 'medium', label: 'O\'rta', size: 15 },
  { key: 'large', label: 'Katta', size: 17 },
  { key: 'xlarge', label: 'Juda katta', size: 19 },
];

export default function AccessibilitySettings() {
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
          Foydalanish qulayligi
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* FONT SIZE */}
        <SettingsSection title="Shrift o'lchami">
          <View style={{ padding: 16 }}>
            <Text
              className="text-center mb-4"
              style={{
                fontSize: 16,
                color: '#111111',
                fontWeight: '600',
              }}
            >
              Namuna matni
            </Text>
            <View className="flex-row flex-wrap -mr-2">
              {FONT_SIZES.map((f) => {
                const active = settings.fontSize === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => set({ fontSize: f.key })}
                    className="rounded-xl px-4 py-3 mr-2 mb-2 flex-1"
                    style={{
                      backgroundColor: active ? '#111111' : '#F6F7F4',
                      borderWidth: 1,
                      borderColor: active ? '#111111' : '#ECEFE9',
                      minWidth: '22%',
                    }}
                  >
                    <Text
                      className="text-center font-bold"
                      style={{
                        fontSize: f.size,
                        color: active ? '#B8FF3D' : '#111111',
                      }}
                    >
                      Aa
                    </Text>
                    <Text
                      className="text-[10px] text-center mt-1"
                      style={{
                        color: active
                          ? 'rgba(255,255,255,0.5)'
                          : '#8A9187',
                      }}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </SettingsSection>

        {/* MOTION */}
        <SettingsSection title="Harakat">
          <SettingsToggle
            icon="footsteps-outline"
            label="Harakatni kamaytirish"
            description="Animatsiyalarni minimallashtirish"
            value={settings.reduceMotion}
            onValueChange={(v) => set({ reduceMotion: v })}
          />
        </SettingsSection>

        {/* CONTRAST */}
        <SettingsSection title="Kontrast">
          <SettingsToggle
            icon="contrast-outline"
            label="Yuqori kontrast"
            description="Matn va fon orasidagi farqni oshirish"
            value={settings.highContrast}
            onValueChange={(v) => set({ highContrast: v })}
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
              Foydalanish qulayligi
            </Text>
            <Text className="text-[11px] text-txt-muted mt-1 leading-4">
              Bu sozlamalar barcha ekranlarga ta'sir qiladi. Ba'zi
              o'zgarishlar uchun ilovani qayta ochish kerak bo'lishi mumkin.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}