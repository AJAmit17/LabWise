import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Button, Text, Card, Title, IconButton, Chip, Divider, FAB, Portal, Dialog, List, useTheme } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Course, AttendanceRecord, ExtraClassesRecord, DailySchedule, AttendanceStatus } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AttendanceUpdate {
    courseId: string;
    status: AttendanceStatus;
}

interface ExtraClassData {
    courseId: string;
    courseName: string;
    status: AttendanceStatus;
    time: string;
}

interface ExtraClassesUpdate {
    [date: string]: {
        [slotId: string]: ExtraClassData;
    };
}

interface UpdateExtraClassStatusParams {
    slotId: string;
    status: AttendanceStatus;
}

interface TimeSlot {
    time: string;
}

interface ClassSchedule {
    slotId: string;
    courseName: string;
    timeSlot: TimeSlot;
    isExtra?: boolean;
    status?: AttendanceStatus;
}

export default function CalendarPage() {
    const theme = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [showExtraClassDialog, setShowExtraClassDialog] = useState(false);
    const [extraClasses, setExtraClasses] = useState<ExtraClassesRecord>({});
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadCourses();
        loadAttendance();
        loadExtraClasses();
    }, []);

    const loadCourses = async () => {
        const savedCourses = await AsyncStorage.getItem('courses');
        if (savedCourses) setCourses(JSON.parse(savedCourses));
    };

    const loadAttendance = async () => {
        const savedAttendance = await AsyncStorage.getItem('attendance');
        if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    };

    const loadExtraClasses = async () => {
        const saved = await AsyncStorage.getItem('extraClasses');
        if (saved) setExtraClasses(JSON.parse(saved));
    };

    const saveAttendance = async ({ courseId, status }: AttendanceUpdate): Promise<void> => {
        const newAttendance: AttendanceRecord = {
            ...attendance,
            [selectedDate]: {
                ...(attendance[selectedDate] || {})
            }
        };

        // Toggle logic - if the same status is clicked again, remove the attendance record
        if (attendance[selectedDate]?.[courseId] === status) {
            // Deselect/reset the attendance status
            delete newAttendance[selectedDate][courseId];

            // Clean up empty date entries
            if (Object.keys(newAttendance[selectedDate]).length === 0) {
                delete newAttendance[selectedDate];
            }
        } else {
            // Set the new status
            newAttendance[selectedDate][courseId] = status;
        }

        await AsyncStorage.setItem('attendance', JSON.stringify(newAttendance));
        setAttendance(newAttendance);
    };

    const handleExtraClass = async (course: Course): Promise<void> => {
        const extraSlotId = `extra-${Date.now()}`;
        const newExtraClasses: ExtraClassesUpdate = {
            ...extraClasses,
            [selectedDate]: {
                ...(extraClasses[selectedDate] || {}),
                [extraSlotId]: {
                    courseId: course.id,
                    courseName: course.courseName,
                    status: 'present',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            }
        };

        // Update both extraClasses and attendance records
        const newAttendance: AttendanceRecord = {
            ...attendance,
            [selectedDate]: {
                ...(attendance[selectedDate] || {}),
                [extraSlotId]: 'present'
            }
        };

        await Promise.all([
            AsyncStorage.setItem('extraClasses', JSON.stringify(newExtraClasses)),
            AsyncStorage.setItem('attendance', JSON.stringify(newAttendance))
        ]);

        setExtraClasses(newExtraClasses);
        setAttendance(newAttendance);
        setShowExtraClassDialog(false);
    };

    const updateExtraClassStatus = async ({ slotId, status }: UpdateExtraClassStatusParams): Promise<void> => {
        const newExtraClasses: ExtraClassesRecord = {
            ...extraClasses,
            [selectedDate]: {
                ...extraClasses[selectedDate]
            }
        };

        // Toggle logic - if the same status is clicked again, reset to default status
        if (extraClasses[selectedDate]?.[slotId]?.status === status) {
            // For extra classes, we don't remove them entirely, just reset the status
            // Default to 'present' when resetting (or you could use null/undefined if preferred)
            newExtraClasses[selectedDate][slotId] = {
                ...newExtraClasses[selectedDate][slotId],
                status: 'present' // Reset to default 'present'
            };
        } else {
            // Set the new status
            newExtraClasses[selectedDate][slotId] = {
                ...extraClasses[selectedDate][slotId],
                status
            };
        }

        await AsyncStorage.setItem('extraClasses', JSON.stringify(newExtraClasses));
        setExtraClasses(newExtraClasses);
    };

    const deleteExtraClass = async (slotId: string): Promise<void> => {
        try {
            // Remove from extraClasses
            const newExtraClasses = { ...extraClasses };
            if (newExtraClasses[selectedDate]) {
                delete newExtraClasses[selectedDate][slotId];
                if (Object.keys(newExtraClasses[selectedDate]).length === 0) {
                    delete newExtraClasses[selectedDate];
                }
            }

            // Remove from attendance
            const newAttendance = { ...attendance };
            if (newAttendance[selectedDate]) {
                delete newAttendance[selectedDate][slotId];
                if (Object.keys(newAttendance[selectedDate]).length === 0) {
                    delete newAttendance[selectedDate];
                }
            }

            await Promise.all([
                AsyncStorage.setItem('extraClasses', JSON.stringify(newExtraClasses)),
                AsyncStorage.setItem('attendance', JSON.stringify(newAttendance))
            ]);

            setExtraClasses(newExtraClasses);
            setAttendance(newAttendance);
        } catch (error) {
            console.error('Error deleting extra class:', error);
        }
    };

    const getMarkedDates = () => {
        const marks: { [key: string]: { marked: boolean; dotColor: string } } = {};

        // Get all valid slot IDs from current courses
        const validSlotIds = new Set(
            courses.flatMap(course =>
                course.schedule?.map(slot => slot.id) || []
            )
        );

        const validCourseIds = new Set(
            courses.map(course => course.id)
        );

        // Process regular attendance - only for existing courses
        Object.entries(attendance).forEach(([date, dayAttendance]) => {
            // Filter attendance for valid slots only
            const validAttendances = Object.entries(dayAttendance).filter(([slotId]) =>
                validSlotIds.has(slotId)
            );

            if (validAttendances.length > 0) {
                const presentCount = validAttendances.filter(([_, status]) =>
                    status === 'present'
                ).length;

                marks[date] = {
                    marked: true,
                    dotColor: presentCount === validAttendances.length ? 'green' :
                        presentCount === 0 ? 'red' : 'orange'
                };
            }
        });

        // Process extra classes - only for existing courses
        Object.entries(extraClasses).forEach(([date, dayExtra]) => {
            // Filter extra classes for valid courses only
            const validExtras = Object.values(dayExtra).filter(data =>
                validCourseIds.has(data.courseId)
            );

            if (validExtras.length > 0) {
                const presentCount = validExtras.filter(data =>
                    data.status === 'present'
                ).length;

                if (!marks[date]) {
                    marks[date] = {
                        marked: true,
                        dotColor: presentCount === validExtras.length ? 'green' :
                            presentCount === 0 ? 'red' : 'orange'
                    };
                }
            }
        });

        return marks;
    };

    function getDayName(dateString: string) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[new Date(dateString).getDay()];
    }

    const getDaySchedule = (dateString: string): DailySchedule[] => {
        const dayName = getDayName(dateString);
        return courses.flatMap((course) => {
            const daySlots = course.schedule?.filter((slot) => slot.day === dayName) || [];
            return daySlots.map(slot => ({
                ...course,
                slotId: slot.id,
                timeSlot: slot
            }));
        }).sort((a, b) => a.timeSlot.time.localeCompare(b.timeSlot.time));
    };

    const getAllDayClasses = (dateString: string): ClassSchedule[] => {
        const regularClasses: DailySchedule[] = getDaySchedule(dateString);
        const extraClassesForDay: ClassSchedule[] = Object.entries(extraClasses[dateString] || {}).map(([slotId, data]) => ({
            slotId,
            courseName: data.courseName,
            timeSlot: { time: data.time },
            isExtra: true,
            status: data.status
        }));

        return [...regularClasses, ...extraClassesForDay]
            .sort((a, b) => a.timeSlot.time.localeCompare(b.timeSlot.time));
    };

    const getStatusIcon = (status: AttendanceStatus | undefined) => {
        switch (status) {
            case 'present': return 'check-circle';
            case 'absent': return 'close-circle';
            case 'noclass': return 'minus-circle';
            default: return 'help-circle-outline';
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            loadCourses(),
            loadAttendance(),
            loadExtraClasses(),
        ]);
        setRefreshing(false);
    }, []);

    const getCalendarTheme = () => ({
        backgroundColor: theme.colors.background,
        calendarBackground: theme.colors.surface,
        textSectionTitleColor: theme.colors.primary,
        selectedDayBackgroundColor: theme.colors.primary,
        selectedDayTextColor: theme.colors.onPrimary,
        todayTextColor: theme.colors.primary,
        dayTextColor: theme.colors.onBackground,
        textDisabledColor: theme.colors.surfaceDisabled,
        dotColor: theme.colors.primary,
        selectedDotColor: theme.colors.onPrimary,
        arrowColor: theme.colors.onBackground,
        monthTextColor: theme.colors.onBackground,
        textDayFontWeight: '500',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '500',
        textDayFontSize: 16,
        textMonthFontSize: 20,
        textDayHeaderFontSize: 14,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return { bg: '#E8F5E9', text: '#2E7D32', selectedBg: '#81C784', border: '#2E7D32' };
            case 'absent': return { bg: '#FFEBEE', text: '#C62828', selectedBg: '#EF5350', border: '#C62828', selectedText: '#FFFFFF' };
            case 'noclass': return { bg: '#E3F2FD', text: '#1565C0', selectedBg: '#64B5F6', border: '#1565C0' };
            default: return { bg: '#F5F5F5', text: '#424242', selectedBg: '#BDBDBD', border: '#424242' };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Attendance Calendar</Text>
                </View>

                <Card style={styles.calendarCard}>
                    <Card.Content>
                        <Calendar
                            theme={getCalendarTheme()}
                            onDayPress={(day: { dateString: React.SetStateAction<string>; }) => setSelectedDate(day.dateString)}
                            markedDates={{
                                ...getMarkedDates(),
                                [selectedDate]: {
                                    ...getMarkedDates()[selectedDate],
                                    selected: true,
                                    selectedColor: theme.colors.primary
                                }
                            }}
                            style={styles.calendar}
                            enableSwipeMonths={true}
                        />
                    </Card.Content>
                </Card>

                {selectedDate && (
                    <View style={styles.scheduleContainer}>
                        <Card style={styles.dateCard}>
                            <Card.Content>
                                <View style={styles.dateHeaderContainer}>
                                    <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.onBackground} />
                                    <Text style={styles.dateHeader}>Classes on{" "}
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>

                        {getAllDayClasses(selectedDate).length === 0 ? (
                            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
                                <Card.Content style={styles.emptyCardContent}>
                                    <MaterialCommunityIcons
                                        name="calendar-blank"
                                        size={48}
                                        color={theme.colors.primary}
                                    />
                                    <Text
                                        variant="titleMedium"
                                        style={[styles.emptyText, { color: theme.colors.onSurface }]}
                                    >
                                        No Classes Scheduled
                                    </Text>
                                    <Text
                                        variant="bodyMedium"
                                        style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}
                                    >
                                        Tap the + button to add an extra class
                                    </Text>
                                </Card.Content>
                            </Card>
                        ) : (
                            getAllDayClasses(selectedDate).map((schedule) => (
                                <Card key={schedule.slotId} style={[styles.courseCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                                    <Card.Content>
                                        <View style={styles.courseHeader}>
                                            <View style={styles.courseInfo}>
                                                <Title style={styles.courseTitle}>{schedule.courseName}</Title>
                                                <View style={styles.timeContainer}>
                                                    <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurface} />
                                                    <Text style={styles.courseTime}>
                                                        {schedule.timeSlot.time}
                                                        {schedule.isExtra && (
                                                            <Text style={styles.extraBadge}> (Extra Class)</Text>
                                                        )}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.statusContainer}>
                                                {(schedule.isExtra ?
                                                    extraClasses[selectedDate]?.[schedule.slotId]?.status :
                                                    attendance[selectedDate]?.[schedule.slotId]) && (
                                                        <View style={styles.currentStatusContainer}>
                                                            <MaterialCommunityIcons
                                                                name={getStatusIcon(schedule.isExtra ?
                                                                    extraClasses[selectedDate]?.[schedule.slotId]?.status :
                                                                    attendance[selectedDate]?.[schedule.slotId])}
                                                                size={20}
                                                                color={theme.colors.onPrimary}
                                                            />
                                                            <Text style={styles.currentStatusText}>
                                                                {(schedule.isExtra ?
                                                                    extraClasses[selectedDate]?.[schedule.slotId]?.status :
                                                                    attendance[selectedDate]?.[schedule.slotId]).toUpperCase()}
                                                            </Text>
                                                        </View>
                                                    )}
                                                {schedule.isExtra && (
                                                    <IconButton
                                                        icon="delete"
                                                        iconColor={theme.colors.error}
                                                        size={20}
                                                        onPress={() => deleteExtraClass(schedule.slotId)}
                                                        style={styles.deleteButton}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                        <Divider style={styles.divider} />
                                        <View style={styles.attendanceButtons}>
                                            {[
                                                { value: 'present', label: 'Present' },
                                                { value: 'absent', label: 'Absent' },
                                                { value: 'noclass', label: 'No Class' }
                                            ].map(({ value, label }) => {
                                                const isSelected = schedule.isExtra ?
                                                    extraClasses[selectedDate]?.[schedule.slotId]?.status === value :
                                                    attendance[selectedDate]?.[schedule.slotId] === value;
                                                const colors = getStatusColor(value);

                                                return (
                                                    <Chip
                                                        key={value}
                                                        selected={isSelected}
                                                        onPress={() => schedule.isExtra ?
                                                            updateExtraClassStatus({ slotId: schedule.slotId, status: value as AttendanceStatus }) :
                                                            saveAttendance({ courseId: schedule.slotId, status: value as AttendanceStatus })
                                                        }
                                                        style={[
                                                            styles.statusChip,
                                                            { 
                                                                backgroundColor: isSelected ? colors.selectedBg : colors.bg,
                                                                borderWidth: 1,
                                                                borderColor: isSelected ? colors.border : '#CCCCCC'
                                                            }
                                                        ]}
                                                        textStyle={{
                                                            color: (isSelected && value === 'absent' && colors.selectedText) ? 
                                                                colors.selectedText : colors.text,
                                                            fontWeight: isSelected ? 'bold' : 'normal'
                                                        }}
                                                        icon={isSelected ? 'check' : undefined}
                                                        mode={isSelected ? 'flat' : 'outlined'}
                                                        elevated={isSelected}
                                                    >
                                                        {label}
                                                    </Chip>
                                                );
                                            })}
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            <Portal>
                <Dialog
                    visible={showExtraClassDialog}
                    onDismiss={() => setShowExtraClassDialog(false)}
                    style={{
                        backgroundColor: theme.colors.background,
                        borderRadius: 12,
                        zIndex: 1000,
                    }}
                >
                    <Dialog.Title style={{ color: theme.colors.onSurface }}>
                        Add Extra Class
                    </Dialog.Title>
                    <Dialog.Content>
                        {courses.map((course) => (
                            <List.Item
                                key={course.id}
                                title={course.courseName}
                                titleStyle={{ color: theme.colors.onSurface }}
                                onPress={() => handleExtraClass(course)}
                                right={props => <List.Icon {...props} icon="plus" color={theme.colors.primary} />}
                                style={[styles.dialogListItem, { backgroundColor: theme.colors.surface }]}
                            />
                        ))}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            mode="contained"
                            onPress={() => setShowExtraClassDialog(false)}
                        >
                            Cancel
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <FAB
                icon="plus"
                label="Add Extra Class"
                style={styles.fab}
                color={theme.colors.onPrimary}
                onPress={() => setShowExtraClassDialog(true)}
                disabled={!selectedDate}
            />
        </View>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scheduleContainer: {
        marginTop: 16,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 80,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.onBackground,
    },
    calendarCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        elevation: 4,
        marginBottom: 20,
    },
    calendar: {
        borderRadius: 12,
    },
    dateCard: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
    },
    dateHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateHeader: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.onBackground,
    },
    emptyCard: {
        borderRadius: 12,
        marginBottom: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: theme.colors.outline,
    },
    emptyCardContent: {
        alignItems: 'center',
        padding: 32,
        gap: 8,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '500',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
    },
    courseCard: {
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    courseInfo: {
        flex: 1,
        marginRight: 16,
    },
    courseTitle: {
        fontSize: 18,
        color: theme.colors.onSurface,
        fontWeight: 'bold',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    courseTime: {
        color: theme.colors.onSurface,
        fontSize: 14,
    },
    extraBadge: {
        color: theme.colors.primary,
        fontStyle: 'italic',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currentStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.onSurface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    currentStatusText: {
        color: theme.colors.onPrimary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    deleteButton: {
        margin: 0,
    },
    divider: {
        marginVertical: 16,
    },
    attendanceButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    statusChip: {
        flex: 1,
        borderRadius: 12,
        height: 40,
        justifyContent: 'center',
        elevation: 1,
    },
    dialogListItem: {
        borderRadius: 8,
        marginVertical: 4,
        elevation: 1,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: theme.colors.primary,
        borderRadius: 28,
        elevation: 4,
    }
});