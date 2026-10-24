import { Text, type TextStyle } from 'react-native';
import { darkTheme } from '@shtrixcology/ui';

export function BarcodeText({
  children,
  style,
  color,
}: {
  children: string;
  style?: TextStyle;
  color?: string;
}) {
  const t = darkTheme;
  return (
    <Text
      style={[
        {
          fontFamily: t.font.mono,
          fontSize: 13,
          fontWeight: '500',
          color: color ?? t.colors.textSecondary,
          letterSpacing: 1.5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}