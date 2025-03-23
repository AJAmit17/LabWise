import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider, useThemeContext } from '@/context/ThemeContext';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6200ee" />
    </View>
  );
}

function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { theme, isDarkMode } = useThemeContext();
  const navigationTheme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';

    if (!inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, []);

  return (
    <PaperProvider
      //@ts-ignore
      theme={theme}
    >
      <NavigationThemeProvider value={navigationTheme}>
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
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="experiment/[id]"
            options={{
              animation: 'fade_from_bottom',
              headerShown: true,
              headerTitle: 'Experiment Details',
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
      </NavigationThemeProvider>
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
    <ThemeProvider>
      <InitialLayout />
    </ThemeProvider>
  );
}