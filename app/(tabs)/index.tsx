import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions, useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { lightTheme, darkTheme } from '@/theme';
import HeroSection from '@/components/landing/heroSection';
import InfoCard from '@/components/landing/inforCard';
import SubjectsSection from '@/components/landing/subjectSection';
import FeaturesSection from '@/components/landing/featureSection';
import Footer from '@/components/landing/footer';
import ContactSection from '@/components/landing/contact';

const { width } = Dimensions.get('window');

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

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
              <Animated.View entering={FadeIn.duration(1000).delay(1200)}>
                <Footer />
              </Animated.View>
            </View>
            <ContactSection />
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
    paddingTop: 30,
  },
});
