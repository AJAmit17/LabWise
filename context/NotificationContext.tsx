import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface NotificationContextType {
    scheduleNotification: (params: ScheduleNotificationParams) => Promise<string>;
    expoPushToken: string;
}

interface ScheduleNotificationParams {
    className: string;
    startTime: string;
    day: string;
}

const NotificationContext = createContext<NotificationContextType>({
    scheduleNotification: async () => '',
    expoPushToken: '',
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [expoPushToken, setExpoPushToken] = useState('');
    //@ts-ignore
    const notificationListener = useRef<Notifications.NotificationSubscription>();
    //@ts-ignore
    const responseListener = useRef<Notifications.NotificationSubscription>();

    useEffect(() => {
        setupNotifications();
        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const setupNotifications = async () => {
        try {
            await configureNotificationHandler();
            const token = await registerForPushNotifications();
            if (token) setExpoPushToken(token);
            setupNotificationChannels();
            setupNotificationListeners();
        } catch (error) {
            console.error('Error setting up notifications:', error);
        }
    };

    const configureNotificationHandler = async () => {
        await Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    };

    const registerForPushNotifications = async () => {
        let token;

        if (!Device.isDevice) {
            console.warn('Must use physical device for Push Notifications');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
            if (!projectId) throw new Error('Project ID not found');

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (error) {
            console.error('Error getting push token:', error);
        }

        return token;
    };

    const setupNotificationChannels = async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('class-reminders', {
                name: 'Class Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#6200ee',
            });
        }
    };

    const setupNotificationListeners = () => {
        notificationListener.current = Notifications.addNotificationReceivedListener(
            notification => {
                console.log('Notification received:', notification);
            }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            response => {
                console.log('Notification response:', response);
            }
        );
    };

    const scheduleNotification = async ({ className, startTime, day }: ScheduleNotificationParams) => {
        try {
            // Parse class time
            const [hours, minutes] = startTime.split(':').map(Number);
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const targetDay = daysOfWeek.indexOf(day);

            // Get current date/time
            const now = new Date();
            const currentDay = now.getDay();

            // Calculate notification time (5 mins before class)
            let notificationDate = new Date();
            notificationDate.setHours(hours, minutes - 5, 0, 0);

            // Calculate days until next class
            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget < 0) {
                daysUntilTarget += 7;
            } else if (daysUntilTarget === 0) {
                // If same day, check if class time already passed
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const classTime = hours * 60 + minutes;
                if (currentTime >= classTime - 5) { // If notification time passed
                    daysUntilTarget = 7; // Schedule for next week
                }
            }

            // Set correct date for next notification
            notificationDate.setDate(now.getDate() + daysUntilTarget);

            // Cancel any existing notifications for this class
            const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
            for (const notification of existingNotifications) {
                if (notification.content.data?.className === className &&
                    notification.content.data?.day === day) {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                }
            }

            // Schedule new notification
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `${className} Starting Soon!`,
                    body: `Your ${className} class starts in 5 minutes!`,
                    data: { className, startTime, day },
                    sound: true,
                },
                trigger: {
                    date: notificationDate,
                    repeats: true,
                    seconds: 7 * 24 * 60 * 60,
                    channelId: 'class-reminders',
                },
            });

            console.log(`Scheduled notification for ${className}:`);
            console.log(`Next notification: ${notificationDate.toLocaleString()}`);
            return identifier;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            throw error;
        }
    };

    return (
        <NotificationContext.Provider value={{ scheduleNotification, expoPushToken }}>
            {children}
        </NotificationContext.Provider>
    );
};