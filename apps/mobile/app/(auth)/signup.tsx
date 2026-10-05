import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { PhoneInput } from '../../src/components/PhoneInput';
import { useAuth } from '../../src/store/auth';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const signup = useAuth((s) => s.signup);
  const loading = useAuth((s) => s.loading);

  const onSubmit = async () => {
    try {
      if (!fullName || fullName.length < 2) {
        Alert.alert('Xato', 'To\'liq ism kamida 2 ta harf');
        return;
      }
      if (!phone || phone.length < 13) {
        Alert.alert('Xato', 'Telefon raqam to\'liq emas');
        return;
      }
      if (password.length < 8) {
        Alert.alert('Xato', 'Parol kamida 8 ta belgi');
        return;
      }
      await signup(phone, fullName, password, email || undefined);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Xato', (e as Error).message);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-bold mb-2">Ro'yxatdan o'tish</Text>
      <Text className="text-gray-500 mb-8">Hisob yarating</Text>

      <Text className="text-sm font-medium text-gray-700 mb-2">To'liq ism</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Ism Familiya"
        autoCapitalize="words"
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        style={{ color: '#000' }}
      />

      <Text className="text-sm font-medium text-gray-700 mb-2">
        Email <Text className="text-gray-400">(ixtiyoriy)</Text>
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        style={{ color: '#000' }}
      />

      <Text className="text-sm font-medium text-gray-700 mb-2">Telefon raqam</Text>
      <PhoneInput value={phone} onChangeText={setPhone} defaultCountry="UZ" />

      <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Parol</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Kamida 8 ta belgi"
        secureTextEntry
        className="border border-gray-200 rounded-xl px-4 py-3 mb-6 text-base"
        style={{ color: '#000' }}
      />

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        className="bg-lime rounded-xl py-4 items-center"
      >
        <Text className="font-bold text-black text-base">
          {loading ? 'Yaratilmoqda...' : 'Yaratish'}
        </Text>
      </Pressable>

      <Link href="/(auth)/login" className="mt-6 text-center text-gray-500">
        Hisobingiz bormi? Kirish
      </Link>
    </ScrollView>
  );
}