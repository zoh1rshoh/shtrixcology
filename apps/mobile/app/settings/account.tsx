import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { useSettings } from '../../src/store/settings';
import { api } from '../../src/lib/api';
import {
  SettingsSection,
  SettingsRow,
  SettingsDivider,
} from '../../src/components/settings/SettingsRow';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function AccountSettings() {
  const user = useAuth((s) => s.user);
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const saving = useSettings((s) => s.saving);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [confirmClose, setConfirmClose] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Load
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.displayName ?? '');
      setUsername(settings.username ?? '');
      setBio(settings.bio ?? '');
    }
  }, [settings]);

  // Dirty check
  const isDirty = useMemo(() => {
    if (!settings) return false;
    return (
      (settings.displayName ?? '') !== displayName ||
      (settings.username ?? '') !== username.toLowerCase() ||
      (settings.bio ?? '') !== bio
    );
  }, [settings, displayName, username, bio]);

  // Username debounce check
  useEffect(() => {
    const current = settings?.username ?? '';
    const clean = username.toLowerCase().trim();

    if (!clean || clean === current) {
      setUsernameStatus('idle');
      return;
    }

    if (!/^[a-z0-9_]*$/.test(clean)) {
      setUsernameStatus('invalid');
      return;
    }

    if (clean.length < 3 || clean.length > 20) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.settings.checkUsername(clean);
        setUsernameStatus(res.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, settings?.username]);

  // Close handler with dirty check
  const handleBack = () => {
    if (isDirty) {
      setConfirmClose(true);
      return;
    }
    router.back();
  };

  const handleSave = async () => {
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return;
    if (displayName.trim().length < 2) return;

    try {
      await update({
        displayName: displayName.trim() || null,
        username: username.trim() ? username.toLowerCase().trim() : null,
        bio: bio.trim() || null,
      });
      router.back();
    } catch (e) {
      console.log('Save error:', e);
    }
  };

  const handleDiscard = () => {
    if (settings) {
      setDisplayName(settings.displayName ?? '');
      setUsername(settings.username ?? '');
      setBio(settings.bio ?? '');
    }
    setConfirmClose(false);
    router.back();
  };

  if (!settings) {
    return (
      <View className="flex-1 bg-eco items-center justify-center">
        <ActivityIndicator color="#111111" />
      </View>
    );
  }

  const nameValid = displayName.trim().length >= 2;
  const usernameValid =
    usernameStatus === 'idle' || usernameStatus === 'available';
  const canSave = isDirty && nameValid && usernameValid && !saving;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-eco">
        {/* HEADER */}
        <View className="bg-white pt-14 pb-3 px-5 border-b border-border-default">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Pressable
                onPress={handleBack}
                className="w-10 h-10 -ml-2 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={22} color="#111111" />
              </Pressable>
              <Text className="text-lg font-bold text-ink ml-1">
                Hisob va profil
              </Text>
            </View>

            {isDirty && (
              <Pressable
                onPress={() => setPreviewVisible(true)}
                className="flex-row items-center px-3 py-1.5 rounded-full bg-eco"
              >
                <Ionicons name="eye-outline" size={14} color="#111111" />
                <Text className="text-[11px] font-bold text-ink ml-1">
                  Ko'rinish
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* PROFILE PHOTO */}
          <View className="items-center mb-6">
            <Pressable className="relative">
              <View
                className="rounded-full items-center justify-center"
                style={{
                  width: 96,
                  height: 96,
                  backgroundColor: '#B8FF3D',
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                }}
              >
                <Text className="text-ink font-bold text-3xl">
                  {(displayName || user?.fullName || '?')
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View
                className="absolute bottom-0 right-0 rounded-full items-center justify-center border-2 border-white"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#111111',
                }}
              >
                <Ionicons name="camera" size={14} color="#B8FF3D" />
              </View>
            </Pressable>
            <Text className="text-[11px] text-txt-muted mt-3">
              Rasmni o'zgartirish
            </Text>
          </View>

          {/* PERSONAL INFO */}
          <SettingsSection title="Shaxsiy ma'lumotlar">
            <View style={{ padding: 16 }}>
              {/* Display name */}
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">
                    Ko'rsatiladigan ism
                  </Text>
                  <Text
                    className={`text-[10px] ${
                      displayName.length > 50
                        ? 'text-error'
                        : 'text-txt-muted'
                    }`}
                  >
                    {displayName.length}/50
                  </Text>
                </View>
                <TextInput
                  value={displayName}
                  onChangeText={(t) => setDisplayName(t.slice(0, 50))}
                  placeholder={user?.fullName ?? 'Ismingiz'}
                  placeholderTextColor="#8A9187"
                  maxLength={50}
                  style={{
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor:
                      displayName.length > 0 && !nameValid
                        ? '#E5484D'
                        : '#ECEFE9',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: '#111111',
                  }}
                />
                {displayName.length > 0 && !nameValid && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="alert-circle" size={12} color="#E5484D" />
                    <Text className="text-[11px] text-error ml-1.5">
                      Kamida 2 ta harf
                    </Text>
                  </View>
                )}
              </View>

              {/* Username */}
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">
                    Username
                  </Text>
                  <Text
                    className={`text-[10px] ${
                      username.length > 20 ? 'text-error' : 'text-txt-muted'
                    }`}
                  >
                    {username.length}/20
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor:
                      usernameStatus === 'taken' ||
                      usernameStatus === 'invalid'
                        ? '#E5484D'
                        : usernameStatus === 'available'
                        ? '#36B37E'
                        : '#ECEFE9',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#8A9187',
                      fontWeight: '600',
                    }}
                  >
                    @
                  </Text>
                  <TextInput
                    value={username}
                    onChangeText={(t) =>
                      setUsername(
                        t.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
                      )
                    }
                    placeholder="username"
                    placeholderTextColor="#8A9187"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      fontSize: 15,
                      color: '#111111',
                      marginLeft: 4,
                    }}
                  />
                  {usernameStatus === 'checking' && (
                    <ActivityIndicator size="small" color="#8A9187" />
                  )}
                  {usernameStatus === 'available' && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#36B37E"
                    />
                  )}
                  {(usernameStatus === 'taken' ||
                    usernameStatus === 'invalid') && (
                    <Ionicons name="close-circle" size={20} color="#E5484D" />
                  )}
                </View>
                {usernameStatus === 'available' && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="checkmark-circle" size={12} color="#36B37E" />
                    <Text className="text-[11px] text-success ml-1.5">
                      Bu username bo'sh
                    </Text>
                  </View>
                )}
                {usernameStatus === 'taken' && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="alert-circle" size={12} color="#E5484D" />
                    <Text className="text-[11px] text-error ml-1.5">
                      Bu username allaqachon band
                    </Text>
                  </View>
                )}
                {usernameStatus === 'invalid' && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="alert-circle" size={12} color="#E5484D" />
                    <Text className="text-[11px] text-error ml-1.5">
                      3-20 belgi, faqat a-z, 0-9 va _
                    </Text>
                  </View>
                )}
                {usernameStatus === 'idle' && username.length === 0 && (
                  <Text className="text-[11px] text-txt-muted mt-2">
                    Username ixtiyoriy. 3-20 belgi, faqat a-z, 0-9 va _
                  </Text>
                )}
              </View>

              {/* Bio */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">
                    Bio
                  </Text>
                  <Text
                    className={`text-[10px] ${
                      bio.length > 200 ? 'text-error' : 'text-txt-muted'
                    }`}
                  >
                    {bio.length}/200
                  </Text>
                </View>
                <TextInput
                  value={bio}
                  onChangeText={(t) => setBio(t.slice(0, 200))}
                  placeholder="O'zingiz haqingizda qisqacha..."
                  placeholderTextColor="#8A9187"
                  multiline
                  maxLength={200}
                  style={{
                    backgroundColor: '#F6F7F4',
                    borderWidth: 1,
                    borderColor: '#ECEFE9',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: '#111111',
                    minHeight: 90,
                    textAlignVertical: 'top',
                  }}
                />
              </View>
            </View>
          </SettingsSection>

          {/* CONTACTS */}
          <SettingsSection title="Aloqa">
            <SettingsRow
              icon="call-outline"
              label="Telefon"
              value={user?.phone ?? '—'}
              showChevron={false}
            />
            <SettingsDivider />
            <SettingsRow
              icon="mail-outline"
              label="Email"
              value={user?.email ?? "Qo'shilmagan"}
              showChevron={false}
            />
            <SettingsDivider />
            <SettingsRow
              icon="location-outline"
              label="Shahar"
              value={user?.city ?? "Ko'rsatilmagan"}
              showChevron={false}
            />
          </SettingsSection>

          {/* ACCOUNT STATUS */}
          <SettingsSection title="Hisob holati">
            <View
              style={{
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(54,179,126,0.1)' }}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color="#36B37E"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-[15px] font-semibold text-ink">
                  Faol
                </Text>
                <Text className="text-[11px] text-txt-muted mt-0.5">
                  Hisobingiz tasdiqlangan
                </Text>
              </View>
            </View>
          </SettingsSection>
        </ScrollView>

        {/* STICKY SAVE BAR */}
        {isDirty && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#ECEFE9',
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 28,
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <Pressable
              onPress={() => {
                if (settings) {
                  setDisplayName(settings.displayName ?? '');
                  setUsername(settings.username ?? '');
                  setBio(settings.bio ?? '');
                }
              }}
              style={{
                paddingHorizontal: 20,
                height: 52,
                borderRadius: 14,
                backgroundColor: '#F6F7F4',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="text-ink font-bold text-[13px]">Bekor</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 14,
                backgroundColor: canSave ? '#111111' : '#ECEFE9',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              {saving ? (
                <ActivityIndicator color="#B8FF3D" />
              ) : (
                <>
                  <Text
                    style={{
                      color: canSave ? '#B8FF3D' : '#8A9187',
                      fontWeight: '800',
                      fontSize: 14,
                    }}
                  >
                    Saqlash
                  </Text>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={canSave ? '#B8FF3D' : '#8A9187'}
                    style={{ marginLeft: 6 }}
                  />
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {/* UNSAVED CONFIRM */}
      <Modal visible={confirmClose} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View className="w-14 h-14 rounded-full bg-warning/10 items-center justify-center">
                <Ionicons name="alert-circle" size={28} color="#F4B740" />
              </View>
            </View>
            <Text className="text-[17px] font-bold text-ink text-center">
              O'zgarishlar saqlanmagan
            </Text>
            <Text className="text-[13px] text-txt-muted text-center mt-2">
              Saqlamasdan chiqsangiz, o'zgarishlar yo'qoladi
            </Text>
            <View className="flex-row gap-2 mt-6">
              <Pressable
                onPress={() => setConfirmClose(false)}
                className="flex-1 bg-eco rounded-xl py-3 items-center"
              >
                <Text className="text-ink font-bold text-[13px]">
                  Qolish
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDiscard}
                className="flex-1 bg-error rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold text-[13px]">
                  Chiqish
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal visible={previewVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-border-default">
              <View>
                <Text className="text-lg font-bold text-ink">
                  Ko'rinish
                </Text>
                <Text className="text-xs text-txt-muted mt-0.5">
                  Boshqa foydalanuvchilar ko'radi
                </Text>
              </View>
              <Pressable
                onPress={() => setPreviewVisible(false)}
                className="w-9 h-9 rounded-full bg-eco items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#111111" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View className="bg-eco rounded-2xl p-5 border border-border-default">
                <View className="flex-row items-center">
                  <View
                    className="rounded-full items-center justify-center mr-4"
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: '#B8FF3D',
                    }}
                  >
                    <Text className="text-ink font-bold text-2xl">
                      {(displayName || '?').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-[17px] font-bold text-ink">
                      {displayName || 'Ism kiritilmagan'}
                    </Text>
                    {username ? (
                      <Text className="text-[13px] text-txt-muted mt-0.5">
                        @{username.toLowerCase()}
                      </Text>
                    ) : (
                      <Text className="text-[13px] text-txt-muted mt-0.5">
                        @username_yoq
                      </Text>
                    )}
                    {bio ? (
                      <Text
                        className="text-[13px] text-txt-secondary mt-2 leading-5"
                        numberOfLines={3}
                      >
                        {bio}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              <Text className="text-[11px] text-txt-muted text-center mt-4">
                Bu faqat oldindan ko'rish. Bu ma'lumotlar maxfiylik
                sozlamalariga ko'ra ko'rinadi.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}