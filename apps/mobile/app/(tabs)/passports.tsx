import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { api } from '../../src/lib/api';

type TabKey = 'new' | 'progress' | 'verified' | 'rejected';

const TABS: { key: TabKey; label: string; states: string[] }[] = [
  { key: 'new', label: 'Yangi', states: ['created'] },
  { key: 'progress', label: 'Jarayonda', states: ['in_transit'] },
  { key: 'verified', label: 'Tasdiqlangan', states: ['recycled', 'reborn'] },
  { key: 'rejected', label: 'Rad etilgan', states: ['rejected'] },
];

interface Passport {
  id: string;
  barcode: string;
  productName: string;
  aiMaterial: string;
  declaredWeight: number;
  rewardPoints: number;
  state: string;
  aiStatus: string;
  photoUrl: string | null;
  createdAt: string;
}

export default function Passports() {
  const [passports, setPassports] = useState<Passport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('new');

  const load = useCallback(async () => {
    try {
      const data = await api.passports.list();
      setPassports((data.passports ?? []) as any);
    } catch (e) {
      console.log('Passports load error:', e);
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

  const grouped = useMemo(() => {
    const groups: Record<TabKey, Passport[]> = {
      new: [],
      progress: [],
      verified: [],
      rejected: [],
    };
    passports.forEach((p) => {
      const tab = TABS.find((t) => t.states.includes(p.state));
      if (tab) groups[tab.key].push(p);
      else groups.new.push(p); // default
    });
    return groups;
  }, [passports]);

  const current = grouped[activeTab];

  return (
    <View className="flex-1 bg-eco">
      {/* HEADER */}
      <View className="bg-ink pt-14 pb-5 px-5">
        <Text className="text-white text-2xl font-bold">Passportlar</Text>
        <Text className="text-white/50 text-sm mt-1">
          Sizning qadoqlaringiz tarixi
        </Text>
      </View>

      {/* TABS */}
      <View className="bg-white border-b border-border-default">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = grouped[tab.key].length;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className="px-3 pt-3.5 pb-3 items-center"
              >
                <View className="flex-row items-center">
                  <Text
                    className={`text-sm ${
                      isActive
                        ? 'text-ink font-bold'
                        : 'text-txt-muted font-medium'
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {count > 0 && (
                    <View
                      className={`ml-1.5 rounded-full px-1.5 min-w-[20px] h-5 items-center justify-center ${
                        isActive ? 'bg-ink' : 'bg-eco-gray'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          isActive ? 'text-lime' : 'text-txt-secondary'
                        }`}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
                {isActive && (
                  <View className="h-0.5 bg-lime rounded-full w-full mt-2" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#111111" />
          </View>
        ) : current.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          current.map((p) => (
            <PassportCard
              key={p.id}
              passport={p}
              onPress={() => router.push(`/passport/${p.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ===========================================
function PassportCard({
  passport,
  onPress,
}: {
  passport: Passport;
  onPress: () => void;
}) {
  const materialLabel =
    passport.aiMaterial === 'plastic'
      ? 'Plastik'
      : passport.aiMaterial === 'aluminium'
      ? 'Alyuminiy'
      : passport.aiMaterial === 'paper'
      ? "Qog'oz"
      : passport.aiMaterial === 'glass'
      ? 'Shisha'
      : 'Boshqa';

  const date = new Date(passport.createdAt);
  const dateStr = date.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-border-default mb-3 overflow-hidden"
    >
      <View className="flex-row p-3.5">
        {/* Rasm */}
        <View className="w-16 h-16 rounded-xl bg-eco-gray items-center justify-center mr-3 overflow-hidden">
          {passport.photoUrl ? (
            <Image
              source={{ uri: passport.photoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="cube-outline" size={28} color="#8A9187" />
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base font-bold text-ink" numberOfLines={1}>
            {passport.productName}
          </Text>
          <Text className="text-[11px] text-txt-muted font-mono mt-0.5">
            {passport.id}
          </Text>

          <View className="flex-row items-center mt-2">
            <View className="bg-eco-gray rounded-full px-2 py-0.5 mr-1.5">
              <Text className="text-[10px] font-semibold text-txt-secondary">
                {materialLabel}
              </Text>
            </View>
            <Text className="text-[11px] text-txt-muted">
              {passport.declaredWeight} g
            </Text>
          </View>
        </View>

        {/* Reward */}
        <View className="items-end justify-between">
          <View className="bg-lime rounded-full px-2.5 py-1">
            <Text className="text-[11px] font-bold text-ink">
              +{passport.rewardPoints}
            </Text>
          </View>
          <Text className="text-[10px] text-txt-muted mt-2">{dateStr}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const content = {
    new: {
      icon: 'sparkles-outline',
      title: "Yangi passportlar yo'q",
      subtitle: "Birinchi passportingizni yarating",
      showCta: true,
    },
    progress: {
      icon: 'time-outline',
      title: 'Jarayonda emas',
      subtitle: 'Topshirilgan qadoqlar shu yerda ko\'rinadi',
      showCta: false,
    },
    verified: {
      icon: 'checkmark-circle-outline',
      title: "Tasdiqlangan yo'q",
      subtitle: 'Qayta ishlangan qadoqlar',
      showCta: false,
    },
    rejected: {
      icon: 'close-circle-outline',
      title: "Rad etilgan yo'q",
      subtitle: "Yaxshi natija!",
      showCta: false,
    },
  }[tab];

  return (
    <View className="items-center py-16 px-8">
      <View className="w-20 h-20 rounded-full bg-eco-gray items-center justify-center mb-4">
        <Ionicons name={content.icon as any} size={36} color="#8A9187" />
      </View>
      <Text className="text-base font-bold text-ink text-center">
        {content.title}
      </Text>
      <Text className="text-sm text-txt-muted text-center mt-1">
        {content.subtitle}
      </Text>
      {content.showCta && (
        <Pressable
          onPress={() => router.push('/(tabs)/scanner')}
          className="bg-ink rounded-xl px-6 py-3 mt-5"
        >
          <Text className="font-bold text-lime">Skanerlash</Text>
        </Pressable>
      )}
    </View>
  );
}