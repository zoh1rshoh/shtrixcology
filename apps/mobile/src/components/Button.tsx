import { Pressable, Text } from 'react-native';
export function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="bg-lime rounded-xl py-4 items-center">
      <Text className="font-bold text-black">{title}</Text>
    </Pressable>
  );
}