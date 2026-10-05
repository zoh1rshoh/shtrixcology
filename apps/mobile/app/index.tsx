import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { storage } from '../src/lib/api';
import { api } from '../src/lib/api';
import { useAuth } from '../src/store/auth';

export default function Index() {
  const setUser = useAuth((s) => s.setUser);

  useEffect(() => {
    (async () => {
      const token = await storage.getAccessToken();
      if (!token) return router.replace('/(auth)/login');
      try {
        const res = await api.auth.refresh();
        setUser(res.user);
        router.replace('/(tabs)');
      } catch {
        router.replace('/(auth)/login');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#BAFF59" />
    </View>
  );
}