import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
export default function PassportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Passport</Text>
      <Text className="text-gray-500 mt-2">{id}</Text>
    </View>
  );
}