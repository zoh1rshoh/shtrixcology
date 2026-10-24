import { View, type ViewStyle } from 'react-native';
import { darkTheme } from '@shtrixcology/ui';

export function Card({
  children,
  padding = 16,
  style,
}: {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}) {
  const t = darkTheme;
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}