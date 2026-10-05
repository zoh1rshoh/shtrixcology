import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { api } from '../src/lib/api';

interface WalletTransaction {
  id: string;
  deltaPoints: number;
  reason: string;
  createdAt: string;
  balanceAfter: number;
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

const REASON_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  submission_reward: { label: 'Passport uchun', icon: 'cube', color: '#22C55E' },
  redemption: { label: 'Sovg\'a uchun', icon: 'gift', color: '#EF4444' },
  bonus: { label: 'Bonus', icon: 'star', color: '#F59E0B' },
  admin_adjust: { label: 'Admin tuzatdi', icon: 'settings', color: '#737373' },
  reversal: { label: 'Qaytarildi', icon: 'refresh', color: '#737373' },
};

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.wallet.balance();
      setWallet(data);
    } catch (e) {
      console.log('Wallet error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions ?? [];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Hozir';
    if (diffMin < 60) return `${diffMin} daqiqa oldin`;
    if (diffHr < 24) return `${diffHr} soat oldin`;
    if (diffDay < 7) return `${diffDay} kun oldin`;

    return d.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-black pt-14 pb-8 px-5 rounded-b-3xl">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-1 -ml-1 mr-3">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white text-lg font-bold">Hamyon</Text>
        </View>

        {/* BALANCE */}
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-lime items-center justify-center mb-4">
            <Text className="text-black text-xl font-bold">SHT</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#BAFF59" size="large" />
          ) : (
            <>
              <Text className="text-white text-5xl font-bold">
                {balance.toLocaleString('uz-UZ')}
              </Text>
              <Text className="text-white/60 text-sm mt-2">
                SHTRIXCOLOGY Token
              </Text>
              <Text className="text-white/40 text-xs mt-1">
                ≈ {(balance * 10).toLocaleString('uz-UZ')} UZS
              </Text>
            </>
          )}
        </View>

        {/* ACTIONS */}
        <View className="flex-row mt-6 gap-2">
          <Pressable className="flex-1 bg-lime rounded-xl py-3 items-center">
            <Text className="text-black font-bold text-sm">
              Sovg'a olish
            </Text>
          </Pressable>
          <Pressable className="flex-1 bg-white/10 rounded-xl py-3 items-center">
            <Text className="text-white font-bold text-sm">
              Tarixni ko'rish
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* TRANSACTIONS */}
        <View className="px-5 mt-6">
          <Text className="text-base font-bold text-black mb-3">
            Tranzaksiyalar
          </Text>

          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#000" />
            </View>
          ) : transactions.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                <Ionicons name="receipt-outline" size={28} color="#A3A3A3" />
              </View>
              <Text className="text-base font-bold text-black">
                Hali tranzaksiya yo'q
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-1">
                Birinchi passportingizni yaratib, SHT oling
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/scanner')}
                className="mt-4 bg-lime rounded-xl px-6 py-3"
              >
                <Text className="font-bold text-black">Skanerlash</Text>
              </Pressable>
            </View>
          ) : (
            <View className="bg-white rounded-2xl overflow-hidden">
              {transactions.map((tx, idx) => {
                const meta =
                  REASON_LABELS[tx.reason] ?? {
                    label: tx.reason,
                    icon: 'ellipse',
                    color: '#737373',
                  };
                const isPlus = tx.deltaPoints > 0;

                return (
                  <View key={tx.id}>
                    <View className="flex-row items-center px-4 py-4">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${meta.color}15` }}
                      >
                        <Ionicons
                          name={meta.icon as any}
                          size={20}
                          color={meta.color}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-medium text-black">
                          {meta.label}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {formatDate(tx.createdAt)}
                        </Text>
                      </View>
                      <Text
                        className={`text-base font-bold ${
                          isPlus ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {isPlus ? '+' : ''}
                        {tx.deltaPoints}
                      </Text>
                    </View>
                    {idx < transactions.length - 1 && (
                      <View className="h-px bg-gray-100 ml-16" />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* INFO */}
        <View className="px-5 mt-6">
          <View className="bg-black/5 rounded-2xl p-4 flex-row">
            <Ionicons name="information-circle" size={22} color="#737373" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-black">
                SHT nima?
              </Text>
              <Text className="text-xs text-gray-600 mt-1 leading-5">
                SHT — SHTRIXCOLOGY tokeni. Har bir qayta ishlangan qadoq uchun olasiz.
                Kelajakda sovg'alarga almashtirish, chegirmalar va boshqa imkoniyatlar.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}