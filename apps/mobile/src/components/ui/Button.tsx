import { Pressable, Text, ActivityIndicator, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkTheme } from '@shtrixcology/ui';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export function Button({
  variant = 'primary',
  size = 'md',
  title,
  onPress,
  loading,
  disabled,
  icon,
  fullWidth = true,
}: {
  variant?: Variant;
  size?: Size;
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  const t = darkTheme;
  const isDisabled = disabled || loading;

  const heights: Record<Size, number> = { sm: 40, md: 52, lg: 60 };
  const fontSizes: Record<Size, number> = { sm: 13, md: 15, lg: 16 };
  const px: Record<Size, number> = { sm: 16, md: 24, lg: 32 };

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: heights[size],
        paddingHorizontal: px[size],
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0D0F14' : t.colors.text} />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={{
              color:
                variant === 'primary'
                  ? '#0D0F14'
                  : variant === 'danger'
                    ? t.colors.status.error
                    : t.colors.text,
              fontSize: fontSizes[size],
              fontWeight: '600',
              letterSpacing: -0.2,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  const baseStyle: ViewStyle = {
    borderRadius: t.radius.md,
    width: fullWidth ? '100%' : undefined,
    overflow: 'hidden',
  };

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={baseStyle}>
        <LinearGradient
          colors={t.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: t.radius.md }}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[
          baseStyle,
          {
            backgroundColor: t.colors.surface,
            borderWidth: 1,
            borderColor: t.colors.border,
          },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  if (variant === 'ghost') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={baseStyle}>
        {content}
      </Pressable>
    );
  }

  // danger
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        baseStyle,
        {
          backgroundColor: 'rgba(217, 96, 76, 0.08)',
          borderWidth: 1,
          borderColor: 'rgba(217, 96, 76, 0.2)',
        },
      ]}
    >
      {content}
    </Pressable>
  );
} 