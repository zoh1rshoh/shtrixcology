import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '../../src/lib/api';
import { SettingsSection } from '../../src/components/settings/SettingsRow';

const CATEGORIES = [
  { key: 'bug', label: 'Xatolik', icon: 'bug-outline' as const },
  { key: 'account', label: 'Hisob', icon: 'person-outline' as const },
  { key: 'battle', label: 'Battle', icon: 'trophy-outline' as const },
  { key: 'team', label: 'Jamoa', icon: 'people-outline' as const },
  { key: 'abuse', label: 'Shikoyat', icon: 'alert-outline' as const },
  { key: 'other', label: 'Boshqa', icon: 'ellipsis-horizontal' as const },
];

export default function SupportSettings() {
  const [category, setCategory] = useState('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (subject.trim().length < 3) return;
    if (description.trim().length < 10) return;

    setSubmitting(true);
    try {
      const res = await api.settings.submitReport({
        category,
        subject: subject.trim(),
        description: description.trim(),
      });
      setTicketId(res.ticketId);
      setSubject('');
      setDescription('');
    } catch (e: any) {
      Alert.alert('Xato', e.message);
    } finally {
      setSubmitting(false);
    }
  };

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
          Yordam va xavfsizlik
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HELP CENTER */}
        <SettingsSection title="Yordam markazi">
          <View style={{ padding: 16 }}>
            <Text className="text-[13px] text-txt-secondary leading-5 mb-3">
              Savollaringizga javob topish uchun quyidagi kanallardan
              foydalaning:
            </Text>
            <View className="bg-eco rounded-xl p-3 mb-2 flex-row items-center">
              <Ionicons name="mail-outline" size={18} color="#111111" />
              <Text className="text-[13px] text-ink font-medium ml-3 flex-1">
                support@shtrixcology.uz
              </Text>
            </View>
            <View className="bg-eco rounded-xl p-3 flex-row items-center">
              <Ionicons name="paper-plane-outline" size={18} color="#111111" />
              <Text className="text-[13px] text-ink font-medium ml-3 flex-1">
                @shtrixcology_support
              </Text>
            </View>
          </View>
        </SettingsSection>

        {/* REPORT FORM */}
        <SettingsSection title="Muammoni xabar qilish">
          <View style={{ padding: 16 }}>
            {ticketId ? (
              <View className="bg-lime/20 rounded-2xl p-4 items-center">
                <Ionicons
                  name="checkmark-circle"
                  size={36}
                  color="#36B37E"
                />
                <Text className="text-[14px] font-bold text-ink mt-2">
                  Murojaat qabul qilindi
                </Text>
                <Text className="text-[11px] text-txt-muted mt-1 text-center leading-4">
                  Tez orada javob beramiz
                </Text>
                <Text className="text-[10px] font-mono text-txt-secondary mt-3">
                  Ticket: {ticketId}
                </Text>
                <Pressable
                  onPress={() => setTicketId(null)}
                  className="mt-3 px-4 py-2 rounded-full bg-ink"
                >
                  <Text className="text-lime text-[11px] font-bold">
                    Yana yuborish
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Category */}
                <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mb-2">
                  Kategoriya
                </Text>
                <View className="flex-row flex-wrap mb-4">
                  {CATEGORIES.map((c) => {
                    const active = category === c.key;
                    return (
                      <Pressable
                        key={c.key}
                        onPress={() => setCategory(c.key)}
                        className="mr-2 mb-2 px-3 py-2 rounded-xl border flex-row items-center"
                        style={{
                          borderColor: active ? '#111111' : '#ECEFE9',
                          backgroundColor: active ? '#111111' : '#FFFFFF',
                        }}
                      >
                        <Ionicons
                          name={c.icon}
                          size={13}
                          color={active ? '#B8FF3D' : '#111111'}
                        />
                        <Text
                          className="text-[11px] font-bold ml-1.5"
                          style={{
                            color: active ? '#B8FF3D' : '#111111',
                          }}
                        >
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Subject */}
                <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mb-2">
                  Mavzu
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Qisqacha muammo..."
                  placeholderTextColor="#8A9187"
                  maxLength={100}
                  style={{
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor: '#ECEFE9',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: '#111111',
                    marginBottom: 16,
                  }}
                />

                {/* Description */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">
                    Tavsif
                  </Text>
                  <Text className="text-[10px] text-txt-muted">
                    {description.length}/2000
                  </Text>
                </View>
                <TextInput
                  value={description}
                  onChangeText={(t) => setDescription(t.slice(0, 2000))}
                  placeholder="Muammoni batafsil yozing..."
                  placeholderTextColor="#8A9187"
                  multiline
                  maxLength={2000}
                  style={{
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor: '#ECEFE9',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: '#111111',
                    minHeight: 120,
                    textAlignVertical: 'top',
                    marginBottom: 16,
                  }}
                />

                <Pressable
                  onPress={handleSubmit}
                  disabled={
                    submitting ||
                    subject.length < 3 ||
                    description.length < 10
                  }
                  className="rounded-xl py-3.5 items-center"
                  style={{
                    backgroundColor:
                      subject.length >= 3 && description.length >= 10
                        ? '#111111'
                        : '#ECEFE9',
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#B8FF3D" size="small" />
                  ) : (
                    <Text
                      className="font-bold text-[13px]"
                      style={{
                        color:
                          subject.length >= 3 && description.length >= 10
                            ? '#B8FF3D'
                            : '#8A9187',
                      }}
                    >
                      Yuborish
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </SettingsSection>

        {/* DIAGNOSTICS */}
        <SettingsSection title="Diagnostika">
          <View style={{ padding: 16 }}>
            <View className="flex-row justify-between py-2">
              <Text className="text-[12px] text-txt-secondary">Versiya</Text>
              <Text className="text-[12px] text-ink font-mono">0.1.0</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-[12px] text-txt-secondary">Platforma</Text>
              <Text className="text-[12px] text-ink font-mono">
                Expo SDK 52
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-[12px] text-txt-secondary">Holat</Text>
              <View className="flex-row items-center">
                <View
                  className="rounded-full mr-1.5"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: '#36B37E',
                  }}
                />
                <Text className="text-[12px] text-success font-bold">
                  Faol
                </Text>
              </View>
            </View>
          </View>
        </SettingsSection>

        {/* COMMUNITY */}
        <SettingsSection title="Jamoa qoidalari">
          <View style={{ padding: 16 }}>
            <Text className="text-[12px] text-txt-secondary leading-5">
              SHTRIXCOLOGY — ekologik va hurmatli platforma. Qayta ishlash
              jarayonida aldash, soxta skanerlash, haqorat va spam qat'iyan
              taqiqlanadi. Buzarlik hisobning to'xtatilishiga olib keladi.
            </Text>
          </View>
        </SettingsSection>
      </ScrollView>
    </View>
  );
}