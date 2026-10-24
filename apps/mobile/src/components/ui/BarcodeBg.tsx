import { View } from 'react-native';

const PATTERN = [1, 0, 2, 0, 1, 3, 0, 1, 0, 2, 1, 0, 3, 1, 0, 2, 0, 1, 3, 0, 1];

export function BarcodeBg({
  color = '#262B36',
  opacity = 0.15,
  height = 60,
}: {
  color?: string;
  opacity?: number;
  height?: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        height,
        alignItems: 'center',
        opacity,
      }}
      pointerEvents="none"
    >
      {PATTERN.map((w, i) => (
        <View
          key={i}
          style={{
            width: w === 0 ? 3 : w === 1 ? 1 : w === 2 ? 1.5 : 2,
            height: height * (w === 0 ? 0 : 0.7 + (i % 3) * 0.1),
            backgroundColor: w === 0 ? 'transparent' : color,
            marginRight: 2,
          }}
        />
      ))}
    </View>
  );
}