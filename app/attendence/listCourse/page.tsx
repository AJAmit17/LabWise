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
    Menu
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, TimeSlot } from '@/types';

interface EditableCourse extends Course {
    id: string;
    courseName: string;
    schedule: TimeSlot[];
}

export default function ListCourse() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [visible, setVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

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
            // Remove course from courses list
            const courseIndex = courses.findIndex(course => course.id === courseId);
            const updatedCourses = courses.filter(course => course.id !== courseId);
            await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));

            // Clean up attendance records
            const savedAttendance = await AsyncStorage.getItem('attendance');
            if (savedAttendance) {
                const attendance = JSON.parse(savedAttendance);
                // For each day in attendance records
                Object.keys(attendance).forEach(date => {
                    // Remove the attendance entry for the deleted course
                    if (attendance[date][courseIndex] !== undefined) {
                        delete attendance[date][courseIndex];
                    }
                    // If no attendance records left for that day, remove the day entry
                    if (Object.keys(attendance[date]).length === 0) {
                        delete attendance[date];
                    }
                });
                await AsyncStorage.setItem('attendance', JSON.stringify(attendance));
            }

            setCourses(updatedCourses);
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View style={styles.container}>

            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {courses.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content style={styles.emptyCardContent}>
                            <IconButton icon="book-outline" size={48} />
                            <Text variant="titleMedium">No courses added yet</Text>
                            <Text variant="bodyMedium">Add your first course to get started</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    courses.map((course) => (
                        <Card key={course.id} style={styles.courseCard}>
                            <Card.Content>
                                <View style={styles.courseHeader}>
                                    <Title>{course.courseName}</Title>
                                    <View style={styles.actionButtons}>
                                        <IconButton
                                            icon="pencil"
                                            size={20}
                                            onPress={() => startEditing(course)}
                                        />
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            iconColor={theme.colors.error}
                                            onPress={() => deleteCourse(course.id)}
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

            <Portal>
                <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
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
                            }>
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
                            style={styles.addButton}
                            disabled={!currentDay || !currentTime}
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
                    <Dialog.Actions>
                        <Button onPress={() => setShowDialog(false)}>Cancel</Button>
                        <Button onPress={saveCourseChanges} mode="contained">Save</Button>
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
    scrollView: {
        padding: 16,
    },
    courseCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
    },
    emptyCard: {
        margin: 16,
        padding: 32,
        alignItems: 'center',
        borderRadius: 12,
    },
    emptyCardContent: {
        alignItems: 'center',
        gap: 8,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    divider: {
        marginVertical: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    chip: {
        marginRight: 4,
        marginBottom: 4,
    },
    input: {
        marginBottom: 16,
    },
    segmentedButtons: {
        marginBottom: 16,
    },
    addButton: {
        marginBottom: 16,
    },
});