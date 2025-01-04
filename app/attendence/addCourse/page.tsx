import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Chip, Menu, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Course, TimeSlot } from '@/types';

export default function AddCourse() {
  const [courseName, setCourseName] = useState<string>('');
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [currentDay, setCurrentDay] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const addTimeSlot = () => {
    if (currentDay && currentTime) {
      setSchedule([...schedule, { 
        id: Date.now().toString(),
        day: currentDay, 
        time: currentTime 
      }]);
      setCurrentDay('');
      setCurrentTime('');
    }
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
      router.push('/attendence/page');
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <TextInput
        label="Course Name"
        value={courseName}
        onChangeText={setCourseName}
        mode="outlined"
        style={{ marginBottom: 10 }}
      />
      
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button mode="outlined" onPress={openMenu} style={{ marginBottom: 10 }}>
            {currentDay || "Select Day"}
          </Button>
        }>
        {days.map((day) => (
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
        style={{ marginBottom: 10 }}
      />
      <Button mode="outlined" onPress={addTimeSlot} style={{ marginTop: 10 }}>
        Add Time Slot
      </Button>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {schedule.map((slot, index) => (
          <Chip key={index} style={{ margin: 5 }}>
            {slot.day} at {slot.time}
          </Chip>
        ))}
      </View>
      <Button mode="contained" onPress={saveCourse} style={{ marginTop: 20 }}>
        Save Course
      </Button>
      <Button onPress={() => router.back()} style={{ marginTop: 10 }}>
        Cancel
      </Button>
    </ScrollView>
  );
}
