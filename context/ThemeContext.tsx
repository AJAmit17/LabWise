import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '@/theme';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
    theme: typeof lightTheme | typeof darkTheme;
    isDarkMode: boolean;
    themePreference: ThemePreference;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState<ThemePreference>('system');

    const isDarkMode = themePreference === 'system'
        ? systemColorScheme === 'dark'
        : themePreference === 'dark';

    const theme = isDarkMode ? darkTheme : lightTheme;

    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('themePreference');
                if (savedTheme) {
                    setThemePreference(savedTheme as ThemePreference);
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            }
        };

        loadThemePreference();
    }, []);

    const toggleTheme = async () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setThemePreference(newTheme);
        try {
            await AsyncStorage.setItem('themePreference', newTheme);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, themePreference, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};
