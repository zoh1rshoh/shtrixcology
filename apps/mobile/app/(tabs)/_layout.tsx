import { Tabs } from 'expo-router';
import {
  Home,
  ScanLine,
  Package,
  Trophy,
  User,
} from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F0',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.1,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Asosiy',
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Skaner',
          tabBarIcon: ({ color, focused }) => (
            <ScanLine
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="passports"
        options={{
          title: 'Passportlar',
          tabBarIcon: ({ color, focused }) => (
            <Package
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="battles"
        options={{
          title: 'Jang',
          tabBarIcon: ({ color, focused }) => (
            <Trophy
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  );
}