import { View, Text, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  iconBg = '#F6F7F4',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  iconBg?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={17} color="#111111" />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          color: '#111111',
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
      {value && (
        <Text
          style={{
            fontSize: 13,
            color: '#8A9187',
            marginRight: 6,
            maxWidth: 140,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={16} color="#DDE1D9" />
      )}
    </Pressable>
  );
}

export function SettingsToggle({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: '#F6F7F4',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={17} color="#111111" />
      </View>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text
          style={{
            fontSize: 15,
            color: '#111111',
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              fontSize: 11,
              color: '#8A9187',
              marginTop: 2,
              lineHeight: 15,
            }}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#DDE1D9', true: '#B8FF3D' }}
        thumbColor={value ? '#111111' : '#FFFFFF'}
        ios_backgroundColor="#DDE1D9"
      />
    </View>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      {title && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: '800',
            color: '#8A9187',
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 8,
            paddingHorizontal: 4,
          }}
        >
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#ECEFE9',
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export function SettingsDivider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: '#ECEFE9',
        marginLeft: 62,
      }}
    />
  );
}