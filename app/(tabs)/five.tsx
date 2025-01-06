import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Card,
    Title,
    FAB,
    Text,
    Button,
    Portal,
    Dialog,
    useTheme,
    Divider,
    Chip,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Course, AttendanceRecord, ExtraClassesRecord } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatusIconMap {
    present: string;
    absent: string;
    noclass: string;
}

interface QuickActionButtonProps {
    icon: string;
    label: string;
    onPress: () => void;
}

//@ts-ignore
function getDayName(dateString) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(dateString).getDay()];
}

export default function HomePage() {
    const theme = useTheme();
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [showDialog, setShowDialog] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const today = new Date().toISOString().split('T')[0];
    const dayName = getDayName(today);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [savedCourses, savedAttendance] = await Promise.all([
            AsyncStorage.getItem('courses'),
            AsyncStorage.getItem('attendance'),
            // AsyncStorage.getItem('extraClasses')
        ]);
        if (savedCourses) setCourses(JSON.parse(savedCourses));
        if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    };

    //@ts-ignore
    const saveAttendance = async (courseId, status) => {
        const newAttendance = {
            ...attendance,
            [today]: {
                ...(attendance[today] || {}),
                [courseId]: status
            }
        };
        await AsyncStorage.setItem('attendance', JSON.stringify(newAttendance));
        setAttendance(newAttendance);
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            loadData(),
        ]);
        setRefreshing(false);
    }, []);

    const todaySchedule = courses.flatMap((course) => {
        const todaySlots = course.schedule?.filter((slot) => slot.day === dayName) || [];
        return todaySlots.map(slot => ({
            ...course,
            slotId: slot.id,
            timeSlot: slot
        }));
    }).sort((a, b) => a.timeSlot.time.localeCompare(b.timeSlot.time));

    const getAttendanceRate = () => {
        let totalPresent = 0;
        let totalClasses = 0;

        // Count only actual classes (exclude 'noclass')
        Object.values(attendance).forEach(day => {
            Object.entries(day).forEach(([_, status]) => {
                if (status !== 'noclass') {  // Skip if marked as 'no class'
                    totalClasses++;
                    if (status === 'present') totalPresent++;
                }
            });
        });

        return totalClasses > 0 ? totalPresent / totalClasses : 0;
    };

    // Update the Today's Classes count to exclude 'noclass'
    const getTodayClassCount = () => {
        const today = new Date().toISOString().split('T')[0];

        // Get the base schedule count for today
        const regularClassesCount = todaySchedule.length;

        // Count marked classes for today (including extra classes)
        let markedClassesCount = 0;
        if (attendance[today]) {
            Object.values(attendance[today]).forEach(status => {
                if (status !== 'noclass') {
                    markedClassesCount++;
                }
            });
        }

        // Return the larger number between scheduled and marked classes
        return Math.max(regularClassesCount, markedClassesCount);
    };

    const getStatusIcon = (status: keyof StatusIconMap | undefined) => {
        switch (status) {
            case 'present': return 'check-circle' as const;
            case 'absent': return 'close-circle' as const;
            case 'noclass': return 'minus-circle' as const;
            default: return 'help-circle' as const;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'absent': return { bg: '#FFEBEE', text: '#C62828' };
            case 'noclass': return { bg: '#E3F2FD', text: '#1565C0' };
            default: return { bg: '#F5F5F5', text: '#424242' };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={['#1A237E', '#3949AB']}
                style={styles.gradientHeader}
            >
                <SafeAreaView style={styles.headerContent}>
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.date}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.primary }]}>
                            <MaterialCommunityIcons name="book-education" size={24} color="white" />
                            <Text style={styles.statValue}>{getTodayClassCount()}</Text>
                            <Text style={styles.statLabel}>Today's Classes</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.primary }]}>
                            <MaterialCommunityIcons name="chart-line" size={24} color="white" />
                            <Text style={styles.statValue}>{`${(getAttendanceRate() * 100).toFixed(0)}%`}</Text>
                            <Text style={styles.statLabel}>Attendance Rate</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.content}>
                    <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                        Today's Schedule
                    </Text>

                    {todaySchedule.length === 0 ? (
                        <Card style={[styles.emptyCard, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.surfaceVariant
                        }]}>
                            <Card.Content style={styles.emptyCardContent}>
                                <MaterialCommunityIcons name="calendar-blank" size={48} color="#9E9E9E" />
                                <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurface }]}>
                                    No Classes Today
                                </Text>
                                <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                                    Time to catch up on studies!
                                </Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        todaySchedule.map((schedule) => (
                            <Card key={schedule.slotId} style={[styles.courseCard, {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.surfaceVariant
                            }]}>
                                <Card.Content>
                                    <View style={styles.courseHeader}>
                                        <View style={styles.courseInfo}>
                                            <Title style={[styles.courseName, { color: theme.colors.onSurface }]}>
                                                {schedule.courseName}
                                            </Title>
                                            <View style={styles.timeContainer}>
                                                <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                                                <Text style={[styles.courseTime, { color: theme.colors.onSurfaceVariant }]}>
                                                    {schedule.timeSlot.time}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(attendance[today]?.[schedule.slotId]).bg }
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={getStatusIcon(attendance[today]?.[schedule.slotId])}
                                                size={16}
                                                color={getStatusColor(attendance[today]?.[schedule.slotId]).text}
                                            />
                                            <Text style={[
                                                styles.statusText,
                                                { color: getStatusColor(attendance[today]?.[schedule.slotId]).text }
                                            ]}>
                                                {attendance[today]?.[schedule.slotId] || 'Not Marked'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Divider style={styles.divider} />
                                    <View style={styles.attendanceButtons}>
                                        {['present', 'absent', 'noclass'].map((status) => (
                                            <Chip
                                                key={status}
                                                selected={attendance[today]?.[schedule.slotId] === status}
                                                onPress={() => saveAttendance(schedule.slotId, status)}
                                                style={[
                                                    styles.statusChip,
                                                    {
                                                        backgroundColor: attendance[today]?.[schedule.slotId] === status
                                                            ? getStatusColor(status).bg
                                                            : 'transparent'
                                                    }
                                                ]}
                                                textStyle={{
                                                    color: attendance[today]?.[schedule.slotId] === status
                                                        ? getStatusColor(status).text
                                                        : '#666'
                                                }}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Chip>
                                        ))}
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}

                    <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                        Quick Actions
                    </Text>
                    <View style={styles.quickActions}>
                        <QuickActionButton
                            icon="calendar-month"
                            label="Calendar"
                            onPress={() => router.push('/attendence/calendar/page')}
                        />
                        <QuickActionButton
                            icon="chart-box"
                            label="Statistics"
                            onPress={() => router.push('/attendence/stats/page')}
                        />
                        <QuickActionButton
                            icon="book-edit"
                            label="Courses"
                            onPress={() => router.push('/attendence/listCourse/page')}
                        />
                    </View>
                </View>
            </ScrollView>

            <FAB
                icon="plus"
                label="Add Course"
                color={theme.colors.onPrimary}
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/attendence/addCourse/page')}
            />

            <Portal>
                <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
                    <Dialog.Title>Course Information</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            View detailed course information and attendance history.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="contained" onPress={() => setShowDialog(false)}>
                            Close
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const QuickActionButton = ({ icon, label, onPress }: QuickActionButtonProps) => {
    const theme = useTheme();
    return (
        <Card style={[styles.actionCard, { backgroundColor: theme.colors.secondaryContainer }]} onPress={onPress}>
            <Card.Content style={styles.actionCardContent}>
                <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={32} color={theme.colors.onSecondaryContainer} />
                <Text style={[styles.actionLabel, { color: theme.colors.onSecondaryContainer }]}>{label}</Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    gradientHeader: {
        width: '100%',
        paddingBottom: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        padding: 24,
    },
    welcomeText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    date: {
        color: 'white',
        fontSize: 16,
        opacity: 0.9,
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    statValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    statLabel: {
        color: 'white',
        fontSize: 14,
        opacity: 0.9,
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        marginVertical: 24,
        fontWeight: 'bold',
        fontSize: 20,
    },
    emptyCard: {
        marginBottom: 24,
        borderRadius: 16,
        elevation: 2,
        borderWidth: 1,
    },
    emptyCardContent: {
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
    },
    emptySubtext: {
        marginTop: 8,
    },
    courseCard: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 4,
        borderWidth: 1,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseInfo: {
        flex: 1,
    },
    courseName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    courseTime: {
        marginLeft: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    divider: {
        marginVertical: 16,
    },
    attendanceButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    statusChip: {
        borderRadius: 12,
        borderWidth: 1,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 80,
    },
    actionCard: {
        flex: 1,
        minWidth: 100,
        borderRadius: 16,
        elevation: 3,
    },
    actionCardContent: {
        alignItems: 'center',
        padding: 16,
    },
    actionLabel: {
        marginTop: 8,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
});