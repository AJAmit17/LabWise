import { PaperProvider, adaptNavigationTheme, IconButton } from 'react-native-paper';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { useState, useCallback } from 'react';
import { lightTheme, darkTheme } from '../../theme';
import { useAuth } from "@clerk/clerk-expo";

export default function TabLayout() {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const [isDarkTheme, setIsDarkTheme] = useState(colorScheme === 'dark');

  const theme = isDarkTheme ? darkTheme : lightTheme;
  const { LightTheme, DarkTheme: NavigationDarkTheme } = adaptNavigationTheme({
    reactNavigationLight: DefaultTheme,
    reactNavigationDark: DarkTheme,
  });

  const toggleTheme = useCallback(() => {
    setIsDarkTheme(!isDarkTheme);
  }, [isDarkTheme]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const ThemeIcon = useCallback(() => (
    <IconButton
      icon={isDarkTheme ? 'white-balance-sunny' : 'moon-waning-crescent'}
      size={24}
      iconColor={theme.colors.primary}
      onPress={toggleTheme}
      style={[
        styles.themeToggle,
        { backgroundColor: theme.colors.surface }
      ]}
    />
  ), [isDarkTheme, theme]);

  const HeaderRight = useCallback(() => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <ThemeIcon />
      <IconButton
        icon="logout"
        size={24}
        iconColor={theme.colors.primary}
        onPress={handleLogout}
        style={[
          styles.themeToggle,
          { backgroundColor: theme.colors.surface }
        ]}
      />
    </View>
  ), [isDarkTheme, theme, handleLogout]);

  return (
    <PaperProvider theme={theme}>
      <Tabs
        screenOptions={{
          tabBarStyle: [styles.tabBar, { backgroundColor: theme.colors.surface }],
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: isDarkTheme ? '#757575' : '#999999',
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.colors.primary,
          tabBarLabelStyle: styles.tabBarLabel,
          headerRight: () => <HeaderRight />,
          headerRightContainerStyle: {
            paddingRight: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
            tabBarLabel: 'Home',
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: "Experiments",
            headerTitle: "NHCE CSE-DS Lab Experiments",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "flask" : "flask-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="three"
          options={{
            title: "Time Table 5th Sem",
            headerTitle: "CSE-DS Class Time Table",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeToggle: {
    margin: 4,
    borderRadius: 20,
  },
});