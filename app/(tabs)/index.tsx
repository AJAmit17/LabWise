import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions, useColorScheme } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import HeroSection from '@/components/landing/heroSection';
import InfoCard from '@/components/landing/inforCard';
import SubjectsSection from '@/components/landing/subjectSection';
import FeaturesSection from '@/components/landing/featureSection';
import Footer from '@/components/landing/footer';

const { width } = Dimensions.get('window');

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EE',
    accent: '#03DAC6',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#000000',
    onSurface: '#000000',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: { fontFamily: 'Poppins_400Regular', fontWeight: 400 },
    bodyMedium: { fontFamily: 'Poppins_600SemiBold', fontWeight: 600 },
    bodySmall: { fontFamily: 'Poppins_400Regular', fontWeight: 400 },
    labelLarge: { fontFamily: 'Poppins_400Regular', fontWeight: 400 },
    thin: { fontFamily: 'Poppins_400Regular', fontWeight: 100 },
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    accent: '#03DAC6',
    background: '#121212',
    surface: '#1F1B24',
    text: '#FFFFFF',
    onSurface: '#FFFFFF',
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    bodyLarge: { fontFamily: 'Poppins_400Regular', fontWeight: 400 },
    bodyMedium: { fontFamily: 'Poppins_600SemiBold', fontWeight: 600 },
    bodySmall: { fontFamily: 'Poppins_400Regular', fontWeight: 400 },
    labelLarge: { fontFamily: 'Poppins_400Regular', fontWeight: 400 },
    thin: { fontFamily: 'Poppins_400Regular', fontWeight: 100 },
  },
};

export default function App() {
  const colorScheme = useColorScheme(); // Detect light or dark mode
  const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider
        // @ts-ignore
        theme={theme}>
        <SafeAreaProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
            <HeroSection />
            <View style={styles.content}>
              <Animated.View entering={FadeIn.duration(1000).delay(300)}>
                <InfoCard />
              </Animated.View>
              <Animated.View entering={FadeIn.duration(1000).delay(600)}>
                <SubjectsSection />
              </Animated.View>
              <Animated.View entering={FadeIn.duration(1000).delay(900)}>
                <FeaturesSection />
              </Animated.View>
            </View>
            <Footer />
          </ScrollView>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 30, // Add some top padding to separate from the hero section
  },
});
