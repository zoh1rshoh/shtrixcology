import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  TextInput as SearchInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ===========================================
// Davlatlar ro'yxati (asosiy)
// ===========================================
interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  max: number; // raqamlar soni (kod ichida)
}

export const COUNTRIES: Country[] = [
  { code: 'UZ', name: "O'zbekiston", dial: '+998', flag: '🇺🇿', max: 9 },
  { code: 'KZ', name: 'Qozog\'iston', dial: '+7', flag: '🇰🇿', max: 10 },
  { code: 'KG', name: 'Qirg\'iziston', dial: '+996', flag: '🇰🇬', max: 9 },
  { code: 'TJ', name: 'Tojikiston', dial: '+992', flag: '🇹🇯', max: 9 },
  { code: 'TM', name: 'Turkmaniston', dial: '+993', flag: '🇹🇲', max: 8 },
  { code: 'TR', name: 'Turkiya', dial: '+90', flag: '🇹🇷', max: 10 },
  { code: 'RU', name: 'Rossiya', dial: '+7', flag: '🇷🇺', max: 10 },
  { code: 'US', name: 'AQSH', dial: '+1', flag: '🇺🇸', max: 10 },
  { code: 'GB', name: 'Buyuk Britaniya', dial: '+44', flag: '🇬🇧', max: 10 },
  { code: 'DE', name: 'Germaniya', dial: '+49', flag: '🇩🇪', max: 11 },
  { code: 'FR', name: 'Fransiya', dial: '+33', flag: '🇫🇷', max: 9 },
  { code: 'IT', name: 'Italiya', dial: '+39', flag: '🇮🇹', max: 10 },
  { code: 'ES', name: 'Ispaniya', dial: '+34', flag: '🇪🇸', max: 9 },
  { code: 'CN', name: 'Xitoy', dial: '+86', flag: '🇨🇳', max: 11 },
  { code: 'JP', name: 'Yaponiya', dial: '+81', flag: '🇯🇵', max: 10 },
  { code: 'KR', name: 'Janubiy Koreya', dial: '+82', flag: '🇰🇷', max: 10 },
  { code: 'IN', name: 'Hindiston', dial: '+91', flag: '🇮🇳', max: 10 },
  { code: 'AE', name: 'BAA', dial: '+971', flag: '🇦🇪', max: 9 },
  { code: 'SA', name: 'Saudiya Arabistoni', dial: '+966', flag: '🇸🇦', max: 9 },
  { code: 'IR', name: 'Iron', dial: '+98', flag: '🇮🇷', max: 10 },
  { code: 'AF', name: 'Afg\'oniston', dial: '+93', flag: '🇦🇫', max: 9 },
  { code: 'PK', name: 'Pokiston', dial: '+92', flag: '🇵🇰', max: 10 },
  { code: 'AZ', name: 'Ozarbayjon', dial: '+994', flag: '🇦🇿', max: 9 },
  { code: 'GE', name: 'Gruziya', dial: '+995', flag: '🇬🇪', max: 9 },
  { code: 'AM', name: 'Armaniston', dial: '+374', flag: '🇦🇲', max: 8 },
  { code: 'UA', name: 'Ukraina', dial: '+380', flag: '🇺🇦', max: 9 },
  { code: 'BY', name: 'Belarus', dial: '+375', flag: '🇧🇾', max: 9 },
  { code: 'CA', name: 'Kanada', dial: '+1', flag: '🇨🇦', max: 10 },
  { code: 'AU', name: 'Avstraliya', dial: '+61', flag: '🇦🇺', max: 9 },
  { code: 'BR', name: 'Braziliya', dial: '+55', flag: '🇧🇷', max: 11 },
  { code: 'MY', name: 'Malayziya', dial: '+60', flag: '🇲🇾', max: 9 },
  { code: 'ID', name: 'Indoneziya', dial: '+62', flag: '🇮🇩', max: 11 },
  { code: 'EG', name: 'Misr', dial: '+20', flag: '🇪🇬', max: 10 },
  { code: 'IL', name: 'Isroil', dial: '+972', flag: '🇮🇱', max: 9 },
];

// ===========================================
// PhoneInput komponenti
// ===========================================
interface PhoneInputProps {
  value: string; // to'liq raqam (+998901234567)
  onChangeText: (formatted: string) => void;
  defaultCountry?: string; // 'UZ'
}

export function PhoneInput({
  value,
  onChangeText,
  defaultCountry = 'UZ',
}: PhoneInputProps) {
  const defaultC =
    COUNTRIES.find((c) => c.code === defaultCountry) ?? COUNTRIES[0];

  const [country, setCountry] = useState<Country>(defaultC);
  const [digits, setDigits] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  // Filtrlangan davlatlar
  const filtered = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search)
      )
    : COUNTRIES;

  const updateNumber = (newDigits: string) => {
    // Faqat raqamlar
    const clean = newDigits.replace(/\D/g, '').slice(0, country.max);
    setDigits(clean);
    onChangeText(`${country.dial}${clean}`);
  };

  const handleCountrySelect = (c: Country) => {
    setCountry(c);
    setModalVisible(false);
    setSearch('');
    // Eski raqamni yangi kodga o'zgartirish
    onChangeText(`${c.dial}${digits}`);
  };

  // Formatlash: 90 123 45 67
  const formatDisplay = (d: string) => {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
    if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
    return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
  };

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: '#E5E5E5',
          borderRadius: 12,
          backgroundColor: 'white',
          height: 56,
          alignItems: 'center',
        }}
      >
        {/* Davlat tanlash tugmasi */}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            height: '100%',
            borderRightWidth: 1,
            borderRightColor: '#E5E5E5',
          }}
        >
          <Text style={{ fontSize: 22, marginRight: 6 }}>{country.flag}</Text>
          <Text style={{ fontSize: 16, color: '#000', marginRight: 4 }}>
            {country.dial}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#A3A3A3" />
        </Pressable>

        {/* Raqam kiritish */}
        <TextInput
          value={formatDisplay(digits)}
          onChangeText={updateNumber}
          placeholder="90 123 45 67"
          placeholderTextColor="#A3A3A3"
          keyboardType="phone-pad"
          maxLength={country.max + 3} // bo'sh joylar bilan
          style={{
            flex: 1,
            fontSize: 16,
            color: '#000',
            paddingHorizontal: 12,
            height: '100%',
          }}
        />
      </View>

      {/* Davlat tanlash modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: '80%',
              paddingTop: 20,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700' }}>
                Davlatni tanlang
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </Pressable>
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 12,
                marginHorizontal: 20,
                paddingHorizontal: 12,
                marginBottom: 12,
                height: 48,
              }}
            >
              <Ionicons name="search" size={20} color="#A3A3A3" />
              <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Qidirish..."
                style={{ flex: 1, marginLeft: 8, fontSize: 16 }}
              />
            </View>

            {/* Country list */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleCountrySelect(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    backgroundColor:
                      item.code === country.code ? '#F5F5F5' : 'white',
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {item.flag}
                  </Text>
                  <Text style={{ flex: 1, fontSize: 16, color: '#000' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#737373' }}>
                    {item.dial}
                  </Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => (
                <View
                  style={{ height: 1, backgroundColor: '#F5F5F5', marginLeft: 56 }}
                />
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}