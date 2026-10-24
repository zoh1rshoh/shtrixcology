import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { api } from '../../src/lib/api';
import { SuccessModal } from '../../src/components/SuccessModal';
import type { AnalyzeScanResponse } from '@shtrixcology/api-client';

type Step = 'scan' | 'review';

interface Product {
  id: string | null;
  barcode: string;
  name: string;
  brand: string | null;
  packagingType: string;
  weightGrams: number | null;
  imageUrl: string | null;
  source?: string;
}

interface SuccessState {
  visible: boolean;
  passportId: string;
  rewardPoints: number;
}

const INITIAL_SUCCESS: SuccessState = {
  visible: false,
  passportId: '',
  rewardPoints: 0,
};

const BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
] as const;

function isValidBarcode(value: string): boolean {
  // EAN-8, UPC-A, EAN-13 va UPC-E uzunliklari.
  // Kod string bo'lib qoladi: boshidagi 0 yo'qolmaydi.
  return /^(?:\d{8}|\d{12,13}|\d{14})$/.test(value);
}

function sanitizeDecimal(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  return parts.length > 2
    ? `${parts[0]}.${parts.slice(1).join('')}`
    : cleaned;
}

export default function Scanner() {
  const { width } = useWindowDimensions();
  const frameSize = Math.min(width * 0.72, 300);

  const [permission, requestPermission] = useCameraPermissions();

  const [step, setStep] = useState<Step>('scan');
  const [barcode, setBarcode] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Foydalanuvchi qadoq bo'shligini o'zi tasdiqlashi kerak.
  const [isEmpty, setIsEmpty] = useState(false);

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [aiData, setAiData] = useState<AnalyzeScanResponse | null>(null);

  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const [success, setSuccess] = useState<SuccessState>(INITIAL_SUCCESS);

  // Kamera bir barcode'ni ketma-ket yuborishining oldini oladi.
  const scanLocked = useRef(false);
  const submitLocked = useRef(false);

  // --------------------------------------------
  // BARCODE LOOKUP
  // --------------------------------------------

  const handleBarcodeScan = useCallback(
    async (result: { data: string }) => {
      if (scanLocked.current || step !== 'scan') return;

      const code = result.data.trim();

      // Bu ekran mahsulot barcode'lari uchun.
      // QR yoki matnli kodni mahsulot barcode'i deb qabul qilmaymiz.
      if (!isValidBarcode(code)) {
        Alert.alert(
          'Barcode tanilmadi',
          'EAN-8, UPC-A yoki EAN-13 mahsulot kodini skanerlang.',
        );
        return;
      }

      scanLocked.current = true;
      setBarcode(code);
      setStep('review');
      setManualMode(false);
      setManualBarcode('');

      setProduct(null);
      setProductName('');
      setWeight('');
      setPhoto(null);
      setAiData(null);
      setIsEmpty(false);
      setQuantity('1');
      setLoadingProduct(true);

      try {
        const result = await api.products.lookup(code);
        const p = result as Product | null;

        if (p) {
          setProduct(p);
          setProductName(p.name ?? '');

          if (p.weightGrams != null && p.weightGrams > 0) {
            setWeight(String(p.weightGrams));
          }
        }
      } catch (error) {
        console.warn('Product lookup failed:', error);
        setProduct(null);

        // Barcode bazada topilmasa ham foydalanuvchi davom eta oladi.
        Alert.alert(
          'Mahsulot topilmadi',
          'Mahsulotni qo‘lda kiritishingiz mumkin. Bu barcode noto‘g‘ri degani emas.',
        );
      } finally {
        setLoadingProduct(false);
      }
    },
    [step],
  );

  // --------------------------------------------
  // MANUAL BARCODE ENTRY
  // --------------------------------------------

  const submitManualBarcode = () => {
    const code = manualBarcode.trim();

    if (!isValidBarcode(code)) {
      Alert.alert(
        'Barcode noto‘g‘ri',
        'EAN-8, UPC-A yoki EAN-13 formatidagi raqamni kiriting.',
      );
      return;
    }

    setManualMode(false);
    void handleBarcodeScan({ data: code });
  };

  // --------------------------------------------
  // PHOTO + AI ANALYSIS
  // --------------------------------------------

  const takePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Ruxsat kerak',
          'Qadoq suratini olish uchun kamera ruxsatini bering.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.base64) {
        Alert.alert('Xato', 'Surat ma’lumotini olish imkoni bo‘lmadi.');
        return;
      }

      const photoUri = `data:image/jpeg;base64,${asset.base64}`;

      // Oldingi suratning AI natijasi yangi suratga tegishli bo'lmaydi.
      setPhoto(photoUri);
      setAiData(null);

      if (!barcode) return;

      setAnalyzingPhoto(true);

      try {
        const ai = await api.scan.analyze({
          barcode,
          photoBase64: photoUri,
        });

        setAiData(ai);

        if (ai.productName) {
          setProductName(ai.productName);
        }

        if (
          ai.estimatedWeightGrams != null &&
          ai.estimatedWeightGrams > 0
        ) {
          setWeight(String(ai.estimatedWeightGrams));
        }

        if (ai.isEmpty !== undefined) {
          setIsEmpty(ai.isEmpty);
        }
      } catch (error) {
        console.warn('AI analysis failed:', error);

        Alert.alert(
          'AI tahlili bajarilmadi',
          'Surat saqlandi. Ma’lumotlarni qo‘lda to‘ldirishingiz mumkin.',
        );
      } finally {
        setAnalyzingPhoto(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Noma’lum xato';

      Alert.alert('Xato', message);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setAiData(null);
    setAnalyzingPhoto(false);
  };

  // --------------------------------------------
  // RESET
  // --------------------------------------------

  const reset = () => {
    scanLocked.current = false;
    submitLocked.current = false;

    setStep('scan');
    setBarcode(null);
    setPhoto(null);

    setProduct(null);
    setProductName('');
    setWeight('');
    setQuantity('1');
    setIsEmpty(false);

    setAiData(null);
    setAnalyzing(false);
    setAnalyzingPhoto(false);
    setLoadingProduct(false);

    setManualMode(false);
    setManualBarcode('');

    setSuccess(INITIAL_SUCCESS);
  };

  // --------------------------------------------
  // CREATE PASSPORT
  // --------------------------------------------

  const submit = async () => {
    if (submitLocked.current || analyzing) return;

    if (!barcode) {
      Alert.alert('Xato', 'Avval mahsulot barcode’ini skanerlang.');
      return;
    }

    if (!photo) {
      Alert.alert('Xato', 'Qadoqning suratini oling.');
      return;
    }

    const cleanName = productName.trim();

    if (cleanName.length < 2) {
      Alert.alert('Xato', 'Mahsulot nomini kiriting.');
      return;
    }

    const parsedWeight = Number(weight);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedWeight) ||
      parsedWeight <= 0 ||
      parsedWeight > 100000
    ) {
      Alert.alert(
        'Xato',
        'Bir dona qadoqning og‘irligini grammda to‘g‘ri kiriting.',
      );
      return;
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 999
    ) {
      Alert.alert('Xato', 'Soni 1 dan 999 gacha butun son bo‘lishi kerak.');
      return;
    }

    if (!isEmpty) {
      Alert.alert(
        'Qadoq hali bo‘shmi?',
        'Mukofot uchun qadoq bo‘sh bo‘lishi kerak. Bo‘shligini tekshiring va belgilang.',
      );
      return;
    }

    submitLocked.current = true;
    setAnalyzing(true);

    try {
      const result = await api.passports.create({
        barcode,
        productName: cleanName,
        photoBase64: photo,

        // Hozirgi API payload saqlangan.
        // Quantity alohida yuborilishi uchun backend schema ham yangilanishi kerak.
        declaredWeight: parsedWeight * parsedQuantity,

        isEmpty,

        aiData: aiData
          ? {
              material: aiData.material,
              materialCode: aiData.materialCode,
              isRecyclable: aiData.isRecyclable,
              estimatedWeightGrams: aiData.estimatedWeightGrams,
              manufacturer: aiData.manufacturer,
              countryOfOrigin: aiData.countryOfOrigin,
              recyclingInstructions: aiData.recyclingInstructions,
              confidence: aiData.confidence,
              secondLifePredictions: aiData.secondLifePredictions,
            }
          : undefined,
      });

      setSuccess({
        visible: true,
        passportId: result.passport.id,
        rewardPoints: result.rewardPoints,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Noma’lum xato';

      Alert.alert('Passport yaratilmadi', message);
    } finally {
      submitLocked.current = false;
      setAnalyzing(false);
    }
  };

  // --------------------------------------------
  // CAMERA PERMISSIONS
  // --------------------------------------------

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <ActivityIndicator color="#BAFF59" size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-eco px-8">
        <Ionicons name="camera-outline" size={64} color="#8A9187" />

        <Text className="text-xl font-bold mt-6 text-center text-ink">
          Kamera ruxsati kerak
        </Text>

        <Text className="text-txt-muted text-center mt-2 mb-8">
          Qadoqni skanerlash uchun kameraga ruxsat bering.
        </Text>

        <Pressable
          onPress={() => void requestPermission()}
          className="bg-ink rounded-xl px-8 py-4"
        >
          <Text className="font-bold text-lime">Ruxsat berish</Text>
        </Pressable>
      </View>
    );
  }

  // --------------------------------------------
  // STEP 1: SCANNER
  // --------------------------------------------

  if (step === 'scan') {
    return (
      <View className="flex-1 bg-ink">
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [...BARCODE_TYPES],
          }}
          onBarcodeScanned={
            scanLocked.current ? undefined : handleBarcodeScan
          }
        />

        {/* Scanner overlay */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View className="flex-1 items-center justify-center">
            <View
              style={{
                width: frameSize,
                height: frameSize,
                position: 'relative',
              }}
            >
              <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-lime rounded-tl-3xl" />
              <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-lime rounded-tr-3xl" />
              <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-lime rounded-bl-3xl" />
              <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-lime rounded-br-3xl" />
            </View>
          </View>

          <View
            style={{
              position: 'absolute',
              top: 65,
              left: 0,
              right: 0,
              alignItems: 'center',
            }}
          >
            <Text className="text-white text-xl font-bold">
              SHTRIXCOLOGY
            </Text>
            <Text className="text-white/70 text-xs mt-1">
              Qadoqni skanerlang
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              bottom: 90,
              left: 0,
              right: 0,
              alignItems: 'center',
            }}
          >
            <View className="bg-black/70 rounded-full px-5 py-3">
              <Text className="text-white text-sm font-medium">
                Shtrix-kodni ramka ichiga joylashtiring
              </Text>
            </View>
          </View>
        </View>

        {/* Manual entry overlay — scanner ekranining ICHIDA */}
        {manualMode ? (
          <View
            className="absolute bottom-0 left-0 right-0 bg-ink px-5 pt-5 pb-10 rounded-t-3xl"
            style={{ zIndex: 10 }}
          >
            <Text className="text-white text-base font-bold mb-3">
              Barcode qo‘lda kiritish
            </Text>

            <View className="flex-row">
              <TextInput
                value={manualBarcode}
                onChangeText={(value) =>
                  setManualBarcode(
                    value.replace(/[^0-9]/g, '').slice(0, 14),
                  )
                }
                placeholder="Masalan: 5449000000996"
                placeholderTextColor="#8A9187"
                keyboardType="number-pad"
                autoFocus
                maxLength={14}
                className="flex-1 bg-white/10 rounded-xl px-4 py-3.5 text-white text-base"
                style={{ fontFamily: 'JetBrains Mono' }}
              />

              <Pressable
                onPress={submitManualBarcode}
                disabled={!isValidBarcode(manualBarcode)}
                className={`ml-2 rounded-xl px-4 items-center justify-center ${
                  isValidBarcode(manualBarcode)
                    ? 'bg-lime'
                    : 'bg-white/10'
                }`}
              >
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={
                    isValidBarcode(manualBarcode) ? '#111111' : '#8A9187'
                  }
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  setManualMode(false);
                  setManualBarcode('');
                }}
                className="ml-2 rounded-xl px-4 items-center justify-center bg-white/10"
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setManualMode(true)}
            className="absolute bottom-10 left-0 right-0 items-center"
          >
            <View className="bg-black/70 rounded-full px-5 py-3 flex-row items-center">
              <Ionicons name="keypad-outline" size={16} color="#FFFFFF" />
              <Text className="text-white text-[13px] font-medium ml-2">
                Barcode qo‘lda kiritish
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    );
  }

  // --------------------------------------------
  // STEP 2: REVIEW
  // --------------------------------------------

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-eco"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View className="bg-white pt-14 pb-4 px-5 border-b border-border-default">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={reset} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="#111111" />
            </Pressable>

            <Text className="text-lg font-bold text-ink">
              Mahsulot ma’lumotlari
            </Text>

            <View className="w-8" />
          </View>
        </View>

        {/* PRODUCT CARD */}
        <View className="px-5 mt-4">
          <View className="bg-white rounded-3xl border border-border-default overflow-hidden">
            <View className="flex-row p-4">
              <View
                style={{ width: 100, height: 110 }}
                className="bg-eco-gray rounded-2xl items-center justify-center mr-4 overflow-hidden"
              >
                {loadingProduct ? (
                  <ActivityIndicator color="#111111" />
                ) : product?.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons name="cube-outline" size={44} color="#8A9187" />
                )}
              </View>

              <View className="flex-1 justify-between py-1">
                <View>
                  <Text
                    className="text-lg font-bold text-ink leading-tight"
                    numberOfLines={2}
                  >
                    {productName || 'Noma’lum mahsulot'}
                  </Text>

                  {product?.brand ? (
                    <Text className="text-sm text-txt-secondary mt-1">
                      {product.brand}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text className="text-[11px] text-txt-muted">
                    {barcode}
                  </Text>

                  <View className="flex-row items-center mt-2 flex-wrap">
                    <View className="bg-lime/30 rounded-full px-2.5 py-1 mr-2">
                      <Text className="text-[11px] font-bold text-ink">
                        {product?.packagingType === 'plastic'
                          ? 'Plastik'
                          : product?.packagingType === 'aluminium'
                            ? 'Alyuminiy'
                            : product?.packagingType === 'paper'
                              ? 'Qog‘oz'
                              : product?.packagingType === 'glass'
                                ? 'Shisha'
                                : 'Material noma’lum'}
                      </Text>
                    </View>

                    {product?.source === 'openfoodfacts' ? (
                      <View className="bg-ai/10 rounded-full px-2.5 py-1">
                        <Text className="text-[10px] font-semibold text-ai">
                          Open Food Facts
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* FORM */}
        <View className="px-5 mt-6">
          <Text className="text-[11px] font-bold text-txt-muted uppercase mb-3 tracking-wider">
            Mahsulot ma’lumotlari
          </Text>

          <Text className="text-sm font-medium text-txt-secondary mb-2">
            Mahsulot nomi
          </Text>

          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Masalan: Fanta 500 ml"
            placeholderTextColor="#8A9187"
            maxLength={120}
            className="bg-white border border-border-default rounded-xl px-4 py-3.5 mb-4 text-base"
            style={{ color: '#111111' }}
          />

          <Text className="text-sm font-medium text-txt-secondary mb-2">
            Og‘irlik (1 dona, gramm)
          </Text>

          <TextInput
            value={weight}
            onChangeText={(value) => setWeight(sanitizeDecimal(value))}
            placeholder="Masalan: 28"
            placeholderTextColor="#8A9187"
            keyboardType="decimal-pad"
            maxLength={9}
            className="bg-white border border-border-default rounded-xl px-4 py-3.5 mb-4 text-base"
            style={{ color: '#111111' }}
          />

          <Text className="text-sm font-medium text-txt-secondary mb-2">
            Soni
          </Text>

          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => {
                const current = Number.parseInt(quantity || '1', 10) || 1;
                setQuantity(String(Math.max(1, current - 1)));
              }}
              className="bg-white border border-border-default rounded-xl w-14 h-14 items-center justify-center"
            >
              <Ionicons name="remove" size={24} color="#111111" />
            </Pressable>

            <TextInput
              value={quantity}
              onChangeText={(value) =>
                setQuantity(value.replace(/[^0-9]/g, '').slice(0, 3))
              }
              keyboardType="number-pad"
              maxLength={3}
              className="flex-1 bg-white border border-border-default rounded-xl px-4 py-3.5 mx-2 text-base text-center font-bold"
              style={{ color: '#111111' }}
            />

            <Pressable
              onPress={() => {
                const current = Number.parseInt(quantity || '0', 10) || 0;
                setQuantity(String(Math.min(999, current + 1)));
              }}
              className="bg-white border border-border-default rounded-xl w-14 h-14 items-center justify-center"
            >
              <Ionicons name="add" size={24} color="#111111" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => setIsEmpty((value) => !value)}
            className="bg-white border border-border-default rounded-xl px-4 py-3.5 flex-row items-center mb-4"
          >
            <View
              className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${
                isEmpty ? 'bg-lime border-lime' : 'border-border-default'
              }`}
            >
              {isEmpty ? (
                <Ionicons name="checkmark" size={18} color="#111111" />
              ) : null}
            </View>

            <Text className="text-base text-ink">Qadoq bo‘sh</Text>
          </Pressable>
        </View>

        {/* PHOTO */}
        <View className="px-5 mt-2">
          <Text className="text-[11px] font-bold text-txt-muted uppercase mb-3 tracking-wider">
            Qadoq rasmi
          </Text>

          {photo ? (
            <View>
              <Image
                source={{ uri: photo }}
                style={{ width: '100%', height: 220, borderRadius: 16 }}
                resizeMode="cover"
              />

              <Pressable
                onPress={removePhoto}
                className="absolute top-3 right-3 bg-black/70 rounded-full p-2"
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={() => void takePhoto()}
                className="mt-3 bg-white border border-border-default rounded-xl py-3 flex-row items-center justify-center"
              >
                <Ionicons name="camera-outline" size={19} color="#111111" />
                <Text className="ml-2 font-semibold text-ink">
                  Boshqa surat olish
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => void takePhoto()}
              className="bg-white border-2 border-dashed border-border-default rounded-2xl py-12 items-center justify-center"
            >
              <View className="bg-lime rounded-full w-16 h-16 items-center justify-center mb-3">
                <Ionicons name="camera" size={28} color="#111111" />
              </View>

              <Text className="text-base font-bold text-ink">
                Rasm olish
              </Text>

              <Text className="text-sm text-txt-muted mt-1">
                Qadoqni kadrga to‘liq joylashtiring
              </Text>
            </Pressable>
          )}
        </View>

        {/* AI LOADING */}
        {analyzingPhoto ? (
          <View className="px-5 mt-3">
            <View className="bg-ai/10 rounded-2xl p-4 flex-row items-center border border-ai/20">
              <ActivityIndicator color="#7C5CFC" />

              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-ai">
                  AI tahlil qilmoqda...
                </Text>

                <Text className="text-xs text-ai/70 mt-1">
                  Natijalar taxminiy bo‘lishi mumkin
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* AI RESULTS */}
        {aiData && !analyzingPhoto ? (
          <View className="px-5 mt-3">
            <View className="bg-ai/5 rounded-2xl p-4 border border-ai/20">
              <View className="flex-row items-center mb-3">
                <Ionicons name="sparkles" size={16} color="#7C5CFC" />

                <Text className="text-xs font-bold text-ai uppercase ml-1.5">
                  AI tahlili
                </Text>

                <View className="flex-1" />

                <Text className="text-[10px] font-bold text-ai">
                  {Number.isFinite(aiData.confidence)
                    ? `${Math.round(aiData.confidence * 100)}% ishonch`
                    : 'Ishonch aniqlanmagan'}
                </Text>
              </View>

              <View className="gap-2">
                <AIField
                  label="Material"
                  value={String(
                    aiData.materialCode ?? aiData.material ?? 'Noma’lum',
                  )}
                />

                {aiData.manufacturer ? (
                  <AIField
                    label="Ishlab chiqaruvchi"
                    value={aiData.manufacturer}
                  />
                ) : null}

                {aiData.countryOfOrigin ? (
                  <AIField
                    label="Davlat"
                    value={aiData.countryOfOrigin}
                  />
                ) : null}

                <AIField
                  label="Qayta ishlash"
                  value={aiData.isRecyclable ? 'Ha' : 'Aniqlanmadi / yo‘q'}
                />

                <AIField
                  label="Taxminiy SHT"
                  value={`+${aiData.estimatedEcoPoints ?? 0}`}
                  accent
                />
              </View>

              {aiData.recyclingInstructions ? (
                <View className="mt-3 pt-3 border-t border-ai/10">
                  <Text className="text-[11px] text-ai/70 leading-4">
                    {aiData.recyclingInstructions}
                  </Text>
                </View>
              ) : null}

              <Text className="text-[10px] text-txt-muted mt-3">
                AI natijasi dastlabki baholashdir. Mukofot miqdorini backend
                tekshiruvlardan so‘ng belgilashi kerak.
              </Text>
            </View>
          </View>
        ) : null}

        {/* SUBMIT */}
        <View className="px-5 mt-6">
          <Pressable
            onPress={() => void submit()}
            disabled={analyzing || analyzingPhoto || !photo}
            className={`rounded-xl py-4 items-center ${
              photo && !analyzing && !analyzingPhoto
                ? 'bg-ink'
                : 'bg-eco-gray'
            }`}
          >
            {analyzing ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#BAFF59" />

                <Text className="font-bold text-lime ml-2">
                  Saqlanmoqda...
                </Text>
              </View>
            ) : (
              <Text
                className={`font-bold ${
                  photo && !analyzingPhoto ? 'text-lime' : 'text-txt-muted'
                }`}
              >
                Passport yaratish
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* SUCCESS MODAL */}
      <SuccessModal
        visible={success.visible}
        passportId={success.passportId}
        rewardPoints={success.rewardPoints}
        onView={() => {
          const passportId = success.passportId;

          setSuccess(INITIAL_SUCCESS);
          reset();

          router.push(`/passport/${passportId}`);
        }}
        onAgain={() => reset()}
        onClose={() =>
          setSuccess((current) => ({ ...current, visible: false }))
        }
      />
    </KeyboardAvoidingView>
  );
}

function AIField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View className="flex-row items-start justify-between">
      <Text className="text-xs text-txt-secondary flex-1 mr-3">
        {label}
      </Text>

      <Text
        className={`text-xs font-bold text-right flex-1 ${
          accent ? 'text-lime' : 'text-ink'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}