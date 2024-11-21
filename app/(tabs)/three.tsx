import { useSchedule } from '@/context/ScheduleContext';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddClassModal from '@/components/AddClassModal';
import { formatTime } from '@/utils/timeUtils';

const ScheduleScreen = () => {
  const theme = useTheme();
  //@ts-ignore
  const { schedule, deleteClass } = useSchedule();
  const [visible, setVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {days.map((day) => (
          <Button
            key={day}
            mode={selectedDay === day ? 'contained' : 'outlined'}
            onPress={() => setSelectedDay(day)}
            style={styles.dayButton}
          >
            {day}
          </Button>
        ))}
      </ScrollView>

      <ScrollView style={styles.scheduleContainer}>
        {schedule
          .filter((item) => item.day === selectedDay)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((item, index) => (
            <Card key={index} style={styles.classCard}>
              <Card.Content>
                <Text variant="titleMedium">{item.courseName}</Text>
                <Text variant="bodyMedium">Code: {item.courseCode}</Text>
                <Text variant="bodyMedium">Lecturer: {item.lecturer}</Text>
                <Text variant="bodyMedium">
                  Time: {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => deleteClass(item.id)}>Delete</Button>
              </Card.Actions>
            </Card>
          ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
      />

      <AddClassModal
        visible={visible}
        hideModal={hideModal}
        selectedDay={selectedDay}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  daysContainer: {
    flexGrow: 0,
    padding: 8,
  },
  dayButton: {
    marginHorizontal: 4,
  },
  scheduleContainer: {
    padding: 16,
  },
  classCard: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default ScheduleScreen;