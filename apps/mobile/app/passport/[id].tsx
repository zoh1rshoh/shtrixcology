import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { api } from '../../src/lib/api';

export default function PassportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [passport, setPassport] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.passports.detail(id);
      setPassport(data.passport);
      setEvents(data.events ?? []);
    } catch (e) {
      console.log('Detail error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-eco items-center justify-center">
        <ActivityIndicator color="#111111" />
      </View>
    );
  }

  if (!passport) {
    return (
      <View className="flex-1 bg-eco items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={48} color="#8A9187" />
        <Text className="text-base font-bold text-ink mt-4">
          Passport topilmadi
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-ink rounded-xl px-6 py-3 mt-5"
        >
          <Text className="font-bold text-lime">Orqaga</Text>
        </Pressable>
      </View>
    );
  }

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

  const stateLabel: Record<string, string> = {
    created: 'Yangi',
    in_transit: 'Jarayonda',
    recycled: 'Qayta ishlangan',
    reborn: 'Yangi hayot',
    rejected: 'Rad etilgan',
  };

  const stateColor: Record<string, string> = {
    created: '#8A9187',
    in_transit: '#F4B740',
    recycled: '#36B37E',
    reborn: '#36B37E',
    rejected: '#E5484D',
  };

  const predictions = passport.secondLifePredictions ?? [];

  return (
    <View className="flex-1 bg-eco">
      {/* HEADER */}
      <View className="bg-ink pt-14 pb-5 px-5">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white text-lg font-bold flex-1">Passport</Text>
          <View
            className="rounded-full px-3 py-1"
            style={{
              backgroundColor: `${stateColor[passport.state] ?? '#8A9187'}20`,
            }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: stateColor[passport.state] ?? '#8A9187' }}
            >
              {stateLabel[passport.state] ?? passport.state}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* PHOTO */}
        <View className="px-5 -mt-3">
          <View className="bg-white rounded-3xl overflow-hidden border border-border-default">
            {passport.photoUrl ? (
              <Image
                source={{ uri: passport.photoUrl }}
                style={{ width: '100%', height: 260 }}
                resizeMode="cover"
              />
            ) : (
              <View className="h-52 items-center justify-center bg-eco-gray">
                <Ionicons name="cube-outline" size={64} color="#8A9187" />
              </View>
            )}
          </View>
        </View>

        {/* ID */}
        <View className="px-5 mt-5">
          <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">
            PASSPORT ID
          </Text>
          <Text className="text-base font-mono text-ink mt-1">
            {passport.id}
          </Text>
        </View>

        {/* PRODUCT INFO */}
        <View className="px-5 mt-5">
          <Text className="text-xl font-bold text-ink">
            {passport.productName}
          </Text>
          <Text className="text-sm text-txt-muted font-mono mt-1">
            {passport.barcode}
          </Text>
        </View>

        {/* INFO GRID */}
        <View className="px-5 mt-5 flex-row gap-3">
          <InfoCard label="Material" value={materialLabel} />
          <InfoCard
            label="Og'irlik"
            value={`${passport.declaredWeight} g`}
          />
          <InfoCard
            label="Mukofot"
            value={`+${passport.rewardPoints}`}
            accent
          />
        </View>

        {/* AI PREDICTIONS */}
        {predictions.length > 0 && (
          <View className="px-5 mt-7">
            <View className="flex-row items-center mb-3">
              <View className="w-6 h-6 rounded-full bg-ai/10 items-center justify-center mr-2">
                <Ionicons name="sparkles" size={14} color="#7C5CFC" />
              </View>
              <Text className="text-base font-bold text-ink">
                Ikkinchi hayot bashorati
              </Text>
            </View>

            <View className="bg-white rounded-2xl border border-border-default p-4">
              {predictions.map((pred: any, idx: number) => (
                <View key={idx} className="mb-3 last:mb-0">
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-sm font-medium text-ink">
                      {pred.label}
                    </Text>
                    <Text className="text-sm font-bold text-ai">
                      {Math.round((pred.probability ?? 0) * 100)}%
                    </Text>
                  </View>
                  <View className="h-1.5 bg-eco-gray rounded-full overflow-hidden">
                    <View
                      className="h-full bg-ai rounded-full"
                      style={{ width: `${(pred.probability ?? 0) * 100}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TIMELINE */}
        <View className="px-5 mt-7">
          <Text className="text-base font-bold text-ink mb-3">
            Sayohat
          </Text>

          <View className="bg-white rounded-2xl border border-border-default p-4">
            {events.length === 0 ? (
              <View className="items-center py-4">
                <Text className="text-sm text-txt-muted">
                  Hali harakat yo'q
                </Text>
              </View>
            ) : (
              events.map((ev, idx) => (
                <View key={ev.id} className="flex-row mb-3 last:mb-0">
                  <View className="items-center mr-3">
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          idx === events.length - 1 ? '#B8FF3D' : '#DDE1D9',
                      }}
                    />
                    {idx < events.length - 1 && (
                      <View className="w-0.5 flex-1 bg-border-default my-1" />
                    )}
                  </View>
                  <View className="flex-1 pb-2">
                    <Text className="text-sm font-medium text-ink">
                      {ev.eventType}
                    </Text>
                    <Text className="text-[11px] text-txt-muted mt-0.5">
                      {new Date(ev.createdAt).toLocaleString('uz-UZ')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View
      className={`flex-1 rounded-2xl p-3 items-center border ${
        accent
          ? 'bg-lime border-lime'
          : 'bg-white border-border-default'
      }`}
    >
      <Text className="text-[10px] font-semibold text-txt-muted uppercase tracking-wide">
        {label}
      </Text>
      <Text
        className={`text-base font-bold mt-1.5 ${
          accent ? 'text-ink' : 'text-ink'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}