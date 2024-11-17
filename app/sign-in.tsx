import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';

WebBrowser.maybeCompleteAuthSession();

const SignIn = () => {
  useWarmUpBrowser();
  const router = useRouter();
  const theme = useTheme();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
        }
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
          Welcome to LabWise
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.secondary }]}>
          Sign in to continue
        </Text>
        
        <Button 
          mode="contained"
          onPress={onPress}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="google"
        >
          Sign in with Google
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default SignIn;