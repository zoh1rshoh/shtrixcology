import { Modal, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  passportId: string;
  rewardPoints: number;
  onView: () => void;
  onAgain: () => void;
  onClose: () => void;
}

export function SuccessModal({
  visible,
  passportId,
  rewardPoints,
  onView,
  onAgain,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
          {/* Yashil header */}
          <View className="bg-lime pt-8 pb-6 px-6 items-center">
            <View className="w-16 h-16 rounded-full bg-ink items-center justify-center mb-3">
              <Ionicons name="checkmark" size={36} color="#B8FF3D" />
            </View>
            <Text className="text-ink text-xl font-bold text-center">
              Passport yaratildi!
            </Text>
            <Text className="text-ink/60 text-sm mt-1 text-center">
              Qadoq muvaffaqiyatli qayd etildi
            </Text>
          </View>

          {/* Info */}
          <View className="p-6">
            <View className="bg-eco rounded-2xl p-4 mb-3">
              <Text className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                PASSPORT ID
              </Text>
              <Text className="text-sm font-mono text-ink mt-1">
                {passportId}
              </Text>
            </View>

            <View className="bg-ink rounded-2xl p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-[11px] font-bold text-lime uppercase tracking-wider">
                  MUKOFOT
                </Text>
                <Text className="text-2xl font-bold text-white mt-1">
                  +{rewardPoints} SHT
                </Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-lime items-center justify-center">
                <Text className="text-black text-[10px] font-bold">SHT</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="px-6 pb-6 gap-2">
            <Pressable
              onPress={onView}
              className="bg-ink rounded-2xl py-4 items-center"
            >
              <Text className="text-lime font-bold text-base">
                Passportni ko'rish
              </Text>
            </Pressable>
            <Pressable
              onPress={onAgain}
              className="bg-eco rounded-2xl py-4 items-center"
            >
              <Text className="text-ink font-bold text-base">
                Yana skanerlash
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}