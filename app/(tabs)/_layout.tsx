import { PaperProvider } from 'react-native-paper';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useState } from 'react';
import { lightTheme, darkTheme } from '@/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isDarkTheme] = useState(colorScheme === 'dark');
  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <PaperProvider
      // @ts-ignore
      theme={theme}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            height: 80,
            paddingBottom: 12,
            paddingTop: 12,
            shadowColor: theme.colors.onSurface,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 8,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.onSurface,
            elevation: 4,
          },
          headerTintColor: theme.colors.onSurface,
          tabBarLabelStyle: {
            fontFamily: theme.fonts.labelLarge?.fontFamily,
            fontWeight: theme.fonts.labelLarge?.fontWeight as "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
            fontSize: 12,
            marginBottom: 4,
          },
          headerTitleStyle: {
            ...theme.fonts.bodyMedium,
            color: theme.colors.onSurface,
          } as any,
          headerRightContainerStyle: {
            paddingRight: 8,
          },
        }}
      >
        {/* <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            ),
            tabBarLabel: 'Home',
          }}
        /> */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Attendance",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        {/* <Tabs.Screen
          name="two"
          options={{
            title: "Experiments",
            headerTitle: "NHCE CSE-DS Lab Experiments",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "flask" : "flask-outline"} size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="four"
          options={{
            title: "Resources",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="file-document" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="three"
          options={{
            title: "Time Table",
            headerTitle: "CSE-DS Class Time Table",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar" size={size} color={color} />
            ),
            headerShown: false,
          }}
        /> */}
      </Tabs>
    </PaperProvider>
  );
}
