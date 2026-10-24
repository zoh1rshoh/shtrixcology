import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { api } from '../../src/lib/api';
import type { ProviderInfo, ProviderStatus } from '@shtrixcology/api-client';
import { SettingsSection, SettingsDivider } from '../../src/components/settings/SettingsRow';

// ===========================================
// STATUS → UI
// ===========================================
const STATUS_LABEL: Record<ProviderStatus, string> = {
  not_configured: 'Sozlanmagan',
  connected: 'Ulangan',
  not_connected: 'Ulanmagan',
  reauthorization_required: 'Qayta ulanish kerak',
  capability_unavailable: 'Mavjud emas',
  temporarily_unavailable: 'Vaqtincha ishlamayapti',
};

const STATUS_COLOR: Record<ProviderStatus, string> = {
  not_configured: '#8A9187',
  connected: '#36B37E',
  not_connected: '#8A9187',
  reauthorization_required: '#F4B740',
  capability_unavailable: '#8A9187',
  temporarily_unavailable: '#E5484D',
};

export default function ConnectedAccounts() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.providers.list();
      setProviders(res.providers);
    } catch (e) {
      console.log('Providers load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const identities = providers.filter((p) => p.category === 'identity');
  const messaging = providers.filter((p) => p.category === 'messaging');

  return (
    <View className="flex-1 bg-eco">
      {/* HEADER */}
      <View className="bg-white pt-14 pb-3 px-5 border-b border-border-default flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 -ml-2 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </Pressable>
        <Text className="text-lg font-bold text-ink ml-1">
          Bog'langan hisoblar
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* INFO BANNER */}
        <View
          className="rounded-2xl p-4 mb-6 flex-row"
          style={{ backgroundColor: 'rgba(54,179,126,0.06)' }}
        >
          <Ionicons name="shield-checkmark" size={20} color="#36B37E" />
          <View className="flex-1 ml-3">
            <Text className="text-[13px] font-bold text-ink">
              Xavfsiz ulanish
            </Text>
            <Text className="text-[11px] text-txt-muted mt-1 leading-4">
              Barcha ulanishlar OAuth 2.0 orqali. Biz parolingizni
              ko'rmaymiz va saqlamaymiz.
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#111111" />
          </View>
        ) : (
          <>
            {/* SIGN-IN METHODS */}
            <SettingsSection title="Kirish usullari">
              {identities.map((p, idx) => (
                <View key={p.id}>
                  <ProviderRow provider={p} />
                  {idx < identities.length - 1 && <SettingsDivider />}
                </View>
              ))}
            </SettingsSection>

            {/* MESSAGING */}
            <SettingsSection title="Xabar va bildirishnoma">
              {messaging.map((p, idx) => (
                <View key={p.id}>
                  <ProviderRow provider={p} />
                  {idx < messaging.length - 1 && <SettingsDivider />}
                </View>
              ))}
            </SettingsSection>
          </>
        )}

        {/* SETUP INFO */}
        <View
          className="rounded-2xl p-4 mt-2 flex-row"
          style={{ backgroundColor: 'rgba(244,183,64,0.08)' }}
        >
          <Ionicons name="construct-outline" size={20} color="#F4B740" />
          <View className="flex-1 ml-3">
            <Text className="text-[13px] font-bold text-ink">
              Administrator sozlashi kerak
            </Text>
            <Text className="text-[11px] text-txt-muted mt-1 leading-4">
              Ba'zi integratsiyalar API kalitlar va tasdiqlashni talab qiladi.
              Ulanish imkoniyati admin panelida yoqiladi.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ===========================================
function ProviderRow({ provider }: { provider: ProviderInfo }) {
  const statusColor = STATUS_COLOR[provider.status];
  const statusLabel = STATUS_LABEL[provider.status];
  const isConnected = provider.status === 'connected';
  const isConfigured = provider.configured;

  const iconName = provider.icon as any;

  return (
    <View className="p-4">
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{
            backgroundColor: isConfigured ? '#F6F7F4' : '#ECEFE9',
          }}
        >
          <Ionicons
            name={iconName}
            size={24}
            color={isConfigured ? '#111111' : '#8A9187'}
          />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View className="flex-row items-center">
            <Text className="text-[15px] font-bold text-ink">
              {provider.name}
            </Text>
            {!isConfigured && (
              <View
                className="rounded-full px-2 py-0.5 ml-2"
                style={{ backgroundColor: 'rgba(244,183,64,0.15)' }}
              >
                <Text
                  className="text-[9px] font-bold"
                  style={{ color: '#F4B740' }}
                >
                  SOZLANMAGAN
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <View
              className="rounded-full mr-1.5"
              style={{
                width: 6,
                height: 6,
                backgroundColor: statusColor,
              }}
            />
            <Text
              className="text-[11px] font-semibold"
              style={{ color: statusColor }}
            >
              {statusLabel}
            </Text>
            {isConnected && provider.connection.externalId && (
              <Text
                className="text-[11px] text-txt-muted ml-2"
                numberOfLines={1}
              >
                · {provider.connection.externalId}
              </Text>
            )}
          </View>
        </View>

        {/* Action */}
        {isConfigured ? (
          isConnected ? (
            <Pressable
              onPress={() => {
                // TODO: Phase 2 — disconnect flow
              }}
              className="px-3 py-2 rounded-xl"
              style={{ backgroundColor: '#F6F7F4' }}
            >
              <Text className="text-[11px] font-bold text-ink">
                Boshqarish
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                // TODO: Phase 2 — OAuth flow
              }}
              className="px-3 py-2 rounded-xl"
              style={{ backgroundColor: '#111111' }}
            >
              <Text className="text-[11px] font-bold text-lime">
                Ulanish
              </Text>
            </Pressable>
          )
        ) : (
          <View
            className="px-3 py-2 rounded-xl"
            style={{ backgroundColor: '#ECEFE9' }}
          >
            <Text className="text-[11px] font-bold text-txt-muted">
              Mavjud emas
            </Text>
          </View>
        )}
      </View>

      {/* Capabilities */}
      {provider.capabilities.length > 0 && (
        <View className="mt-3 pl-15">
          {provider.capabilities.map((cap) => (
            <View key={cap.id} className="flex-row items-start mb-1.5">
              <Ionicons
                name={cap.available ? 'checkmark-circle' : 'lock-closed'}
                size={12}
                color={cap.available ? '#36B37E' : '#8A9187'}
                style={{ marginTop: 2 }}
              />
              <Text
                className="text-[11px] ml-2 flex-1 leading-4"
                style={{
                  color: cap.available ? '#4B5148' : '#8A9187',
                }}
              >
                {cap.description}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}