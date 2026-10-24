import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../src/store/auth';
import { api } from '../../src/lib/api';

interface WalletData {
  balance: number;
  transactions: Array<{
    id: string;
    deltaPoints: number;
    reason: string;
    createdAt: string;
  }>;
}

export default function Profile() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.wallet.balance();
      setWallet(data);
    } catch (e) {
      console.log('Wallet load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobingizdan chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Chiqish',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* HEADER */}
      <View className="bg-black pt-16 pb-8 px-6 rounded-b-3xl">
        <View className="flex-row items-center">
          <View className="w-20 h-20 rounded-full bg-lime items-center justify-center mr-4">
            <Text className="text-black text-2xl font-bold">
              {getInitials(user?.fullName ?? '')}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold" numberOfLines={1}>
              {user?.fullName ?? 'Foydalanuvchi'}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {user?.phone ?? ''}
            </Text>
            {user?.email && (
              <Text className="text-gray-400 text-sm" numberOfLines={1}>
                {user.email}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ECO POINTS */}
      <View className="px-6 -mt-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-gray-500 text-xs uppercase mb-1">
            Eco Points
          </Text>
          {loading && !wallet ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-3xl font-bold">
              {(wallet?.balance ?? 0).toLocaleString('uz-UZ')}
            </Text>
          )}
          <Text className="text-gray-400 text-xs mt-1">
            ≈ {((wallet?.balance ?? 0) * 10).toLocaleString('uz-UZ')} UZS
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View className="px-6 mt-6 flex-row gap-3">
        <StatCard
          icon="cube-outline"
          label="Passportlar"
          value="0"
        />
        <StatCard
          icon="leaf-outline"
          label="CO₂"
          value="0 kg"
        />
        <StatCard
          icon="flame-outline"
          label="Streak"
          value="0 kun"
        />
      </View>

      {/* MENU */}
      <View className="px-6 mt-6">
        <Text className="text-gray-500 text-xs uppercase mb-3 px-1">
          Sozlamalar
        </Text>

        <MenuItem
          icon="person-outline"
          label="Profilni tahrirlash"
          onPress={() => Alert.alert('Tez orada', 'Bu funksiya keyingi versiyada')}
        />
        <MenuItem
          icon="notifications-outline"
          label="Bildirishnomalar"
          onPress={() => Alert.alert('Tez orada', 'Bu funksiya keyingi versiyada')}
        />
        <MenuItem
          icon="language-outline"
          label="Til"
          value="O'zbekcha"
          onPress={() => Alert.alert('Tez orada', 'Bu funksiya keyingi versiyada')}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          label="Maxfiylik"
          onPress={() => Alert.alert('Tez orada', 'Bu funksiya keyingi versiyada')}
        />
        <MenuItem
          icon="settings-outline"
          label="Sozlamalar"
          onPress={() => router.push('/settings')}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Yordam"
          onPress={() => Alert.alert('Tez orada', 'Bu funksiya keyingi versiyada')}
        />
      </View>

      {/* LOGOUT */}
      <View className="px-6 mt-6 mb-12">
        <Pressable
          onPress={handleLogout}
          className="bg-red-50 border border-red-200 rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-red-600 font-medium ml-2 text-base">
            Chiqish
          </Text>
        </Pressable>

        <Text className="text-center text-gray-400 text-xs mt-6">
          SHTRIXCOLOGY v0.1.0
        </Text>
      </View>
    </ScrollView>
  );
}

// ===========================================
// Komponentlar
// ===========================================
function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
      <Ionicons name={icon} size={20} color="#000" />
      <Text className="text-2xl font-bold mt-2">{value}</Text>
      <Text className="text-gray-500 text-xs mt-1">{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl px-4 py-4 mb-2 flex-row items-center border border-gray-100"
    >
      <Ionicons name={icon} size={22} color="#000" />
      <Text className="flex-1 ml-3 text-base font-medium">{label}</Text>
      {value && <Text className="text-gray-400 text-sm mr-2">{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
    </Pressable>
  );
}