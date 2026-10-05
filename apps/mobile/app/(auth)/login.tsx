import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
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
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-bold mb-2">Kirish</Text>
      <Text className="text-gray-500 mb-8">Hisobingizga kiring</Text>

      <Text className="text-sm font-medium text-gray-700 mb-2">Telefon raqam</Text>
      <PhoneInput value={phone} onChangeText={setPhone} defaultCountry="UZ" />

      <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Parol</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Parolingiz"
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
          {loading ? 'Kirilmoqda...' : 'Kirish'}
        </Text>
      </Pressable>

      <Link href="/(auth)/signup" className="mt-6 text-center text-gray-500">
        Hisobingiz yo'qmi? Ro'yxatdan o'tish
      </Link>
    </ScrollView>
  );
}