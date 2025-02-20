import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { en, registerTranslation } from 'react-native-paper-dates';
import { darkTheme, lightTheme } from '@/theme';

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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={isDarkMode ? "#bb86fc" : "#6200ee"} />
    </View>
  );
}
function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigationTheme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (isSignedIn && !inTabsGroup) {
      router.replace('/(tabs)');
    } else if (!isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return <LoadingScreen />;

  return (
    <PaperProvider
      //@ts-ignore
      theme={theme}
    >
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            contentStyle: {
              backgroundColor: theme.colors.background,
            }
          }}
        >
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="experiment/[id]"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Experiment Details',
            }}
          />
          <Stack.Screen
            name="attendence/page"
            options={{
              headerTitle: 'Attendance Dashboard',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="attendence/addCourse/page"
            options={{
              headerShown: true,
              headerTitle: 'Add New Course',
              animation: 'fade_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="attendence/calendar/page"
            options={{
              headerShown: true,
              headerTitle: 'Calendar View',
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="attendence/stats/page"
            options={{
              headerShown: true,
              headerTitle: 'Statistics',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="attendence/listCourse/page"
            options={{
              headerShown: true,
              headerTitle: 'Manage Courses',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return <LoadingScreen />;

  return (
    <ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}