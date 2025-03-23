import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3949AB',          // Indigo 600
    secondary: '#5C6BC0',        // Indigo 400
    tertiary: '#7986CB',         // Indigo 300
    accent: '#536DFE',          // Indigo A200
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: 'rgba(92, 107, 192, 0.2)',  // Indigo 400 with opacity
    text: '#1A237E',            // Indigo 900
    onSurface: '#1A237E',
    onBackground: '#1A237E',
    onSurfaceVariant: '#3949AB',
    secondaryContainer: '#C5CAE9', // Indigo 100
    onSecondaryContainer: '#1A237E',
    elevation: {
      level2: '#fff',
    },
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: { fontFamily: 'Poppins_400Regular', fontWeight: '400' },
    bodyMedium: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
    bodySmall: { fontFamily: 'Poppins_400Regular', fontWeight: '400' },
    labelLarge: { fontFamily: 'Poppins_400Regular', fontWeight: '400' },
    thin: { fontFamily: 'Poppins_400Regular', fontWeight: '100' },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5C6BC0',          // Indigo 400
    secondary: '#3949AB',        // Indigo 600
    tertiary: '#1A237E',        // Indigo 900
    accent: '#536DFE',          // Indigo A200
    background: '#000000',       // Black background
    surface: '#1E2433',         // Dark bluish surface
    surfaceVariant: 'rgba(92, 107, 192, 0.2)', // Indigo with opacity
    secondaryContainer: '#252B3B', // Slightly lighter bluish gray
    onSecondaryContainer: '#E8EAF6', // Indigo 50
    text: '#E8EAF6',            // Indigo 50
    onSurface: '#E8EAF6',
    onBackground: '#E8EAF6',
    onSurfaceVariant: '#C5CAE9', // Indigo 100
    elevation: {
      level1: '#111',
      level2: '#222',
    },
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    bodyLarge: { fontFamily: 'Poppins_400Regular', fontWeight: '400' },
    bodyMedium: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
    bodySmall: { fontFamily: 'Poppins_400Regular', fontWeight: '400' },
    labelLarge: { fontFamily: 'Poppins_400Regular', fontWeight: '400' },
    thin: { fontFamily: 'Poppins_400Regular', fontWeight: '100' },
  },
};
