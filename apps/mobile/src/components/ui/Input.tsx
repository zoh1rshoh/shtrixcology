import { View, TextInput, Text, type TextInputProps } from 'react-native';
import { darkTheme } from '@shtrixcology/ui';

export function Input({
  label,
  error,
  hint,
  ...props
}: TextInputProps & { label?: string; error?: string; hint?: string }) {
  const t = darkTheme;
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: t.colors.textSecondary,
            marginBottom: 8,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.md,
          borderWidth: 1,
          borderColor: error ? t.colors.status.error : t.colors.border,
          paddingHorizontal: 16,
        }}
      >
        <TextInput
          {...props}
          placeholderTextColor={t.colors.textMuted}
          style={{
            height: 52,
            fontSize: 15,
            color: t.colors.text,
            fontFamily: t.font.sans,
          }}
        />
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: t.colors.status.error,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text
          style={{
            fontSize: 12,
            color: t.colors.textMuted,
            marginTop: 6,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}