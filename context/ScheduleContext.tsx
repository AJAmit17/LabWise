import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from './NotificationContext';

interface ClassSchedule {
    id: string;
    day: string;
    courseName: string;
    courseCode: string;
    lecturer: string;
    startTime: string;
    endTime: string;
}

const PREDEFINED_SCHEDULE: ClassSchedule[] = [
    {
        id: '1',
        day: 'Monday',
        courseName: 'Mathematics',
        courseCode: 'MATH101',
        lecturer: 'Dr. Smith',
        startTime: '09:00',
        endTime: '10:30'
    },
    {
        id: '2',
        day: 'Monday',
        courseName: 'Physics',
        courseCode: 'PHY101',
        lecturer: 'Dr. Johnson',
        startTime: '11:00',
        endTime: '12:30'
    },
    // Add more classes as needed
];

interface ScheduleContextType {
    schedule: ClassSchedule[];
}

const ScheduleContext = createContext<ScheduleContextType>({
    schedule: [],
});

export const useSchedule = () => useContext(ScheduleContext);

interface ScheduleProviderProps {
    children: React.ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
    const [schedule, setSchedule] = useState<ClassSchedule[]>(PREDEFINED_SCHEDULE);
    const { scheduleNotification } = useNotifications();

    useEffect(() => {
        // Schedule notifications for all classes
        PREDEFINED_SCHEDULE.forEach(async (classItem) => {
            try {
                await scheduleNotification({
                    className: classItem.courseName,
                    startTime: classItem.startTime,
                    day: classItem.day
                });
            } catch (error) {
                console.error(`Failed to schedule notification for ${classItem.courseName}:`, error);
            }
        });
    }, []);

    return (
        <ScheduleContext.Provider value={{ schedule }}>
            {children}
        </ScheduleContext.Provider>
    );
};