// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import toastConfig from '../utils/toastConfig';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <Stack>
          {/* Routes publiques - accessibles sans connexion */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          
          {/* Routes d'authentification */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          
          {/* Routes protégées - nécessitent une connexion */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="notification" options={{ headerShown: false }} />
          <Stack.Screen name="school_guide" options={{ headerShown: false }} />
          <Stack.Screen name="transaction_detail" options={{ headerShown: false }} />
          <Stack.Screen name="notification_detail" options={{ headerShown: false }} />
          <Stack.Screen name="evenement_detail" options={{ headerShown: false }} />
        </Stack>
        <Toast config={toastConfig} />
        <StatusBar style="auto" />
      </LanguageProvider>
    </AuthProvider>
  );
}