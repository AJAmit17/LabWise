import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';
import React from 'react';
import { NotificationProvider } from '@/context/NotificationContext';
import { ScheduleProvider } from '@/context/ScheduleContext';
import { en, registerTranslation } from 'react-native-paper-dates';

registerTranslation('en', en);

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6200ee" />
    </View>
  );
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const isExperimentRoute = segments[0] === 'experiment';

    if (isSignedIn && !inTabsGroup && !isExperimentRoute) {
      router.replace('/(tabs)');
    } else if (!isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isSignedIn, segments]);

  if (!isLoaded) return <LoadingScreen />;

  return (
    <PaperProvider theme={theme}>
      <NotificationProvider>
        <ScheduleProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.primary,
                headerShadowVisible: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="experiment/[id]"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                  headerTitle: 'Experiment Details',
                }}
              />
              <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          </ThemeProvider>
        </ScheduleProvider>
      </NotificationProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
  }

  if (!loaded) return <LoadingScreen />;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
