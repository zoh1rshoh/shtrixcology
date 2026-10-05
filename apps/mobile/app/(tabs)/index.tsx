import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { api } from '../../src/lib/api';

interface WalletData {
  balance: number;
  transactions: any[];
}

interface Stats {
  passports: number;
  recycled: number;
  co2Kg: number;
  streak: number;
}

export default function Home() {
  const user = useAuth((s) => s.user);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [stats, setStats] = useState<Stats>({
    passports: 0,
    recycled: 0,
    co2Kg: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [walletData, passportsData] = await Promise.all([
        api.wallet.balance(),
        api.passports.list(),
      ]);
      setWallet(walletData);

      // Stats hisoblash
      const passports = passportsData.passports ?? [];
      const recycled = passports.filter(
        (p) => p.state === 'recycled' || p.state === 'reborn'
      );
      const totalCo2 = passports.reduce((sum, p) => {
        const weight = p.declaredWeight ?? 0;
        return sum + weight * 1.4; // g CO2 taxminan
      }, 0);

      setStats({
        passports: passports.length,
        recycled: recycled.length,
        co2Kg: Math.round((totalCo2 / 1000) * 100) / 100,
        streak: 0, // keyingi
      });
    } catch (e) {
      console.log('Home load error:', e);
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
  const firstName = user?.fullName?.split(' ')[0] ?? 'Foydalanuvchi';

  const goTo = (path: string, label: string) => {
    router.push(path as any);
  };

  return (
    <View className="flex-1 bg-eco">
      {/* HEADER */}
      {/* HEADER */}
      <View className="bg-ink pt-14 pb-5 px-5">
        {/* Top row */}
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-lime text-[11px] font-bold tracking-[2px]">
            SHTRIXCOLOGY
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            className="w-9 h-9 items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Greeting + SHT chip */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/50 text-xs">Salom,</Text>
            <Text className="text-white text-2xl font-bold mt-0.5">
              {firstName}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/wallet')}
            className="bg-white/10 rounded-full pl-1.5 pr-3 py-1.5 flex-row items-center"
          >
            <View className="w-7 h-7 rounded-full bg-lime items-center justify-center">
              <Text className="text-[9px] font-bold text-ink">SHT</Text>
            </View>
            <Text className="text-white font-bold text-sm ml-2">
              {loading && !wallet ? '—' : balance}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="#8A9187"
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* SEARCH */}
        <View className="px-5 mt-4">
          <View className="bg-white rounded-2xl flex-row items-center px-4 h-13 border border-border-default"
            style={{ height: 52 }}
          >
            <Ionicons name="search" size={20} color="#8A9187" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Mahsulot yoki xizmat qidirish..."
              placeholderTextColor="#8A9187"
              className="flex-1 ml-2 text-base"
              style={{ color: '#111111' }}
            />
          </View>
        </View>

        {/* QUICK TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        >
          {QUICK_TABS.map((tab, idx) => (
            <Pressable
              key={tab.id}
              onPress={() => tab.onPress()}
              className={`mr-2 px-4 py-2.5 rounded-full ${idx === 0
                ? 'bg-ink'
                : 'bg-white border border-border-default'
                }`}
            >
              <Text
                className={`text-sm font-medium ${idx === 0 ? 'text-white' : 'text-ink'
                  }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* GRID */}
        <View className="px-5 mt-6">
          <Text className="text-base font-bold text-ink mb-3">
            Asosiy bo'limlar
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {GRID_CARDS.map((card) => (
              <Pressable
                key={card.id}
                onPress={card.onPress}
                className="bg-white rounded-2xl p-4 mb-3 border border-border-default active:opacity-90"
                style={{ width: '48%' }}
              >
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center mb-3 ${card.dark ? 'bg-ink' : 'bg-lime'
                    }`}
                >
                  <Ionicons
                    name={card.icon as any}
                    size={22}
                    color={card.dark ? '#B8FF3D' : '#111111'}
                  />
                </View>
                <Text className="text-base font-bold text-ink mb-1">
                  {card.title}
                </Text>
                <Text className="text-xs text-txt-muted leading-4">
                  {card.subtitle}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* STATS */}
        <View className="px-5 mt-4">
          <Text className="text-base font-bold text-ink mb-3">
            Sizning hissangiz
          </Text>

          <View className="bg-white rounded-2xl border border-border-default flex-row">
            <StatBlock
              icon="cube-outline"
              value={String(stats.passports)}
              label="Passport"
            />
            <Divider />
            <StatBlock
              icon="leaf-outline"
              value={`${stats.co2Kg} kg`}
              label="CO₂ tejalgan"
            />
            <Divider />
            <StatBlock
              icon="flame-outline"
              value={`${stats.streak} kun`}
              label="Ketma-ket"
            />
          </View>
        </View>

        {/* CTA — SHT haqida */}
        <View className="px-5 mt-6">
          <Pressable
            onPress={() => router.push('/wallet')}
            className="bg-ink rounded-2xl p-5 flex-row items-center"
          >
            <View className="flex-1">
              <Text className="text-lime text-[11px] font-bold uppercase tracking-widest">
                SHT TOKEN
              </Text>
              <Text className="text-white text-lg font-bold mt-1.5">
                Hamyoningizni ochish
              </Text>
              <Text className="text-white/50 text-xs mt-1 leading-5">
                Har bir passport uchun SHT olasiz
              </Text>
            </View>
            <View className="w-11 h-11 rounded-full bg-lime items-center justify-center">
              <Ionicons name="arrow-forward" size={20} color="#111111" />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ===========================================
function StatBlock({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center py-4">
      <Ionicons name={icon as any} size={18} color="#4B5148" />
      <Text className="text-base font-bold text-ink mt-2">{value}</Text>
      <Text className="text-[10px] text-txt-muted mt-0.5 text-center px-1">
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="w-px bg-border-default my-4" />;
}

// ===========================================
const QUICK_TABS = [
  { id: '1', label: 'Biz haqimizda', onPress: () => { } },
  { id: '2', label: 'Kundalik mashqlar', onPress: () => { } },
  { id: '3', label: 'Pul ishlash', onPress: () => { } },
  {
    id: '4',
    label: 'Skanerlash',
    onPress: () => router.push('/(tabs)/scanner'),
  },
  { id: '5', label: 'Sovrinlar', onPress: () => { } },
];

const GRID_CARDS = [
  {
    id: 'scan',
    title: 'Skanerlash',
    subtitle: 'Qadoq skanerlab SHT oling',
    icon: 'scan-outline',
    dark: true,
    onPress: () => router.push('/(tabs)/scanner'),
  },
  {
    id: 'earn',
    title: 'Pul ishlash',
    subtitle: "Do'stlarni taklif qiling",
    icon: 'cash-outline',
    dark: false,
    onPress: () => { },
  },
  {
    id: 'daily',
    title: 'Kundalik',
    subtitle: 'Har kuni bonus oling',
    icon: 'calendar-outline',
    dark: false,
    onPress: () => { },
  },
  {
    id: 'rewards',
    title: 'Sovrinlar',
    subtitle: "SHT'ni sovg'aga almashtiring",
    icon: 'gift-outline',
    dark: true,
    onPress: () => { },
  },
];