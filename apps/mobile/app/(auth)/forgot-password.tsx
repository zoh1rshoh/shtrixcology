import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { PhoneInput } from '../../src/components/PhoneInput';
import { api } from '../../src/lib/api';

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendCode = async () => {
    if (phone.length < 13) return setError("Telefon raqamni to'liq kiriting");
    setLoading(true); setError('');
    try {
      const res = await api.auth.forgotPassword(phone);
      setDevCode(res.devCode || null);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (code.length < 6) return setError("6 xonali kodni kiriting");
    if (newPassword.length < 8) return setError("Parol kamida 8 belgi");
    
    setLoading(true); setError('');
    try {
      await api.auth.resetPassword(phone, code, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Kod xato yoki muddati o'tgan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-obsidian items-center justify-center px-6">
        <Ionicons name="checkmark-circle" size={80} color="#D4B483" />
        <Text className="text-ivory text-2xl font-bold mt-4">Parol o'zgardi!</Text>
        <Text className="text-mist text-center mt-2 mb-8">
          Yangi parolingiz bilan tizimga kirishingiz mumkin.
        </Text>
        <Pressable onPress={() => router.replace('/login')} className="bg-champagne px-8 py-4 rounded-xl">
          <Text className="text-obsidian font-bold">Kirish sahifasiga o'tish</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-obsidian">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Text className="text-3xl font-bold mb-2 text-ivory">Parolni tiklash</Text>
        <Text className="text-mist mb-8">
          {step === 1 ? "Telefon raqamingizni kiriting" : "Kodni va yangi parolni kiriting"}
        </Text>

        {error ? (
          <View className="bg-terracotta/20 border border-terracotta/50 rounded-xl p-3 mb-4">
            <Text className="text-terracotta text-center">{error}</Text>
          </View>
        ) : null}

        {step === 1 ? (
          <>
            <Text className="text-sm font-semibold text-mist mb-2">Telefon raqam</Text>
            {/* TUZATILDI: PhoneInput ishlatilmoqda */}
            <PhoneInput value={phone} onChangeText={setPhone} defaultCountry="UZ" />
            
            <Pressable onPress={handleSendCode} disabled={loading} className="bg-champagne rounded-xl py-4 items-center mt-6">
              {loading ? <ActivityIndicator color="#0D0F14" /> : <Text className="text-obsidian font-bold text-lg">Kod olish</Text>}
            </Pressable>
          </>
        ) : (
          <>
            {devCode && (
              <View className="bg-champagne/10 border border-champagne/30 rounded-xl p-4 mb-6">
                <Text className="text-champagne text-xs uppercase font-bold mb-1">Test rejimi - SMS kod:</Text>
                <Text className="text-ivory text-2xl font-mono tracking-widest">{devCode}</Text>
              </View>
            )}

            <Text className="text-sm font-semibold text-mist mb-2">Tasdiqlash kodi</Text>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6 xonali kod"
              placeholderTextColor="#8B8F9A"
              className="bg-graphite border border-slate text-ivory rounded-xl px-4 py-4 mb-4 text-center text-2xl tracking-widest font-mono"
            />
            
            <Text className="text-sm font-semibold text-mist mb-2">Yangi parol</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Yangi parol (min 8)"
              placeholderTextColor="#8B8F9A"
              className="bg-graphite border border-slate text-ivory rounded-xl px-4 py-4 mb-6"
            />
            <Pressable onPress={handleReset} disabled={loading} className="bg-champagne rounded-xl py-4 items-center">
              {loading ? <ActivityIndicator color="#0D0F14" /> : <Text className="text-obsidian font-bold text-lg">Parolni yangilash</Text>}
            </Pressable>
          </>
        )}

        <View className="mt-8 items-center">
          <Link href="/login" className="text-mist">Orqaga qaytish</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}