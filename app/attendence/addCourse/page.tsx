import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Chip, Menu, Card, HelperText, Portal, Dialog, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Course, TimeSlot } from '@/types';

export default function AddCourse() {
    const [courseName, setCourseName] = useState<string>('');
    const [schedule, setSchedule] = useState<TimeSlot[]>([]);
    const [currentDay, setCurrentDay] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [timeError, setTimeError] = useState<string>('');
    const [showExitDialog, setShowExitDialog] = useState<boolean>(false);

    const router = useRouter();
    const theme = useTheme();

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const validateTime = (time: string): boolean => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    const addTimeSlot = () => {
        if (!currentDay || !currentTime) {
            return;
        }

        if (!validateTime(currentTime)) {
            setTimeError('Please enter time in HH:MM format (e.g., 09:30)');
            return;
        }

        setSchedule([...schedule, {
            id: Date.now().toString(),
            day: currentDay,
            time: currentTime
        }]);
        setCurrentDay('');
        setCurrentTime('');
        setTimeError('');
    };

    const removeTimeSlot = (id: string) => {
        setSchedule(schedule.filter(slot => slot.id !== id));
    };

    const saveCourse = async () => {
        try {
            const course: Course = {
                id: Date.now().toString(),
                courseName,
                schedule,
                totalClasses: 0,
                attendedClasses: 0
            };
            const existingCourses = await AsyncStorage.getItem('courses');
            const courses: Course[] = existingCourses ? JSON.parse(existingCourses) : [];
            courses.push(course);
            await AsyncStorage.setItem('courses', JSON.stringify(courses));
            router.push('/attendence/listCourse/page');
        } catch (error) {
            console.error('Error saving course:', error);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <MaterialCommunityIcons name="book-plus" size={32} color="white" />
                        <Text variant="headlineSmall" style={[styles.headerText, { color: theme.colors.onSurface }]}>Add New Course</Text>
                    </View>

                    {/* Instructions Section */}
                    <Card style={[styles.instructionCard, { backgroundColor: theme.colors.background }]}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.instructionTitle}>
                                How to Add a Course
                            </Text>
                            <Text style={styles.instructionText}>
                                1. Enter the course name{'\n'}
                                2. Select class days and times{'\n'}
                                3. Review your schedule{'\n'}
                                4. Save the course
                            </Text>
                        </Card.Content>
                    </Card>

                    {/* Course Name Section */}
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Course Name</Text>
                    <TextInput
                        label="Course Name"
                        value={courseName}
                        onChangeText={setCourseName}
                        mode="outlined"
                        style={styles.input}
                        placeholder="e.g., Mathematics 101"
                        right={<TextInput.Icon icon="book" />}
                    />

                    {/* Schedule Section */}
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Add Class Schedule</Text>
                    <View style={styles.scheduleInputContainer}>
                        <Menu
                            visible={visible}
                            onDismiss={() => setVisible(false)}
                            anchor={
                                <Button
                                    mode="outlined"
                                    onPress={() => setVisible(true)}
                                    style={[styles.dayButton, { backgroundColor: theme.colors.background }]}
                                    icon="calendar"
                                    textColor={theme.colors.onSurface}
                                >
                                    {currentDay || "Select Day"}
                                </Button>
                            }
                        >
                            {days.map((day) => (
                                <Menu.Item
                                    key={day}
                                    onPress={() => {
                                        setCurrentDay(day);
                                        setVisible(false);
                                    }}
                                    title={day}
                                />
                            ))}
                        </Menu>

                        <TextInput
                            label="Time"
                            value={currentTime}
                            onChangeText={(text) => {
                                setCurrentTime(text);
                                setTimeError('');
                            }}
                            mode="outlined"
                            style={styles.timeInput}
                            placeholder="HH:MM"
                            right={<TextInput.Icon icon="clock-outline" />}
                        />
                    </View>

                    <HelperText type="error" visible={!!timeError}>
                        {timeError}
                    </HelperText>

                    <Button
                        mode="outlined"
                        onPress={addTimeSlot}
                        style={[styles.addButton, {
                            borderColor: theme.colors.primary,
                            backgroundColor: theme.colors.surfaceVariant,
                        }]}
                        contentStyle={styles.buttonContent}
                        labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
                        icon="plus"
                        disabled={!currentDay || !currentTime}
                    >
                        Add Time Slot
                    </Button>

                    {/* Schedule Display */}
                    {schedule.length > 0 && (
                        <Card style={[styles.scheduleCard, { backgroundColor: theme.colors.surface }]}>
                            <Card.Content>
                                <Text variant="titleMedium" style={[styles.scheduleTitle, { color: theme.colors.onSurface }]}>
                                    Class Schedule
                                </Text>
                                <View style={styles.chipContainer}>
                                    {schedule.map((slot) => (
                                        <Chip
                                            key={slot.id}
                                            onClose={() => removeTimeSlot(slot.id)}
                                            style={[styles.scheduleChip, {
                                                backgroundColor: theme.colors.secondaryContainer,
                                            }]}
                                            textStyle={{
                                                color: theme.colors.onSecondaryContainer
                                            }}
                                            icon="clock-outline"
                                        >
                                            {slot.day} at {slot.time}
                                        </Chip>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={saveCourse}
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            contentStyle={styles.buttonContent}
                            labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
                            icon="content-save"
                        >
                            Save Course
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => setShowExitDialog(true)}
                            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
                            contentStyle={styles.buttonContent}
                            labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
                            icon="close"
                        >
                            Cancel
                        </Button>
                    </View>
                </Card.Content>
            </Card>

            {/* Exit Confirmation Dialog */}
            <Portal>
                <Dialog visible={showExitDialog} onDismiss={() => setShowExitDialog(false)} style={{ borderRadius: 12, backgroundColor: theme.colors.background }}>
                    <Dialog.Title>Discard Changes?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            You have unsaved changes. Are you sure you want to leave?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            mode="text"
                            onPress={() => setShowExitDialog(false)}
                            style={styles.dialogButton}
                            labelStyle={{ color: theme.colors.primary }}
                        >
                            Stay
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => router.back()}
                            style={[styles.dialogButton, { backgroundColor: theme.colors.primary }]}
                            labelStyle={{ color: theme.colors.onPrimary }}
                        >
                            Discard
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    formCard: {
        borderRadius: 16,
        elevation: 4,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerText: {
        marginLeft: 12,
        fontWeight: 'bold',
    },
    instructionCard: {
        marginBottom: 24,
        borderRadius: 12,
    },
    instructionTitle: {
        marginBottom: 8,
        fontWeight: '500',
    },
    instructionText: {
        color: '#666',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        marginBottom: 16,
    },
    scheduleInputContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    dayButton: {
        flex: 1,
        justifyContent: 'center',
    },
    timeInput: {
        flex: 1,
    },
    addButton: {
        marginVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    scheduleCard: {
        marginTop: 16,
        borderRadius: 12,
        elevation: 2,
        borderWidth: 1,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    scheduleChip: {
        marginBottom: 8,
        marginRight: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    buttonContainer: {
        marginTop: 24,
        flexDirection: 'row',
        gap: 12,
    },
    saveButton: {
        paddingVertical: 8,
    },
    cancelButton: {
    },
    buttonContent: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 2,
    },
    dialogButton: {
        minWidth: 100,
        marginHorizontal: 4,
    },
});