import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/store/auth';
import { SettingsSection } from '../../src/components/settings/SettingsRow';

export default function DataSettings() {
  const logout = useAuth((s) => s.logout);

  const [exportLoading, setExportLoading] = useState(false);
  const [exportDone, setExportDone] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await api.settings.requestExport();
      setExportDone(res.requestId);
    } catch (e: any) {
      console.log('Export error:', e);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.settings.deleteAccount();
      await logout();
      router.replace('/(auth)/login');
    } catch (e: any) {
      console.log('Delete error:', e);
      setDeleting(false);
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
          Ma'lumotlar
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* EXPORT */}
        <SettingsSection title="Eksport">
          <View style={{ padding: 16 }}>
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-lime/30">
                <Ionicons name="download-outline" size={20} color="#111111" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink">
                  Shaxsiy ma'lumotlarni yuklash
                </Text>
                <Text className="text-[11px] text-txt-muted mt-0.5 leading-4">
                  Passportlar, SHT tranzaksiyalar, jamoa va battle tarixi
                </Text>
              </View>
            </View>

            {exportDone ? (
              <View className="bg-lime/20 rounded-xl p-3 flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#36B37E" />
                <View className="flex-1 ml-2">
                  <Text className="text-[12px] font-bold text-ink">
                    So'rov qabul qilindi
                  </Text>
                  <Text className="text-[10px] text-txt-muted mt-0.5 font-mono">
                    {exportDone}
                  </Text>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handleExport}
                disabled={exportLoading}
                className="bg-ink rounded-xl py-3.5 items-center"
              >
                {exportLoading ? (
                  <ActivityIndicator color="#B8FF3D" size="small" />
                ) : (
                  <Text className="text-lime font-bold text-[13px]">
                    Eksport so'rash
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        </SettingsSection>

        {/* DEACTIVATE INFO */}
        <SettingsSection title="Hisobni faollashtirmaslik">
          <View style={{ padding: 16 }}>
            <Text className="text-[13px] text-txt-secondary leading-5">
              Hisobni vaqtincha faollashtirmaslik imkoniyati keyingi versiyada
              qo'shiladi. Hozircha hisobni faqat o'chirish mumkin.
            </Text>
          </View>
        </SettingsSection>

        {/* DANGER ZONE */}
        <View className="mt-2">
          <Text className="text-[10px] font-bold text-error uppercase tracking-widest mb-3 px-1">
            Xavfli harakatlar
          </Text>
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(229,72,77,0.2)',
            }}
          >
            <View style={{ padding: 16 }}>
              <View className="flex-row items-start mb-3">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: 'rgba(229,72,77,0.08)' }}
                >
                  <Ionicons name="trash" size={20} color="#E5484D" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-error">
                    Hisobni o'chirish
                  </Text>
                  <Text className="text-[11px] text-txt-muted mt-0.5 leading-4">
                    Barcha ma'lumotlar (passportlar, SHT, jamoa a'zoligi,
                    battle tarixi) qaytarib bo'lmaydigan tarzda o'chiriladi.
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setDeleteModal(true)}
                className="rounded-xl py-3 items-center"
                style={{ backgroundColor: 'rgba(229,72,77,0.08)' }}
              >
                <Text className="text-error font-bold text-[13px]">
                  Hisobni o'chirish
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* LEGAL */}
        <SettingsSection title="Huquqiy">
          <View className="p-4">
            <Text className="text-[11px] text-txt-muted leading-4">
              Maxfiylik siyosati va foydalanish shartlari keyingi versiyada
              qo'shiladi. Savollar uchun: support@shtrixcology.uz
            </Text>
          </View>
        </SettingsSection>
      </ScrollView>

      {/* DELETE MODAL */}
      <Modal visible={deleteModal} transparent animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(229,72,77,0.1)' }}
              >
                <Ionicons name="warning" size={32} color="#E5484D" />
              </View>
            </View>

            <Text className="text-[18px] font-bold text-ink text-center">
              Hisobni o'chirish?
            </Text>
            <Text className="text-[13px] text-txt-muted text-center mt-2 leading-5">
              Quyidagilar <Text className="font-bold text-error">butunlay</Text>{' '}
              o'chiriladi:
            </Text>
            <View className="mt-3 mb-4">
              {[
                "Barcha passportlar va qadoqlar tarixi",
                "SHT balansingiz va tranzaksiyalar",
                "Jamoa a'zoligi va battle tarixi",
                'Reyting va erishgan yutuqlar',
              ].map((txt) => (
                <View key={txt} className="flex-row items-center mb-1.5">
                  <View
                    className="rounded-full mr-2"
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor: '#E5484D',
                    }}
                  />
                  <Text className="text-[12px] text-txt-secondary flex-1">
                    {txt}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mb-2">
              Tasdiqlash uchun "DELETE" yozing
            </Text>
            <TextInput
              value={deleteConfirm}
              onChangeText={setDeleteConfirm}
              placeholder="DELETE"
              placeholderTextColor="#8A9187"
              autoCapitalize="characters"
              style={{
                backgroundColor: '#F6F7F4',
                borderWidth: 1,
                borderColor:
                  deleteConfirm === 'DELETE' ? '#36B37E' : '#ECEFE9',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: '#111111',
                textAlign: 'center',
                letterSpacing: 4,
                fontWeight: '700',
              }}
            />

            <View className="flex-row gap-2 mt-5">
              <Pressable
                onPress={() => {
                  setDeleteModal(false);
                  setDeleteConfirm('');
                }}
                className="flex-1 bg-eco rounded-xl py-3 items-center"
              >
                <Text className="text-ink font-bold text-[13px]">
                  Bekor
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                className="flex-1 rounded-xl py-3 items-center"
                style={{
                  backgroundColor:
                    deleteConfirm === 'DELETE' ? '#E5484D' : '#ECEFE9',
                }}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    style={{
                      color:
                        deleteConfirm === 'DELETE' ? '#FFFFFF' : '#8A9187',
                      fontWeight: '800',
                      fontSize: 13,
                    }}
                  >
                    O'chirish
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}