import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { PhoneInput } from '../../src/components/PhoneInput';
import { useAuth } from '../../src/store/auth';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuth((s) => s.login);
  const loading = useAuth((s) => s.loading);

  const onSubmit = async () => {
    try {
      if (!phone || phone.length < 13) {
        Alert.alert('Xato', 'Telefon raqam to\'liq emas');
        return;
      }
      if (!password) {
        Alert.alert('Xato', 'Parolni kiriting');
        return;
      }
      await login(phone, password);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Xato', (e as Error).message);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-obsidian"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* LOGOTIP VA SALOMLASHUV */}
      <View className="items-center mb-10">
        <View className="w-20 h-20 bg-champagne rounded-3xl items-center justify-center mb-4 shadow-glow">
          <Ionicons name="scan-outline" size={40} color="#0D0F14" />
        </View>
        <Text className="text-3xl font-bold text-ivory tracking-tight">SHTRIXCOLOGY</Text>
        <Text className="text-mist mt-2 text-sm uppercase tracking-widest font-semibold">Eco-Tech Platform</Text>
      </View>

      <Text className="text-2xl font-bold mb-8 text-ivory">Kirish</Text>

      <Text className="text-sm font-semibold text-mist mb-2">Telefon raqam</Text>
      <PhoneInput value={phone} onChangeText={setPhone} defaultCountry="UZ" />

      <Text className="text-sm font-semibold text-mist mb-2 mt-4">Parol</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Parolingiz"
        placeholderTextColor="#8B8F9A"
        secureTextEntry
        className="bg-graphite border border-slate rounded-xl px-4 py-4 mb-2 text-base text-ivory"
      />

      <View className="items-end mb-6">
        <Link href="/forgot-password" className="text-champagne text-sm font-medium">
          Parolni unutdingizmi?
        </Link>
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        className="bg-champagne rounded-xl py-4 items-center"
      >
        {loading ? (
          <ActivityIndicator color="#0D0F14" />
        ) : (
          <Text className="font-bold text-obsidian text-base">Kirish</Text>
        )}
      </Pressable>

      <Link href="/signup" className="mt-8 text-center text-mist">
        Hisobingiz yo'qmi? <Text className="text-ivory font-semibold">Ro'yxatdan o'tish</Text>
      </Link>
    </ScrollView>
  );
}