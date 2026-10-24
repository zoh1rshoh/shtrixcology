import { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, AccessibilityInfo, Dimensions, Easing } from 'react-native';
import { Image } from 'expo-image'; // EXPO-IMAGE ISHLATAMIZ
import { router } from 'expo-router';
import { storage, api } from '../src/lib/api';
import { useAuth } from '../src/store/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen() {
  const setUser = useAuth((s) => s.setUser);
  
  const [authChecked, setAuthChecked] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [nextRoute, setNextRoute] = useState<'/(tabs)' | '/(auth)/login'>('/(auth)/login');

  // Animatsiya qiymatlari
  const glowOpacity = useRef(new Animated.Value(0)).current;
  
  const markScale = useRef(new Animated.Value(0.3)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markRotate = useRef(new Animated.Value(-15)).current;

  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslateY = useRef(new Animated.Value(15)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // 1. Autentifikatsiya
  useEffect(() => {
    (async () => {
      const token = await storage.getAccessToken();
      if (!token) {
        setNextRoute('/(auth)/login');
        setAuthChecked(true);
        return;
      }
      try {
        const res = await api.auth.refresh();
        setUser(res.user);
        setNextRoute('/(tabs)');
      } catch {
        setNextRoute('/(auth)/login');
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // 2. Animatsiya Ketma-ketligi
  useEffect(() => {
    const startAnimation = async () => {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      
      if (isReduceMotionEnabled) {
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(markOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(markScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(wordmarkOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(taglineOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]).start(() => setAnimationFinished(true));
        return;
      }

      // 0-400ms: Orqa fondagi nozik yorug'lik (Glow)
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // 400-1100ms: "S" belgisining hosil bo'lishi
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(markOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.spring(markScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(markRotate, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // 800-1500ms: Wordmark (Matn) chiqishi
      Animated.sequence([
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(wordmarkOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(wordmarkTranslateY, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // 1200-1800ms: Tagline (Shior) chiqishi
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setAnimationFinished(true);
      }, 2200);
    };

    startAnimation();
  }, []);

  // 3. Yo'naltirish
  useEffect(() => {
    if (authChecked && animationFinished) {
      router.replace(nextRoute);
    }
  }, [authChecked, animationFinished, nextRoute]);

  const spin = markRotate.interpolate({
    inputRange: [-15, 0],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
      
      {/* 1. FON GLOW */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { opacity: glowOpacity, backgroundColor: 'rgba(186, 255, 89, 0.05)' }
        ]} 
      />

      {/* MARKAZIY LOGOTIP QISMLARI */}
      <View className="items-center justify-center" style={{ width: SCREEN_WIDTH * 0.8 }}>
        
        {/* 2. S BELGISI (SVG) */}
        <Animated.View style={{
          opacity: markOpacity,
          transform: [{ scale: markScale }, { rotate: spin }],
          marginBottom: 20,
        }}>
          <Image
            source={require('../assets/svg/logo-mark.svg')}
            style={{ width: SCREEN_WIDTH * 0.45, height: SCREEN_WIDTH * 0.45 }}
            contentFit="contain"
          />
        </Animated.View>

        {/* 3. WORDMARK (SHTRIXCOLOGY) (SVG) */}
        <Animated.View style={{
          opacity: wordmarkOpacity,
          transform: [{ translateY: wordmarkTranslateY }],
          marginBottom: 15,
        }}>
          <Image
            source={require('../assets/svg/wordmark.svg')}
            style={{ width: SCREEN_WIDTH * 0.75, height: 40 }}
            contentFit="contain"
          />
        </Animated.View>

        {/* 4. TAGLINE (RECYCLE VERIFY EARN) (SVG) */}
        <Animated.View style={{ opacity: taglineOpacity }}>
          <Image
            source={require('../assets/svg/tagline.svg')}
            style={{ width: SCREEN_WIDTH * 0.65, height: 20 }}
            contentFit="contain"
          />
        </Animated.View>

      </View>
    </View>
  );
}