import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Button, Text, Card, Title, IconButton, Chip, Divider, FAB, Portal, Dialog, List } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Course, AttendanceRecord, ExtraClassesRecord, DailySchedule, AttendanceStatus } from '@/types';

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
        ...(attendance[selectedDate] || {}),
        [courseId]: status
      }
    };
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
        ...extraClasses[selectedDate],
        [slotId]: {
          ...extraClasses[selectedDate][slotId],
          status
        }
      }
    };
    await AsyncStorage.setItem('extraClasses', JSON.stringify(newExtraClasses));
    setExtraClasses(newExtraClasses);
  };

  const deleteExtraClass = async ({ slotId }: {slotId: string}): Promise<void> => {
    const newExtraClasses: ExtraClassesRecord = { ...extraClasses };
    delete newExtraClasses[selectedDate][slotId];
    if (Object.keys(newExtraClasses[selectedDate]).length === 0) {
      delete newExtraClasses[selectedDate];
    }
    await AsyncStorage.setItem('extraClasses', JSON.stringify(newExtraClasses));
    setExtraClasses(newExtraClasses);
  };

  const getMarkedDates = () => {
    const marks: { [key: string]: { marked: boolean; dotColor: string } } = {};
    
    // Process regular attendance
    Object.entries(attendance).forEach(([date, dayAttendance]) => {
        const presentCount = Object.values(dayAttendance).filter(status => status === 'present').length;
        const totalCount = Object.values(dayAttendance).length;
        marks[date] = {
            marked: true,
            dotColor: presentCount === totalCount ? 'green' : presentCount === 0 ? 'red' : 'orange'
        };
    });

    // Process extra classes
    Object.entries(extraClasses).forEach(([date, dayExtra]) => {
        const presentCount = Object.values(dayExtra)
            .filter(data => data.status === 'present').length;
        const totalCount = Object.keys(dayExtra).length;
        
        if (!marks[date]) {
            marks[date] = {
                marked: true,
                dotColor: presentCount === totalCount ? 'green' : presentCount === 0 ? 'red' : 'orange'
            };
        }
    });

    return marks;
};

  function getDayName(dateString: string) {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
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

  const getStatusIcon = (status: AttendanceStatus): string => {
    switch (status) {
      case 'present': return 'check-circle';
      case 'absent': return 'close-circle';
      case 'noclass': return 'minus-circle';
      default: return 'help-circle';
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Button 
          icon="arrow-left" 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          Back
        </Button>

        <Calendar
          //@ts-ignore
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={{
            ...getMarkedDates(),
            [selectedDate]: { ...getMarkedDates()[selectedDate], selected: true }
          }}
          style={styles.calendar}
        />

        {selectedDate && (
          <View style={styles.scheduleContainer}>
            <Text style={styles.dateHeader}>
              Classes for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>

            {getAllDayClasses(selectedDate).length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyCardContent}>
                  <IconButton icon="calendar-blank" size={48} />
                  <Text variant="titleMedium">No Classes on This Day</Text>
                </Card.Content>
              </Card>
            ) : (
              getAllDayClasses(selectedDate).map((schedule) => (
                <Card key={schedule.slotId} style={styles.courseCard}>
                  <Card.Content>
                    <View style={styles.courseHeader}>
                      <View style={styles.courseInfo}>
                        <Title>{schedule.courseName}</Title>
                        <Text variant="bodyMedium" style={styles.courseTime}>
                          {schedule.timeSlot.time}
                          {schedule.isExtra && ' (Extra Class)'}
                        </Text>
                      </View>
                      {schedule.isExtra && (
                        <IconButton
                          icon="delete"
                          size={20}
                          //@ts-ignore
                          onPress={() => deleteExtraClass(schedule.slotId)}
                        />
                      )}
                    </View>
                    <Divider style={styles.divider} />
                    <View style={styles.attendanceButtons}>
                      {['present', 'absent'].map((status) => (
                        <Chip
                          key={status}
                          selected={schedule.isExtra ? 
                            extraClasses[selectedDate]?.[schedule.slotId]?.status === status :
                            attendance[selectedDate]?.[schedule.slotId] === status
                          }
                          onPress={() => schedule.isExtra ?
                            updateExtraClassStatus({ slotId: schedule.slotId, status: status as AttendanceStatus }) :
                            saveAttendance({ courseId: schedule.slotId, status: status as AttendanceStatus })
                          }
                          style={styles.statusChip}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Chip>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={showExtraClassDialog} onDismiss={() => setShowExtraClassDialog(false)}>
          <Dialog.Title>Add Extra Class</Dialog.Title>
          <Dialog.Content>
            {courses.map((course) => (
              <List.Item
                key={course.id}
                title={course.courseName}
                onPress={() => handleExtraClass(course)}
                right={props => <List.Icon {...props} icon="plus" />}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExtraClassDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowExtraClassDialog(true)}
        disabled={!selectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 10,
  },
  scheduleContainer: {
    marginTop: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
