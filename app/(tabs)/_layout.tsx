import { PaperProvider, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#f6f6f6',
    surface: '#ffffff',
  },
};

const { LightTheme } = adaptNavigationTheme({ reactNavigationLight: DefaultTheme });

export default function TabLayout() {
  return (
    <PaperProvider theme={theme}>
        <Tabs
          screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: '#757575',
            headerStyle: {
              backgroundColor: theme.colors.surface,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: theme.colors.primary,
            tabBarLabelStyle: styles.tabBarLabel,
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
              title: "Community",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? "people" : "people-outline"} 
                  size={24} 
                  color={color}
                />
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
});