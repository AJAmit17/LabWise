import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, RefreshControl } from 'react-native';
import { Card, Title, Text, IconButton, Portal, Dialog, TextInput, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Course, AttendanceRecord } from '@/types';

interface AttendanceStatus {
  color: string;
  icon: string;
}

interface AttendanceCalculation {
  present: number;
  total: number;
  target: number;
}

const CircularProgress= ({ percentage } : { percentage: number}) => {
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
  const [minimumAttendance, setMinimumAttendance] = useState<number>(75);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [tempMinAttendance, setTempMinAttendance] = useState('75');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedCourses, savedAttendance, savedMinAttendance] = await Promise.all([
        AsyncStorage.getItem('courses'),
        AsyncStorage.getItem('attendance'),
        AsyncStorage.getItem('minimumAttendance')
      ]);
      
      if (savedCourses) setCourses(JSON.parse(savedCourses));
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
      if (savedMinAttendance) setMinimumAttendance(Number(savedMinAttendance));
    } catch (error) {
      console.error('Error loading data:', error);
    }
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
    const courseSlots = courses.find(c => c.id === courseId)?.schedule || [];
    const slotIds = courseSlots.map(slot => slot.id);
    
    return Object.values(attendance).reduce((acc, day) => {
      Object.entries(day).forEach(([slotId, status]) => {
        if (slotIds.includes(slotId)) {
          acc.total++;
          if (status === 'present') acc.present++;
        }
      });
      return acc;
    }, { present: 0, total: 0, percentage: 0 });
  };

  const calculateOverallAttendance = () => {
    const stats = Object.values(attendance).reduce((acc, day) => {
      Object.values(day).forEach(status => {
        acc.total++;
        if (status === 'present') acc.present++;
      });
      return acc;
    }, { present: 0, total: 0 });
    
    return {
      ...stats,
      percentage: stats.total === 0 ? 0 : (stats.present / stats.total) * 100
    };
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

  const overallStats = calculateOverallAttendance();

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Attendance Statistics</Title>
          <IconButton
            icon="cog"
            onPress={() => setShowSettingsDialog(true)}
          />
        </View>

        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
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

        <Text style={styles.sectionTitle}>Course Statistics</Text>

        {courses.map((course) => {
          const stats = calculateAttendance(course.id);
          const { percentage = 0, present = 0, total = 0 } = stats;
          const status = getAttendanceStatus(percentage);
          const requiredClasses = calculateRequiredClasses(present, total, minimumAttendance);

          return (
            <Card key={course.id} style={styles.courseCard}>
              <Card.Content>
                <View style={styles.courseHeader}>
                  <View>
                    <Title style={styles.courseTitle}>{course.courseName}</Title>
                    {/* <Text style={styles.courseCode}>{course.courseCode}</Text> */}
                  </View>
                  <IconButton
                    icon={status.icon}
                    iconColor={status.color}
                    size={24}
                  />
                </View>
                
                <View style={styles.courseStats}>
                  <View style={styles.attendanceBar}>
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
                  
                  <Text style={styles.attendanceText}>
                    {percentage.toFixed(1)}% ({present}/{total} classes)
                  </Text>
                  
                  {requiredClasses > 0 && (
                    <Text style={[styles.warningText, { color: status.color }]}>
                      Need {requiredClasses} more classes to reach {minimumAttendance}%
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
          style={styles.dialog}
        >
          <Dialog.Title>Attendance Settings</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Minimum Required Attendance (%)"
              value={tempMinAttendance}
              onChangeText={setTempMinAttendance}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <IconButton 
              icon="close"
              onPress={() => setShowSettingsDialog(false)}
            />
            <IconButton 
              icon="check"
              onPress={saveMinimumAttendance}
              style={styles.saveButton}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

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
  dialog: {
    borderRadius: 16,
  },
  input: {
    marginTop: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
});