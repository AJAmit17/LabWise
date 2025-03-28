import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
    department: string;
    year: string;
    semester: string;
    section: string;
}

const PREFERENCES_KEY = 'user_timetable_preferences';

export const saveUserPreferences = async (preferences: UserPreferences) => {
    try {
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        return true;
    } catch (error) {
        console.error('Error saving preferences:', error);
        return false;
    }
};

export const getUserPreferences = async (): Promise<UserPreferences | null> => {
    try {
        const preferences = await AsyncStorage.getItem(PREFERENCES_KEY);
        return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
        console.error('Error getting preferences:', error);
        return null;
    }
};
