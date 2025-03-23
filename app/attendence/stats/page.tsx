import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, RefreshControl } from 'react-native';
import { Card, Title, Text, IconButton, Portal, Dialog, TextInput, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Course, AttendanceRecord, ExtraClassesRecord } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

interface AttendanceStatus {
    color: string;
    icon: string;
}

interface AttendanceCalculation {
    present: number;
    total: number;
    target: number;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
                <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
            </View>
        </View>
    );
};

export default function StatsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [extraClasses, setExtraClasses] = useState<ExtraClassesRecord>({});
    const [minimumAttendance, setMinimumAttendance] = useState<number>(75);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [tempMinAttendance, setTempMinAttendance] = useState('75');
    const [refreshing, setRefreshing] = useState(false);
    const [lastExportDate, setLastExportDate] = useState<string | null>(null);
    const router = useRouter();
    const theme = useTheme();

    useEffect(() => {
        loadData();
        checkLastExport();
    }, []);

    const loadData = async () => {
        try {
            const [savedCourses, savedAttendance, savedMinAttendance, savedExtraClasses] = await Promise.all([
                AsyncStorage.getItem('courses'),
                AsyncStorage.getItem('attendance'),
                AsyncStorage.getItem('minimumAttendance'),
                AsyncStorage.getItem('extraClasses')
            ]);

            if (savedCourses) setCourses(JSON.parse(savedCourses));
            if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
            if (savedMinAttendance) setMinimumAttendance(Number(savedMinAttendance));
            if (savedExtraClasses) setExtraClasses(JSON.parse(savedExtraClasses));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const checkLastExport = async () => {
        const lastExport = await AsyncStorage.getItem('lastExportDate');
        setLastExportDate(lastExport);
    };

    const saveMinimumAttendance = async () => {
        const value = Number(tempMinAttendance);
        if (value >= 0 && value <= 100) {
            try {
                await AsyncStorage.setItem('minimumAttendance', tempMinAttendance);
                setMinimumAttendance(value);
                setShowSettingsDialog(false);
            } catch (error) {
                console.error('Error saving minimum attendance:', error);
            }
        } else {
            alert('Please enter a valid percentage between 0 and 100');
        }
    };

    //@ts-ignore
    const calculateAttendance = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return { present: 0, total: 0, percentage: 0 };

        const courseSlots = course.schedule || [];
        const slotIds = courseSlots.map(slot => slot.id);

        let present = 0;
        let total = 0;

        // Count regular attendance, excluding 'noclass'
        Object.entries(attendance).forEach(([date, dayAttendance]) => {
            Object.entries(dayAttendance).forEach(([slotId, status]) => {
                if (slotIds.includes(slotId) && status !== 'noclass') {
                    total++;
                    if (status === 'present') present++;
                }
            });
        });

        // Count extra classes, excluding 'noclass'
        Object.entries(extraClasses || {}).forEach(([date, dayExtra]) => {
            Object.entries(dayExtra).forEach(([slotId, data]) => {
                if (data.courseId === courseId && data.status !== 'noclass') {
                    total++;
                    if (data.status === 'present') present++;
                }
            });
        });

        return {
            present,
            total,
            percentage: total === 0 ? 0 : (present / total) * 100
        };
    };

    const calculateOverallAttendance = () => {
        let present = 0;
        let total = 0;

        const validSlotIds = new Set(
            courses.flatMap(course =>
                course.schedule?.map(slot => slot.id) || []
            )
        );

        // Count regular attendance only for existing courses, excluding 'noclass'
        Object.values(attendance).forEach(day => {
            Object.entries(day).forEach(([slotId, status]) => {
                if (validSlotIds.has(slotId) && status !== 'noclass') {
                    total++;
                    if (status === 'present') present++;
                }
            });
        });

        // Count extra classes only for existing courses, excluding 'noclass'
        Object.values(extraClasses || {}).forEach(day => {
            Object.values(day).forEach(data => {
                if (courses.some(course => course.id === data.courseId) && data.status !== 'noclass') {
                    total++;
                    if (data.status === 'present') present++;
                }
            });
        });

        return {
            present,
            total,
            percentage: total === 0 ? 0 : (present / total) * 100
        };
    };

    const calculateSkippableClasses = (
        present: number,
        total: number,
        target: number
    ): number => {
        // Calculate how many classes can be skipped while maintaining target percentage
        // Formula: (present * 100 - target * total) / target
        const maxSkippable = Math.floor((present * 100 - target * total) / target);
        return Math.max(0, maxSkippable);
    };

    const getAttendanceStatus = (percentage: number): AttendanceStatus => {
        if (percentage >= minimumAttendance) {
            return { color: theme.colors.primary, icon: 'check-circle' };
        }
        if (percentage >= minimumAttendance - 10) {
            return { color: theme.colors.tertiary, icon: 'alert-circle' };
        }
        return { color: theme.colors.error, icon: 'circle-outline' };
    };

    const calculateRequiredClasses = (
        present: number,
        total: number,
        target: number
    ): number => {
        if ((present / total) * 100 >= target) return 0;
        return Math.ceil((target * total - 100 * present) / (100 - target));
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const exportData = async () => {
        try {
            // Create worksheet data
            const wsData = courses.map(course => {
                const stats = calculateAttendance(course.id);
                return {
                    'Course Name': course.courseName,
                    'Present Classes': stats.present,
                    'Total Classes': stats.total,
                    'Attendance Percentage': `${stats.percentage.toFixed(1)}%`
                };
            });

            const overallStats = calculateOverallAttendance();
            wsData.push({
                'Course Name': 'OVERALL',
                'Present Classes': overallStats.present,
                'Total Classes': overallStats.total,
                'Attendance Percentage': `${overallStats.percentage.toFixed(1)}%`
            });

            // Create workbook
            const ws = XLSX.utils.json_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

            // Generate Excel file
            const today = new Date().toISOString().split('T')[0];
            const fileName = `attendance_${today}.xlsx`;
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const uri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(uri, wbout, {
                encoding: FileSystem.EncodingType.Base64
            });

            // Share file
            await Sharing.shareAsync(uri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Export Attendance Data'
            });

            // Update last export date
            await AsyncStorage.setItem('lastExportDate', today);
            setLastExportDate(today);

        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data');
        }
    };

    const overallStats = calculateOverallAttendance();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Title style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
                        Attendance Statistics
                    </Title>
                    <View style={styles.headerButtons}>
                        <IconButton
                            icon="download"
                            iconColor={theme.colors.onBackground}
                            onPress={exportData}
                        />
                        <IconButton
                            icon="cog"
                            iconColor={theme.colors.onBackground}
                            onPress={() => setShowSettingsDialog(true)}
                        />
                    </View>
                </View>

                {lastExportDate && (
                    <Text style={[styles.exportReminder, { color: theme.colors.onBackground }]}>
                        Last exported: {lastExportDate}. Remember to export weekly!
                    </Text>
                )}

                <Text style={[styles.cacheWarning, { color: theme.colors.error }]}>
                    ⚠️ Important: Do not clear app cache as it will erase your attendance data
                </Text>

                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.overallCard}
                >
                    <View style={styles.overallContent}>
                        <CircularProgress percentage={overallStats.percentage} />
                        <View style={styles.overallStats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{overallStats.present}</Text>
                                <Text style={styles.statLabel}>Present</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{overallStats.total}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{minimumAttendance}%</Text>
                                <Text style={styles.statLabel}>Target</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                    Course Statistics
                </Text>

                {courses.map((course) => {
                    const stats = calculateAttendance(course.id);
                    const { percentage = 0, present = 0, total = 0 } = stats;
                    const status = getAttendanceStatus(percentage);
                    const requiredClasses = calculateRequiredClasses(present, total, minimumAttendance);
                    const skippableClasses = calculateSkippableClasses(present, total, minimumAttendance);

                    return (
                        <Card
                            key={course.id}
                            style={[styles.courseCard, { backgroundColor: theme.colors.surface }]}
                        >
                            <Card.Content>
                                <View style={styles.courseHeader}>
                                    <View>
                                        <Title style={[styles.courseTitle, { color: theme.colors.onSurface }]}>
                                            {course.courseName}
                                        </Title>
                                    </View>
                                    <IconButton
                                        icon={status.icon}
                                        iconColor={status.color}
                                        size={24}
                                    />
                                </View>

                                <View style={styles.courseStats}>
                                    <View style={[styles.attendanceBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                                        <View
                                            style={[
                                                styles.attendanceProgress,
                                                {
                                                    width: `${percentage}%`,
                                                    backgroundColor: status.color
                                                }
                                            ]}
                                        />
                                    </View>

                                    <Text style={[styles.attendanceText, { color: theme.colors.onSurface }]}>
                                        {percentage.toFixed(1)}% ({present}/{total} classes)
                                    </Text>

                                    {requiredClasses > 0 ? (
                                        <Text style={[styles.warningText, { color: status.color }]}>
                                            Need {requiredClasses} more classes to reach {minimumAttendance}%
                                        </Text>
                                    ) : (
                                        <Text style={[styles.successText, { color: theme.colors.primary }]}>
                                            You can Bunk {skippableClasses} {skippableClasses === 1 ? 'class' : 'classes'} safely
                                        </Text>
                                    )}
                                </View>
                            </Card.Content>
                        </Card>
                    );
                })}
            </ScrollView>

            <Portal>
                <Dialog
                    visible={showSettingsDialog}
                    onDismiss={() => setShowSettingsDialog(false)}
                    style={[styles.dialog, { backgroundColor: theme.colors.background }]}
                >
                    <Dialog.Title style={{ color: theme.colors.onSurface }}>
                        Attendance Settings
                    </Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Minimum Required Attendance (%)"
                            value={tempMinAttendance}
                            onChangeText={setTempMinAttendance}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            textColor={theme.colors.onSurface}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <IconButton
                            icon="close"
                            iconColor={theme.colors.onSurface}
                            onPress={() => setShowSettingsDialog(false)}
                        />
                        <IconButton
                            icon="check"
                            iconColor={theme.colors.onSurface}
                            onPress={saveMinimumAttendance}
                            style={styles.saveButton}
                        />
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingTop: 8,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    overallCard: {
        margin: 16,
        borderRadius: 16,
        padding: 24,
        elevation: 4,
    },
    overallContent: {
        alignItems: 'center',
    },
    progressContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 12,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    percentageText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    overallStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        color: 'white',
        fontSize: 12,
        opacity: 0.9,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    courseCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    courseCode: {
        fontSize: 12,
        opacity: 0.7,
    },
    courseStats: {
        gap: 8,
    },
    attendanceBar: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    attendanceProgress: {
        height: '100%',
        borderRadius: 4,
    },
    attendanceText: {
        fontSize: 14,
    },
    warningText: {
        fontSize: 12,
    },
    successText: {
        fontSize: 12,
        fontWeight: '500',
    },
    dialog: {
        borderRadius: 16,
    },
    input: {
        marginTop: 8,
    },
    saveButton: {
        marginLeft: 8,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportReminder: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    cacheWarning: {
        fontSize: 12,
        textAlign: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        fontWeight: 'bold',
    },
});