import React from 'react';
import { StyleSheet, View, Linking } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

const ContactSection = () => {
  const theme = useTheme();

  const openGitHubIssues = () => {
    Linking.openURL('https://github.com/AJAmit17/LabWise/issues');
  };

  const openEmailClient = () => {
    Linking.openURL('mailto:amit.acharya.work@gmail.com');
  };

  return (
    <Animated.View
      entering={FadeIn.duration(1000).delay(1200)}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
        Contact Me
      </Text>
      <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurface }]}>
        Facing issues or have suggestions? I'm here to help!
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={openGitHubIssues}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="github" size={size} color={color} />
          )}
          style={styles.button}
          textColor={theme.colors.onPrimary}
        >
          Report on GitHub
        </Button>
        <Button
          mode="outlined"
          onPress={openEmailClient}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="email" size={size} color={color} />
          )}
          style={styles.button}
          textColor={theme.colors.onBackground}
        >
          Email Me
        </Button>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    marginHorizontal: 10,
  },
});

export default ContactSection;
