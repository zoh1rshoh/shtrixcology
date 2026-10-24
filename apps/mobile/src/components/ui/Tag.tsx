import { View, Text } from 'react-native';
import { darkTheme } from '@shtrixcology/ui';

type Variant = 'default' | 'accent' | 'success' | 'warning' | 'error';

export function Tag({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  const t = darkTheme;

  const styles: Record<Variant, { bg: string; fg: string }> = {
    default: { bg: t.colors.surfaceElevated, fg: t.colors.textSecondary },
    accent: { bg: 'rgba(212,180,131,0.12)', fg: t.colors.accent },
    success: { bg: 'rgba(95,179,138,0.12)', fg: t.colors.status.success },
    warning: { bg: 'rgba(224,168,74,0.12)', fg: t.colors.status.warning },
    error: { bg: 'rgba(217,96,76,0.12)', fg: t.colors.status.error },
  };
  const s = styles[variant];

  return (
    <View
      style={{
        backgroundColor: s.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: s.fg,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}