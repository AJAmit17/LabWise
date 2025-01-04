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
    Paragraph,
    IconButton,
    useTheme,
    Divider,
    ProgressBar,
    Chip,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Course, AttendanceRecord, ExtraClassesRecord } from '@/types';

interface StatusIconMap {
    present: string;
    absent: string;
    noclass: string;
}

//@ts-ignore
function getDayName(dateString) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(dateString).getDay()];
}

export default function HomePage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [showDialog, setShowDialog] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const theme = useTheme();
    const today = new Date().toISOString().split('T')[0];
    const dayName = getDayName(today);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [savedCourses, savedAttendance, savedExtraClasses] = await Promise.all([
            AsyncStorage.getItem('courses'),
            AsyncStorage.getItem('attendance'),
            AsyncStorage.getItem('extraClasses')
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

        // Count regular classes
        Object.values(attendance).forEach(day => {
            Object.values(day).forEach(status => {
                totalClasses++;
                if (status === 'present') totalPresent++;
            });
        });

        return totalClasses > 0 ? totalPresent / totalClasses : 0;
    };

    const getStatusIcon = (status: keyof StatusIconMap | undefined): string => {
        switch (status) {
            case 'present': return 'check-circle';
            case 'absent': return 'close-circle';
            case 'noclass': return 'minus-circle';
            default: return 'help-circle';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryContainer]}
                    style={styles.header}
                >
                    <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{todaySchedule.length}</Text>
                            <Text style={styles.statLabel}>Today's Classes</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{`${(getAttendanceRate() * 100).toFixed(0)}%`}</Text>
                            <Text style={styles.statLabel}>Attendance Rate</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Today's Schedule</Text>

                    {todaySchedule.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={styles.emptyCardContent}>
                                <IconButton icon="calendar-blank" size={48} />
                                <Text variant="titleMedium">No Classes Today</Text>
                                <Text variant="bodyMedium">Take some time to review your materials</Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        todaySchedule.map((schedule, index) => (
                            <Card key={schedule.slotId} style={styles.courseCard}>
                                <Card.Content>
                                    <View style={styles.courseHeader}>
                                        <View style={styles.courseInfo}>
                                            <Title>{schedule.courseName}</Title>
                                            <Text variant="bodyMedium" style={styles.courseTime}>
                                                {schedule.timeSlot.time}
                                            </Text>
                                        </View>
                                        <IconButton
                                            icon={getStatusIcon(attendance[today]?.[schedule.slotId])}
                                            size={24}
                                            iconColor={theme.colors.primary}
                                        />
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
                                                    attendance[today]?.[schedule.slotId] === status && styles.selectedChip
                                                ]}
                                                mode={attendance[today]?.[schedule.slotId] === status ? 'flat' : 'outlined'}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Chip>
                                        ))}
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}

                    <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <Card style={styles.actionCard} onPress={() => router.push('/attendence/calender/page')}>
                            <Card.Content style={styles.actionCardContent}>
                                <IconButton icon="calendar" size={32} />
                                <Text variant="titleSmall">Calendar</Text>
                            </Card.Content>
                        </Card>
                        <Card style={styles.actionCard} onPress={() => router.push('/attendence/stats/page')}>
                            <Card.Content style={styles.actionCardContent}>
                                <IconButton icon="chart-box" size={32} />
                                <Text variant="titleSmall">Stats</Text>
                            </Card.Content>
                        </Card>
                        <Card style={styles.actionCard} onPress={() => router.push('/attendence/listCourse/page')}>
                            <Card.Content style={styles.actionCardContent}>
                                <IconButton icon="book-edit" size={32} />
                                <Text variant="titleSmall">Courses</Text>
                            </Card.Content>
                        </Card>
                    </View>
                </View>
            </ScrollView>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/attendence/addCourse/page')}
            />

            <Portal>
                <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
                    <Dialog.Title>Course Information</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>View detailed course information and attendance history.</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDialog(false)}>Close</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        top: 0,
        padding: 20,
        paddingBottom: 30,
        borderRadius: 12,
        marginHorizontal: 16,
    },
    date: {
        color: 'white',
        fontSize: 16,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: 'white',
        fontSize: 14,
        opacity: 0.8,
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        marginVertical: 16,
        fontWeight: 'bold',
    },
    emptyCard: {
        marginBottom: 16,
        borderRadius: 12,
    },
    emptyCardContent: {
        alignItems: 'center',
        padding: 20,
    },
    courseCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseInfo: {
        flex: 1,
    },
    courseTime: {
        opacity: 0.6,
        marginTop: 4,
    },
    divider: {
        marginVertical: 12,
    },
    attendanceButtons: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    statusChip: {
        marginRight: 8,
        marginBottom: 8,
    },
    selectedChip: {
        backgroundColor: '#e0e0e0',
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 80,
    },
    actionCard: {
        flex: 1,
        minWidth: 100,
        maxWidth: '30%',
        borderRadius: 12,
    },
    actionCardContent: {
        alignItems: 'center',
        padding: 8,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
});