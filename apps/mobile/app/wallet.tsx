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

const REASON_LABELS: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  submission_reward: { label: 'Passport uchun', icon: 'cube', color: '#36B37E' },
  redemption: { label: 'Sovg\'a uchun', icon: 'gift', color: '#E5484D' },
  bonus: { label: 'Bonus', icon: 'star', color: '#F4B740' },
  admin_adjust: { label: 'Admin tuzatdi', icon: 'settings', color: '#8A9187' },
  reversal: { label: 'Qaytarildi', icon: 'refresh', color: '#8A9187' },
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

  return (
    <View className="flex-1 bg-eco">
      {/* HEADER */}
      <View className="bg-ink pt-14 pb-8 px-5 rounded-b-3xl">
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white text-lg font-bold">Hamyon</Text>
        </View>

        {/* BALANCE */}
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-lime items-center justify-center mb-4">
            <Text className="text-ink text-xl font-bold">SHT</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#B8FF3D" size="large" />
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
          <Pressable
            onPress={() => {}}
            className="flex-1 bg-lime rounded-xl py-3 items-center"
          >
            <Text className="text-ink font-bold text-sm">Sovg'a olish</Text>
          </Pressable>
          <Pressable
            onPress={() => {}}
            className="flex-1 bg-white/10 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-bold text-sm">Tarix</Text>
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
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-ink">
              Tranzaksiyalar
            </Text>
            <Text className="text-xs text-txt-muted">
              {transactions.length} ta
            </Text>
          </View>

          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#111111" />
            </View>
          ) : transactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            <TransactionsList transactions={transactions} />
          )}
        </View>

        {/* INFO */}
        <View className="px-5 mt-6">
          <View className="bg-ink/5 rounded-2xl p-4 flex-row">
            <Ionicons name="information-circle" size={22} color="#8A9187" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-ink">SHT nima?</Text>
              <Text className="text-xs text-txt-secondary mt-1 leading-5">
                SHT — SHTRIXCOLOGY tokeni. Har bir qayta ishlangan qadoq uchun
                olasiz. Kelajakda sovg'alarga almashtirish, chegirmalar va
                boshqa imkoniyatlar.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ===========================================
// Transactions — sanalar bo'yicha guruhlangan
// ===========================================
function TransactionsList({ transactions }: { transactions: any[] }) {
  const grouped: Record<string, any[]> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) key = 'Bugun';
    else if (date.toDateString() === yesterday.toDateString()) key = 'Kecha';
    else
      key = date.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'long',
      });

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  });

  return (
    <>
      {Object.entries(grouped).map(([dateLabel, txs]) => (
        <View key={dateLabel} className="mb-5">
          <Text className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2 px-1">
            {dateLabel}
          </Text>
          <View className="bg-white rounded-2xl border border-border-default overflow-hidden">
            {txs.map((tx, idx) => {
              const meta = REASON_LABELS[tx.reason] ?? {
                label: tx.reason,
                icon: 'ellipse',
                color: '#8A9187',
              };
              const isPlus = tx.deltaPoints > 0;
              const time = new Date(tx.createdAt).toLocaleTimeString('uz-UZ', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={tx.id}>
                  <View className="flex-row items-center px-4 py-3.5">
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
                      <Text className="text-sm font-medium text-ink">
                        {meta.label}
                      </Text>
                      <Text className="text-[11px] text-txt-muted mt-0.5">
                        {time}
                      </Text>
                    </View>
                    <Text
                      className={`text-base font-bold ${
                        isPlus ? 'text-success' : 'text-error'
                      }`}
                    >
                      {isPlus ? '+' : ''}
                      {tx.deltaPoints}
                    </Text>
                  </View>
                  {idx < txs.length - 1 && (
                    <View className="h-px bg-border-default ml-16" />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </>
  );
}

function EmptyTransactions() {
  return (
    <View className="bg-white rounded-2xl border border-border-default p-8 items-center">
      <View className="w-16 h-16 rounded-full bg-eco-gray items-center justify-center mb-3">
        <Ionicons name="receipt-outline" size={28} color="#8A9187" />
      </View>
      <Text className="text-base font-bold text-ink">
        Hali tranzaksiya yo'q
      </Text>
      <Text className="text-sm text-txt-muted text-center mt-1">
        Birinchi passportingizni yaratib, SHT oling
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/scanner')}
        className="mt-4 bg-ink rounded-xl px-6 py-3"
      >
        <Text className="font-bold text-lime">Skanerlash</Text>
      </Pressable>
    </View>
  );
}