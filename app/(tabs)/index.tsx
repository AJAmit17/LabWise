import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Text,
  Button,
  Portal,
  Dialog,
  useTheme,
  Divider,
  Chip,
  IconButton,
  Surface,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Course, AttendanceRecord } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';

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

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Surface
      style={{
        position: 'absolute',
        right: 16,
        top: 48,
        zIndex: 1000,
        borderRadius: 20,
        elevation: 4,
        opacity: 0.9,
        overflow: 'hidden',
        marginRight: 8,
      }}
    >
      <IconButton
        icon={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
        size={24}
        onPress={toggleTheme}
        mode="contained"
        containerColor={isDarkMode ? "#1E2433" : "#FFFFFF"}
        iconColor={isDarkMode ? "#F5F5F5" : "#3949AB"}
      />
    </Surface>
  );
}

export default function HomePage() {
  const theme = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  // const [showDialog, setShowDialog] = useState(false);
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
    ]);
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
  };

  //@ts-ignore
  const saveAttendance = async (courseId, status) => {
    const newAttendance = {
      ...attendance,
      [today]: {
        ...(attendance[today] || {})
      }
    };

    // Toggle logic - if the same status is clicked again, remove the attendance record
    if (attendance[today]?.[courseId] === status) {
      // Deselect/reset the attendance status
      delete newAttendance[today][courseId];

      // Clean up empty date entries
      if (Object.keys(newAttendance[today]).length === 0) {
        delete newAttendance[today];
      }
    } else {
      // Set the new status
      newAttendance[today][courseId] = status;
    }

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

    Object.values(attendance).forEach(day => {
      Object.entries(day).forEach(([_, status]) => {
        if (status !== 'noclass') {
          totalClasses++;
          if (status === 'present') totalPresent++;
        }
      });
    });

    return totalClasses > 0 ? totalPresent / totalClasses : 0;
  };

  const getTodayClassCount = () => {
    const today = new Date().toISOString().split('T')[0];

    const regularClassesCount = todaySchedule.length;

    let markedClassesCount = 0;
    if (attendance[today]) {
      const existingCourseSlotIds = new Set(
        courses.flatMap(course =>
          course.schedule?.map(slot => slot.id) ?? []
        )
      );

      Object.entries(attendance[today]).forEach(([slotId, status]) => {
        if (existingCourseSlotIds.has(slotId) && status !== 'noclass') {
          markedClassesCount++;
        }
      });
    }
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
      case 'present': return { bg: '#E8F5E9', text: '#2E7D32', selectedBg: '#81C784', border: '#2E7D32' };
      case 'absent': return { bg: '#FFEBEE', text: '#C62828', selectedBg: '#EF5350', border: '#C62828', selectedText: '#FFFFFF' };
      case 'noclass': return { bg: '#E3F2FD', text: '#1565C0', selectedBg: '#64B5F6', border: '#1565C0' };
      default: return { bg: '#F5F5F5', text: '#424242', selectedBg: '#BDBDBD', border: '#424242' };
    }
  };

  const handleAmitLinkPress = () => {
    Linking.openURL('https://amit-acharya.live');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#1A237E', '#3949AB']}
        style={styles.gradientHeader}
      >
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.welcomeText}>LabWise</Text>
            {/* <Text style={styles.taglineText}>Notes Sharing & Attendance Tracking Application for NHCE Students</Text> */}
          </View>
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
                    {['present', 'absent', 'noclass'].map((status) => {
                      const isSelected = attendance[today]?.[schedule.slotId] === status;
                      const colors = getStatusColor(status);
                      return (
                        <Chip
                          key={status}
                          selected={isSelected}
                          onPress={() => saveAttendance(schedule.slotId, status)}
                          style={[
                            styles.statusChip,
                            {
                              backgroundColor: isSelected ? colors.selectedBg : colors.bg,
                              borderWidth: 1,
                              borderColor: isSelected ? colors.border : '#CCCCCC',
                              elevation: isSelected ? 2 : 0
                            }
                          ]}
                          textStyle={{
                            color: (isSelected && status === 'absent' && colors.selectedText) ?
                              colors.selectedText : (isSelected ? colors.text : '#666'),
                            fontWeight: isSelected ? 'bold' : 'normal'
                          }}
                          icon={isSelected ? 'check' : undefined}
                          mode={isSelected ? 'flat' : 'outlined'}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Chip>
                      );
                    })}
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

          <View style={[styles.footer, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
              Made with <MaterialCommunityIcons name="heart" size={16} color="#F44336" /> by{' '}
              <Text
                style={[styles.footerLink, {
                  color: theme.colors.primary,
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.primary,
                  textDecorationLine: 'underline', // Add this line
                }]}
                onPress={handleAmitLinkPress}
              >
                Amit
              </Text>
            </Text>
            <Text style={[styles.issuesText, { color: theme.colors.onSurfaceVariant, marginTop: 4 }]}>
              Issues or feature requests? Email <Text style={{ fontWeight: 'bold' }}>amit.acharya.work@gmail.com</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add ThemeToggle component here */}
      <ThemeToggle />

      {/* <Portal>
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
      </Portal> */}
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
    paddingBottom: 80, // Add bottom padding to account for tab bar
  },
  gradientHeader: {
    width: '100%',
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    padding: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  taglineText: {
    color: 'white',
    fontSize: 14, // Reduced from 16
    opacity: 0.9,
    marginTop: 4, // Added margin top
    textAlign: 'center',
    paddingHorizontal: 8, // Added horizontal padding
    fontStyle: 'italic',
  },
  date: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 16, // Reduced from 24
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
    marginVertical: 16, // Reduced from 24
    fontWeight: 'bold',
    fontSize: 20,
  },
  emptyCard: {
    marginBottom: 16, // Reduced from 24
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
    height: 36,
    justifyContent: 'center',
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
  footer: {
    padding: 12, // Reduced from 16
    alignItems: 'center',
    marginTop: 12, // Reduced from 16
    marginBottom: 16, // Reduced from 24
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  issuesText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footerLink: {
    textDecorationLine: 'none',
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 4,
  },
});