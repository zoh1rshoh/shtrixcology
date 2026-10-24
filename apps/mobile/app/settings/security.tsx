import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SettingsSection, SettingsRow, SettingsDivider } from '../../src/components/settings/SettingsRow';

export default function SecuritySettings() {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reqLen = newPwd.length >= 8;
  const reqUpper = /[A-Z]/.test(newPwd);
  const reqNumber = /\d/.test(newPwd);
  const match = newPwd === confirmPwd && confirmPwd.length > 0;
  const canSubmit = oldPwd.length > 0 && reqLen && reqUpper && reqNumber && match;

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: backend endpoint kerak — POST /v1/auth/change-password
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
    }, 800);
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
          Xavfsizlik
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* PASSWORD CHANGE */}
        <SettingsSection title="Parolni o'zgartirish">
          <View style={{ padding: 16 }}>
            {done && (
              <View className="bg-lime/20 rounded-xl p-3 flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={18} color="#36B37E" />
                <Text className="text-[12px] font-bold text-ink ml-2">
                  Parol muvaffaqiyatli o'zgartirildi
                </Text>
              </View>
            )}

            <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mb-2">
              Hozirgi parol
            </Text>
            <TextInput
              value={oldPwd}
              onChangeText={setOldPwd}
              placeholder="••••••••"
              placeholderTextColor="#8A9187"
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              style={{
                backgroundColor: '#F6F7F4',
                borderWidth: 1,
                borderColor: '#ECEFE9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: '#111111',
                marginBottom: 14,
              }}
            />

            <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mb-2">
              Yangi parol
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F6F7F4',
                borderWidth: 1,
                borderColor: '#ECEFE9',
                borderRadius: 12,
                paddingHorizontal: 14,
                marginBottom: 8,
              }}
            >
              <TextInput
                value={newPwd}
                onChangeText={setNewPwd}
                placeholder="Kamida 8 belgi"
                placeholderTextColor="#8A9187"
                secureTextEntry={!showPwd}
                autoCapitalize="none"
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: '#111111',
                }}
              />
              <Pressable onPress={() => setShowPwd(!showPwd)} className="p-1">
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#8A9187"
                />
              </Pressable>
            </View>

            {/* Requirements */}
            <View className="mb-4">
              <RequirementItem label="Kamida 8 belgi" met={reqLen} />
              <RequirementItem label="1 ta katta harf" met={reqUpper} />
              <RequirementItem label="1 ta raqam" met={reqNumber} />
            </View>

            <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mb-2">
              Parolni tasdiqlang
            </Text>
            <TextInput
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              placeholder="••••••••"
              placeholderTextColor="#8A9187"
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              style={{
                backgroundColor: '#F6F7F4',
                borderWidth: 1,
                borderColor:
                  confirmPwd.length > 0 && !match ? '#E5484D' : '#ECEFE9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: '#111111',
              }}
            />
            {confirmPwd.length > 0 && !match && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="alert-circle" size={12} color="#E5484D" />
                <Text className="text-[11px] text-error ml-1.5">
                  Parollar mos kelmadi
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              className="rounded-xl py-3.5 items-center mt-5"
              style={{
                backgroundColor: canSubmit ? '#111111' : '#ECEFE9',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#B8FF3D" size="small" />
              ) : (
                <Text
                  className="font-bold text-[13px]"
                  style={{ color: canSubmit ? '#B8FF3D' : '#8A9187' }}
                >
                  Parolni o'zgartirish
                </Text>
              )}
            </Pressable>
          </View>
        </SettingsSection>

        {/* MFA — honest empty state */}
        <SettingsSection title="Ikki bosqichli tasdiqlash">
          <View style={{ padding: 16 }}>
            <View
              className="rounded-xl p-3 flex-row"
              style={{ backgroundColor: 'rgba(244,183,64,0.08)' }}
            >
              <Ionicons name="construct-outline" size={18} color="#F4B740" />
              <View className="flex-1 ml-3">
                <Text className="text-[13px] font-bold text-ink">
                  Tez orada
                </Text>
                <Text className="text-[11px] text-txt-muted mt-0.5 leading-4">
                  MFA backend infratuzilmasini talab qiladi. Soxta tugma
                  ko'rsatmaymiz.
                </Text>
              </View>
            </View>
          </View>
        </SettingsSection>

        {/* SESSIONS — honest empty state */}
        <SettingsSection title="Faol seanslar">
          <View style={{ padding: 16 }}>
            <View
              className="rounded-xl p-3 flex-row"
              style={{ backgroundColor: '#F6F7F4' }}
            >
              <Ionicons name="information-circle-outline" size={18} color="#8A9187" />
              <View className="flex-1 ml-3">
                <Text className="text-[13px] font-bold text-ink">
                  Hozircha mavjud emas
                </Text>
                <Text className="text-[11px] text-txt-muted mt-0.5 leading-4">
                  Hozirgi autentifikatsiya JWT (stateless) ishlatadi.
                  Seanslar ro'yxati keyingi versiyada qo'shiladi.
                </Text>
              </View>
            </View>
          </View>
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <View className="flex-row items-center mb-1.5">
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={met ? '#36B37E' : '#DDE1D9'}
      />
      <Text
        className="text-[11px] ml-2"
        style={{ color: met ? '#36B37E' : '#8A9187' }}
      >
        {label}
      </Text>
    </View>
  );
}