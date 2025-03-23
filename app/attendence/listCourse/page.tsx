import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
    Card,
    Title,
    Button,
    Portal,
    Dialog,
    TextInput,
    Chip,
    Text,
    IconButton,
    useTheme,
    Divider,
    Menu,
    FAB
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, TimeSlot } from '@/types';
import { router } from 'expo-router';

interface EditableCourse extends Course {
    id: string;
    courseName: string;
    schedule: TimeSlot[];
}

export default function ListCourse() {
    const theme = useTheme();
    const [courses, setCourses] = useState<Course[]>([]);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [visible, setVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const savedCourses = await AsyncStorage.getItem('courses');
            if (savedCourses) {
                setCourses(JSON.parse(savedCourses));
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadCourses();
        setRefreshing(false);
    }, []);

    const startEditing = (course: EditableCourse): void => {
        setEditingCourse(course);
        setEditedName(course.courseName);
        setCurrentDay('');
        setCurrentTime('');
        setShowDialog(true);
    };

    const addTimeSlot = () => {
        if (currentDay && currentTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(currentTime)) {
                alert('Please enter time in HH:MM format');
                return;
            }

            if (editingCourse) {
                setEditingCourse({
                    ...editingCourse,
                    schedule: [
                        ...(editingCourse.schedule || []),
                        { id: Date.now().toString(), day: currentDay, time: currentTime }
                    ]
                });
            }
            setCurrentDay('');
            setCurrentTime('');
        }
    };

    const removeTimeSlot = (index: number) => {
        if (!editingCourse) return;
        const newSchedule = editingCourse.schedule.filter((_, i) => i !== index);
        setEditingCourse({
            ...editingCourse,
            id: editingCourse.id,
            courseName: editingCourse.courseName,
            schedule: newSchedule
        });
    };

    const saveCourseChanges = async () => {
        try {
            if (!editedName.trim()) {
                alert('Course name cannot be empty');
                return;
            }

            if (!editingCourse) return;
            const updatedCourses = courses.map(course =>
                course.id === editingCourse.id
                    ? { ...editingCourse, courseName: editedName.trim() }
                    : course
            );
            await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
            setCourses(updatedCourses);
            setShowDialog(false);
            setEditingCourse(null);
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const deleteCourse = async (courseId: string) => {
        try {
            const updatedCourses = courses.filter(course => course.id !== courseId);
            await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));

            const courseToDelete = courses.find(c => c.id === courseId);
            const slotsToDelete = courseToDelete?.schedule?.map(slot => slot.id) || [];

            const attendanceData = await AsyncStorage.getItem('attendance');
            if (attendanceData) {
                const attendanceRecords = JSON.parse(attendanceData);
                Object.keys(attendanceRecords).forEach(date => {
                    slotsToDelete.forEach(slotId => {
                        if (attendanceRecords[date][slotId]) {
                            delete attendanceRecords[date][slotId];
                        }
                    });

                    if (Object.keys(attendanceRecords[date]).length === 0) {
                        delete attendanceRecords[date];
                    }
                });
                await AsyncStorage.setItem('attendance', JSON.stringify(attendanceRecords));
            }

            // Clean up extra classes
            const extraClassesData = await AsyncStorage.getItem('extraClasses');
            if (extraClassesData) {
                const extraClasses = JSON.parse(extraClassesData);
                Object.keys(extraClasses).forEach(date => {
                    Object.entries(extraClasses[date]).forEach(([slotId, data]) => {
                        //@ts-ignore
                        if (data.courseId === courseId) {
                            delete extraClasses[date][slotId];
                        }
                    });
                    if (Object.keys(extraClasses[date]).length === 0) {
                        delete extraClasses[date];
                    }
                });
                await AsyncStorage.setItem('extraClasses', JSON.stringify(extraClasses));
            }

            setCourses(updatedCourses);
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {courses.length === 0 ? (
                    <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]} >
                        <Card.Content style={styles.emptyCardContent}>
                            <IconButton icon="book-outline" size={48} />
                            <Text variant="titleMedium" style={styles.emptyTitle}>
                                No courses added yet
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptySubtitle}>
                                Add your first course to get started
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    courses.map((course) => (
                        <Card key={course.id} style={[styles.courseCard, { backgroundColor: theme.colors.surface }]}>
                            <Card.Content>
                                <View style={styles.courseHeader}>
                                    <Title style={[styles.courseTitle, { color: theme.colors.onSurface }]}>{course.courseName}</Title>
                                    <View style={styles.actionButtons}>
                                        <IconButton
                                            icon="pencil"
                                            size={20}
                                            onPress={() => startEditing(course)}
                                            style={styles.editButton}
                                        />
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            iconColor={theme.colors.error}
                                            onPress={() => deleteCourse(course.id)}
                                            style={styles.deleteButton}
                                        />
                                    </View>
                                </View>
                                <Divider style={styles.divider} />
                                <View style={styles.chipContainer}>
                                    {course.schedule?.map((slot, index) => (
                                        <Chip
                                            key={index}
                                            style={styles.chip}
                                            icon="clock-outline"
                                        >
                                            {`${slot.day} at ${slot.time}`}
                                        </Chip>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>

            <FAB
                icon="plus"
                label="Add Course"
                color={theme.colors.onPrimary}
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/attendence/addCourse/page')}
            />

            <Portal>
                <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)} style={{ backgroundColor: theme.colors.background }}>
                    <Dialog.Title>Edit Course</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Course Name"
                            value={editedName}
                            onChangeText={setEditedName}
                            mode="outlined"
                            style={styles.input}
                        />
                        <Menu
                            visible={visible}
                            onDismiss={closeMenu}
                            anchor={
                                <Button mode="outlined" onPress={openMenu} style={styles.input}>
                                    {currentDay || "Select Day"}
                                </Button>
                            }
                        >
                            {daysOfWeek.map((day) => (
                                <Menu.Item
                                    key={day}
                                    onPress={() => {
                                        setCurrentDay(day);
                                        closeMenu();
                                    }}
                                    title={day}
                                />
                            ))}
                        </Menu>
                        <TextInput
                            label="Time (HH:MM)"
                            value={currentTime}
                            onChangeText={setCurrentTime}
                            mode="outlined"
                            placeholder="14:30"
                            style={styles.input}
                        />
                        <Button
                            mode="contained"
                            onPress={addTimeSlot}
                            style={[styles.addButton, { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.primary, borderWidth: 2 }]}
                            disabled={!currentDay || !currentTime}
                            labelStyle={{ color: theme.colors.primary }}
                        >
                            Add Time Slot
                        </Button>
                        <View style={styles.chipContainer}>
                            {editingCourse?.schedule?.map((slot, index) => (
                                <Chip
                                    key={index}
                                    onClose={() => removeTimeSlot(index)}
                                    style={styles.chip}
                                    icon="clock-outline"
                                >
                                    {`${slot.day} at ${slot.time}`}
                                </Chip>
                            ))}
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogActions}>
                        <Button
                            mode="outlined"
                            onPress={() => setShowDialog(false)}
                            style={[styles.dialogButton, { borderColor: theme.colors.primary }]}
                            labelStyle={{ color: theme.colors.primary }}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={saveCourseChanges}
                            style={[styles.dialogButton, { backgroundColor: theme.colors.primary }]}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Save
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        marginBottom: 16,
    },
    emptyCard: {
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyCardContent: {
        alignItems: "center",
    },
    emptyTitle: {
        marginTop: 8,
        fontWeight: "bold",
    },
    emptySubtitle: {
        marginTop: 4,
        color: "gray",
    },
    courseCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
    },
    courseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    courseTitle: {
        fontWeight: "bold",
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
    editButton: {
        marginRight: 8,
    },
    deleteButton: {},
    divider: {
        marginVertical: 8,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    chip: {
        margin: 4,
    },
    input: {
        marginBottom: 16,
    },
    addButton: {
        marginBottom: 16,
    },
    dialogActions: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    dialogButton: {
        minWidth: 100,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 2,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
});
