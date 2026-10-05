import { useState, useRef } from 'react';
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

export default function Scanner() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const FRAME_SIZE = Math.min(SCREEN_WIDTH * 0.72, 300);

  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('scan');
  const [barcode, setBarcode] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<AnalyzeScanResponse | null>(null);


  // Mahsulot ma'lumotlari (auto-fill)
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productName, setProductName] = useState('');
  const [weight, setWeight] = useState('');
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);


  // User input
  const [quantity, setQuantity] = useState('1');
  const [isEmpty, setIsEmpty] = useState(true);

  // Success modal
  const [success, setSuccess] = useState<{
    visible: boolean;
    passportId: string;
    rewardPoints: number;
  }>({ visible: false, passportId: '', rewardPoints: 0 });

  const cameraRef = useRef<any>(null);
  const [cameraKey, setCameraKey] = useState(0);

  // ============================================
  // BARCODE SCAN
  // ============================================
  const handleBarcodeScan = async (result: { data: string }) => {
    if (step !== 'scan') return;
    const code = result.data;
    setBarcode(code);
    setStep('review');
    setLoadingProduct(true);

    try {
      const p = await api.products.lookup(code);
      setProduct(p);
      setProductName(p.name);
      if (p.weightGrams) setWeight(String(p.weightGrams));
    } catch {
      setProduct(null);
    } finally {
      setLoadingProduct(false);
    }
  };

  // ============================================
  // PHOTO
  // ============================================
  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Ruxsat kerak', 'Kamera ruxsatini bering');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0]?.base64) {
        const photoUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setPhoto(photoUri);

        // ⚡ AI ANALYZE — rasm olingach DARHOL
        if (barcode) {
          setAnalyzingPhoto(true);
          try {
            const ai = await api.scan.analyze({
              barcode,
              photoBase64: photoUri,
            });
            setAiData(ai);

            // Auto-fill
            if (ai.productName) setProductName(ai.productName);
            if (ai.estimatedWeightGrams) {
              setWeight(String(ai.estimatedWeightGrams));
            }
            if (ai.isEmpty !== undefined) setIsEmpty(ai.isEmpty);
          } catch (err) {
            console.log('AI error:', err);
            // AI ishlamasa — user qo'lda to'ldiradi
          } finally {
            setAnalyzingPhoto(false);
          }
        }
      }
    } catch (err) {
      Alert.alert('Xato', (err as Error).message);
    }
  };
  // ============================================
  // RESET
  // ============================================
  const reset = () => {
    setStep('scan');
    setBarcode(null);
    setPhoto(null);
    setProduct(null);
    setProductName('');
    setWeight('');
    setQuantity('1');
    setIsEmpty(true);
    setAnalyzing(false);
    setAiData(null);
    setAnalyzingPhoto(false);
    setCameraKey((k) => k + 1);
  };

  // ============================================
  // SUBMIT
  // ============================================
  const submit = async () => {
    if (!barcode) {
      Alert.alert('Xato', "Barcode yo'q");
      return;
    }
    if (!photo) {
      Alert.alert('Xato', 'Rasm oling');
      return;
    }
    if (!productName || productName.length < 2) {
      Alert.alert('Xato', 'Mahsulot nomini kiriting');
      return;
    }
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      Alert.alert('Xato', "Og'irlikni kiriting (gramm)");
      return;
    }
    const q = parseInt(quantity);
    if (!q || q <= 0) {
      Alert.alert('Xato', 'Soni kiriting');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await api.passports.create({
        barcode,
        productName,
        photoBase64: photo,
        declaredWeight: w * q,
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
    } catch (err) {
      Alert.alert('Xato', (err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  // ============================================
  // RUXSAT YO'Q
  // ============================================
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-ink">
        <ActivityIndicator color="#B8FF3D" size="large" />
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
          Qadoqni skanerlash uchun ruxsat bering
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-ink rounded-xl px-8 py-4"
        >
          <Text className="font-bold text-lime">Ruxsat berish</Text>
        </Pressable>
      </View>
    );
  }

  // ============================================
  // STEP 1: SCAN
  // ============================================
  if (step === 'scan') {
    return (
      <View className="flex-1 bg-ink">
        <CameraView
          key={cameraKey}
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'qr', 'code128', 'upc_a'],
          }}
          onBarcodeScanned={handleBarcodeScan}
        />

        {/* Overlay */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View className="flex-1 items-center justify-center">
            <View
              style={{
                width: FRAME_SIZE,
                height: FRAME_SIZE,
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
              bottom: 60,
              left: 0,
              right: 0,
              alignItems: 'center',
            }}
          >
            <View className="bg-black/70 rounded-full px-5 py-2.5">
              <Text className="text-white text-sm font-medium">
                Shtrix-kodni ramka ichiga joylashtiring
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ============================================
  // STEP 2: REVIEW
  // ============================================
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
              Mahsulot ma'lumotlari
            </Text>
            <View className="w-8" />
          </View>
        </View>

        {/* MAHSULOT KARTOCHKASI */}
        <View className="px-5 mt-4">
          <View className="bg-white rounded-3xl border border-border-default overflow-hidden">
            <View className="flex-row p-4">
              {/* Rasm */}
              <View
                style={{ width: 110, height: 110 }}
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

              {/* Info */}
              <View className="flex-1 justify-between py-1">
                <View>
                  <Text
                    className="text-lg font-bold text-ink leading-tight"
                    numberOfLines={2}
                  >
                    {productName || "Noma'lum mahsulot"}
                  </Text>

                  {product?.brand && (
                    <Text className="text-sm text-txt-secondary mt-1">
                      {product.brand}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-[11px] text-txt-muted font-mono">
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
                              ? "Qog'oz"
                              : product?.packagingType === 'glass'
                                ? 'Shisha'
                                : '—'}
                      </Text>
                    </View>

                    {product?.source === 'openfoodfacts' && (
                      <View className="bg-ai/10 rounded-full px-2.5 py-1">
                        <Text className="text-[10px] font-semibold text-ai">
                          Global DB
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* FORMA */}
        <View className="px-5 mt-6">
          <Text className="text-[11px] font-bold text-txt-muted uppercase mb-3 tracking-wider">
            To'ldirish
          </Text>

          {/* Mahsulot nomi */}
          <Text className="text-sm font-medium text-txt-secondary mb-2">
            Mahsulot nomi
          </Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Fanta 500ml"
            placeholderTextColor="#8A9187"
            className="bg-white border border-border-default rounded-xl px-4 py-3.5 mb-4 text-base"
            style={{ color: '#111111' }}
          />

          {/* Og'irlik */}
          <Text className="text-sm font-medium text-txt-secondary mb-2">
            Og'irlik (1 dona, gramm)
          </Text>
          <TextInput
            value={weight}
            onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))}
            placeholder="28"
            placeholderTextColor="#8A9187"
            keyboardType="decimal-pad"
            maxLength={6}
            className="bg-white border border-border-default rounded-xl px-4 py-3.5 mb-4 text-base"
            style={{ color: '#111111' }}
          />

          {/* SONI */}
          <Text className="text-sm font-medium text-txt-secondary mb-2">
            Soni <Text className="text-error">*</Text>
          </Text>
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => {
                const q = Math.max(1, parseInt(quantity || '1') - 1);
                setQuantity(String(q));
              }}
              className="bg-white border border-border-default rounded-xl w-14 h-14 items-center justify-center"
            >
              <Ionicons name="remove" size={24} color="#111111" />
            </Pressable>
            <TextInput
              value={quantity}
              onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={3}
              className="flex-1 bg-white border border-border-default rounded-xl px-4 py-3.5 mx-2 text-base text-center font-bold"
              style={{ color: '#111111' }}
            />
            <Pressable
              onPress={() => {
                const q = parseInt(quantity || '0') + 1;
                setQuantity(String(q));
              }}
              className="bg-white border border-border-default rounded-xl w-14 h-14 items-center justify-center"
            >
              <Ionicons name="add" size={24} color="#111111" />
            </Pressable>
          </View>

          {/* IS EMPTY */}
          <Pressable
            onPress={() => setIsEmpty(!isEmpty)}
            className="bg-white border border-border-default rounded-xl px-4 py-3.5 flex-row items-center mb-4"
          >
            <View
              className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${isEmpty ? 'bg-lime border-lime' : 'border-border-default'
                }`}
            >
              {isEmpty && (
                <Ionicons name="checkmark" size={18} color="#111111" />
              )}
            </View>
            <Text className="text-base text-ink">Qadoq bo'sh</Text>
          </Pressable>
        </View>

        {/* RASM OLISH */}
        <View className="px-5 mt-2">
          <Text className="text-[11px] font-bold text-txt-muted uppercase mb-3 tracking-wider">
            Qadoq rasmi
          </Text>

          {photo ? (
            <View className="relative">
              <Image
                source={{ uri: photo }}
                style={{ width: '100%', height: 220, borderRadius: 16 }}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setPhoto(null)}
                className="absolute top-3 right-3 bg-black/60 rounded-full p-2"
              >
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={takePhoto}
              className="bg-white border-2 border-dashed border-border-default rounded-2xl py-12 items-center justify-center"
            >
              <View className="bg-lime rounded-full w-16 h-16 items-center justify-center mb-3">
                <Ionicons name="camera" size={28} color="#111111" />
              </View>
              <Text className="text-base font-bold text-ink">
                Rasm olish
              </Text>
              <Text className="text-sm text-txt-muted mt-1">
                Qadoqni kadrga to'liq joylashtiring
              </Text>
            </Pressable>
          )}
        </View>

        {/* AI TEKSHIRILMOQDA — indikator */}
        {analyzingPhoto && (
          <View className="px-5 mt-3">
            <View className="bg-ai/10 rounded-2xl p-4 flex-row items-center border border-ai/20">
              <View className="w-10 h-10 rounded-full bg-ai/20 items-center justify-center mr-3">
                <ActivityIndicator color="#7C5CFC" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-ai">
                  AI tahlil qilmoqda...
                </Text>
                <Text className="text-xs text-ai/70 mt-0.5">
                  Rasm va barcode o'rganilmoqda
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* AI TO'LDIRDI — natija */}
        {aiData && !analyzingPhoto && (
          <View className="px-5 mt-3">
            <View className="bg-ai/5 rounded-2xl p-4 border border-ai/20">
              <View className="flex-row items-center mb-3">
                <Ionicons name="sparkles" size={16} color="#7C5CFC" />
                <Text className="text-xs font-bold text-ai uppercase ml-1.5 tracking-wider">
                  AI to'ldirdi
                </Text>
                <View className="flex-1" />
                <Text className="text-[10px] font-bold text-ai">
                  {Math.round(aiData.confidence * 100)}% ishonch
                </Text>
              </View>

              <View className="gap-2">
                <AIField
                  label="Material"
                  value={aiData.materialCode ?? aiData.material}
                />
                {aiData.manufacturer && (
                  <AIField
                    label="Ishlab chiqaruvchi"
                    value={aiData.manufacturer}
                  />
                )}
                {aiData.countryOfOrigin && (
                  <AIField
                    label="Davlat"
                    value={aiData.countryOfOrigin}
                  />
                )}
                <AIField
                  label="Qayta ishlash"
                  value={aiData.isRecyclable ? '✓ Ha' : "✗ Yo'q"}
                />
                <AIField
                  label="Taxminiy SHT"
                  value={`+${aiData.estimatedEcoPoints}`}
                  accent
                />
              </View>

              {aiData.recyclingInstructions && (
                <View className="mt-3 pt-3 border-t border-ai/10">
                  <Text className="text-[11px] text-ai/70 leading-4">
                    {aiData.recyclingInstructions}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* SUBMIT */}
        <View className="px-5 mt-6">
          <Pressable
            onPress={submit}
            disabled={analyzing || !photo}
            className={`rounded-xl py-4 items-center ${photo && !analyzing ? 'bg-ink' : 'bg-eco-gray'
              }`}
          >
            {analyzing ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#B8FF3D" />
                <Text className="font-bold text-lime ml-2">
                  Saqlanmoqda...
                </Text>
              </View>
            ) : (
              <Text
                className={`font-bold ${photo ? 'text-lime' : 'text-txt-muted'
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
          const pid = success.passportId;
          setSuccess({ ...success, visible: false });
          reset();
          router.push(`/passport/${pid}`);
        }}
        onAgain={() => {
          setSuccess({ ...success, visible: false });
          reset();
        }}
        onClose={() => setSuccess({ ...success, visible: false })}
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
    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-txt-secondary">{label}</Text>
      <Text
        className={`text-xs font-bold ${accent ? 'text-lime' : 'text-ink'
          }`}
      >
        {value}
      </Text>
    </View>
  );
}