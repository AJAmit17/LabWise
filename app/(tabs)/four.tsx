import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MD3Theme as Theme, useTheme, Surface } from 'react-native-paper';

const TimeTablePage = () => {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <Surface style={styles.headerContainer} elevation={4}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Time Table</Text>
                    <Text style={styles.headerSubtitle}>NHCE CSE-DS Time Table</Text>
                </View>
            </Surface>

            <View style={styles.comingSoonContainer}>
                <Text style={styles.comingSoonTitle}>Coming Soon</Text>
                <Text style={styles.comingSoonText}>
                    The complete timetable feature is under development and will be available soon.
                </Text>
            </View>
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 16,
    },
    headerContainer: {
        backgroundColor: theme.colors.surface,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 16,
        elevation: 4,
        marginHorizontal: -16,
    },
    headerContent: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.onSurfaceVariant,
    },
    comingSoonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    comingSoonTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 16,
    },
    comingSoonText: {
        fontSize: 18,
        textAlign: 'center',
        color: theme.colors.onSurfaceVariant,
    }
});

export default TimeTablePage;

/* Original code commented out for future use
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { MD3Theme as Theme, useTheme, Surface } from 'react-native-paper';

const TimeTablePage = () => {
  const [activeDay, setActiveDay] = useState<keyof TimetableWeekData>('Monday');
  const [activeSection, setActiveSection] = useState<'A' | 'B'>('A');
  const theme = useTheme();
  const nativeBaseTheme = useTheme();
  const styles = createStyles(theme, nativeBaseTheme);

  const weekDays: Array<keyof TimetableWeekData> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  type TimetableData = {
    time: string;
    subject: string;
    courseCode: string;
    teacher: string;
  }[];

  type TimetableWeekData = {
    [key in 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday']: TimetableData;
  };

  const sectionATimetable = {
    Monday: [
      { time: "9:00 - 12:00", subject: "AI/ML Lab(A1) / CN Lab(A2)", courseCode: "22CDLS2 / 22CDL53", teacher: "Ms. Pallavi Nayak / Ms. Anchal" },
      { time: "12:00 - 01:00", subject: "Cloud Computing / Business Analytics", courseCode: "22CDS542 / 22CDS543", teacher: "Ms. Anchal / Ms. Bandari Channaraya Priya" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 3:00", subject: "Research Methodology and IPR", courseCode: "22RMK55", teacher: "Ms. Anchal" },
      { time: "3:00 - 4:00", subject: "Fundamentals of Data Science", courseCode: "22CDS53", teacher: "Dr. Sunil" },
    ],
    Tuesday: [
      { time: "9:00 - 9:55", subject: "Design and Analysis of Algorithms", courseCode: "22CDS52", teacher: "Ms. Pallavi Nayak" },
      { time: "9:55 - 10:50", subject: "Fundamentals of Data Science", courseCode: "22CDS53", teacher: "Dr. Sunil" },
      { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
      { time: "11:00 - 12:00", subject: "Software Engineering and Project Management", courseCode: "22CDS51", teacher: "Ms. T Sasikala" },
      { time: "12:00 - 01:00", subject: "Cloud Computing / Business Analytics", courseCode: "22CDS542 / 22CDS543", teacher: "Ms. Anchal / Ms. Bandari Channaraya Priya" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 3:00", subject: "Environment Studies", courseCode: "22ESK57", teacher: "Ms. Bandari Channarayya Priya" },
      { time: "3:00 - 4:50", subject: "Critical and Creative Thinking Skills", courseCode: "22SDK56", teacher: "Mr. Dilip M Bagadi" },
    ],
    Wednesday: [
      { time: "9:00 - 9:55", subject: "Fundamentals of Data Science", courseCode: "22CDS53", teacher: "Dr. Sunil" },
      { time: "9:55 - 10:50", subject: "Software Engineering and Project Management", courseCode: "22CDS51", teacher: "Ms. T Sasikala" },
      { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
      { time: "11:00 - 12:00", subject: "Software Engineering and Project Management", courseCode: "22CDS51", teacher: "Ms. T Sasikala" },
      { time: "12:00 - 01:00", subject: "Cloud Computing / Business Analytics", courseCode: "22CDS542 / 22CDS543", teacher: "Ms. Anchal / Ms. Bandari Channaraya Priya" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 3:00", subject: "Research Methodology and IPR", courseCode: "22RMK55", teacher: "Ms. Anchal" },
      { time: "3:00 - 3:55", subject: "Design and Analysis of Algorithms", courseCode: "22CDS52", teacher: "Ms. Pallavi Nayak" },
    ],
    Thursday: [
      { time: "9:00 - 10:50", subject: "Critical and Creative Thinking Skills", courseCode: "22SDK56", teacher: "Mr. Dilip M Bagadi" },
      { time: "11:00 - 11:15", subject: "Short Break", courseCode: "-", teacher: "-" },
      { time: "11:00 - 12:00", subject: "Software Engineering and Project Management", courseCode: "22CDS51", teacher: "Ms. T Sasikala" },
      { time: "12:00 - 1:00", subject: "Research Methodology and IPR", courseCode: "22RMK55", teacher: "Ms. Anchal" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 4:55", subject: "DAA Lab(A2) / DS Lab(A1)", courseCode: "22CDLS2 / 22CDL53", teacher: "Ms. Pallavi Nayak / Ms. Anchal" },
    ],
    Friday: [
      { time: "9:00 - 9:55", subject: "Design and Analysis of Algorithms", courseCode: "22CDS52", teacher: "Ms. Pallavi Nayak" },
      { time: "9:55 - 10:50", subject: "Fundamentals of Data Science", courseCode: "22CDS53", teacher: "Dr. Sunil" },
      { time: "11:00 - 11:15", subject: "Short Break", courseCode: "-", teacher: "-" },
      { time: "11:00 - 12:00", subject: "Cloud Computing / Business Analytics", courseCode: "22CDS542 / 22CDS543", teacher: "Ms. Anchal / Ms. Bandari Channaraya Priya" },
      { time: "12:00 - 1:00", subject: "Design and Analysis of Algorithms", courseCode: "22CDS52", teacher: "Ms. Pallavi Nayak" },
    ]
  };

  const sectionBTimetable = {
    Monday: [
      { time: "9:00 - 12:00", subject: "AI/ML Lab(B1) / CN Lab(B2)", courseCode: "22CDL61 / 22CDL62", teacher: "Dr. R Suganya / Ms. Anchal" },
      { time: "12:00 - 01:00", subject: "Predictive Analytics / Software Tetsing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms. Kavitha U / Mr. Sankhadeep Pujaru" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 4:00", subject: "MAD Lab (B1)", courseCode: "22CDS671", teacher: "Ms. Swati Sehgal" },
      { time: "4:00 - 5:00", subject: "Open Elective", courseCode: "-", teacher: "-" }
    ],
    Tuesday: [
      { time: "9:00 - 11:00", subject: "MAD Lab (B1)", courseCode: "22CDS671", teacher: "Ms. Swati Sehgal" },
      { time: "9:55 - 10:50", subject: "Software Engineering and Project Management", courseCode: "22CDS51", teacher: "Dr. Sunil Kumar" },
      { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
      { time: "11:00 - 12:00", subject: "Fundamentals of Data Science", courseCode: "22CDS53", teacher: "Dr. Joshua Daniel Raj" },
      { time: "12:00 - 01:00", subject: "Cloud Computing / Business Analytics", courseCode: "22CDS542 / 22CDS543", teacher: "Ms. Anchal / Ms. Bandari Channaraya Priya" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 3:00", subject: "Software Engineering and Project Management", courseCode: "22CDS51", teacher: "Dr. Sunil Kumar" },
      { time: "3:00 - 3:55", subject: "Design and Analysis of Algorithms", courseCode: "22CDS52", teacher: "Ms. Pallavi Nayak" },
    ],
    Wednesday: [
      { time: "9:00 - 9:55", subject: "Fundamentals of Data Science", courseCode: "22CDS53", teacher: "Dr. Joshua Daniel Raj" },
      { time: "9:55 - 10:50", subject: "Design and Analysis of Algorithms", courseCode: "22CDS52", teacher: "Ms. Pallavi Nayak" },
      { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
      { time: "11:00 - 12:00", subject: "Fundamentals of Data Science", courseCode: "22CDS53", teacher: "Dr. Joshua Daniel Raj" },
      { time: "12:00 - 01:00", subject: "Cloud Computing / Business Analytics", courseCode: "22CDS542 / 22CDS543", teacher: "Ms. Anchal / Ms. Bandari Channaraya Priya" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 3:00", subject: "Research Methodology and IPR", courseCode: "22RMK55", teacher: "Dr. R Suganya" },
      { time: "3:00 - 3:55", subject: "Software Engineering and Project Management", courseCode: "22CDS51", teacher: "Dr. Sunil Kumar" },
      { time: "3:55 - 4:50", subject: "Design and Analysis of Algorithms", courseCode: "22CDS52", teacher: "Ms. Pallavi Nayak" }
    ],
    Thursday: [
      { time: "9:00 - 12:00", subject: "DAA Lab(B1) / DS Lab(B2)", courseCode: "22CDLS2 / 22CDL53", teacher: "Ms. Pallavi Nayak / Dr. Joshua Daniel Raj" },
      { time: "12:00 - 1:00", subject: "Research Methodology and IPR", courseCode: "22RMK55", teacher: "Dr. R Suganya" },
    ],
    Friday: [
      { time: "9:00 - 10:50", subject: "Critical and Creative Thinking Skills", courseCode: "22SDK56", teacher: "Mr. Dilip M Bagadi" },
      { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
      { time: "11:00 - 12:00", subject: "Cloud Computing / Business Analytics", courseCode: "22CDS542 / 22CDS543", teacher: "Ms. Anchal / Ms. Bandari Channaraya Priya" },
      { time: "12:00 - 1:00", subject: "Research Methodology and IPR", courseCode: "22RMK55", teacher: "Dr. R Suganya" },
      { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
      { time: "2:00 - 4:55", subject: "DAA Lab(B2) / DS Lab(B1)", courseCode: "22CDLS2 / 22CDL53", teacher: "Ms. Pallavi Nayak / Dr. Joshua Daniel Raj" },
    ]
  };

  const currentTimetable = activeSection === 'A' ? sectionATimetable : sectionBTimetable;

  return (
    <View style={[styles.container]}>
      <Surface style={styles.headerContainer} elevation={4}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Time Table</Text>
          <Text style={styles.headerSubtitle}>CSE-DS 5th Semester</Text>
        </View>
        <View style={styles.sectionContainer}>
          {['A', 'B'].map((section) => (
            <Pressable
              key={section}
              onPress={() => setActiveSection(section as 'A' | 'B')}
              style={[
                styles.sectionTab,
                {
                  backgroundColor: activeSection === section ? theme.colors.secondary : theme.colors.background,
                }
              ]}
            >
              <Text style={[styles.sectionText, { color: theme.colors.onSurface }]}>Section {section}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.daysContainer}>
          {weekDays.map((day) => (
            <Pressable
              key={day}
              onPress={() => setActiveDay(day)}
              style={[
                styles.dayTab,
                {
                  backgroundColor: activeDay === day ? theme.colors.secondary : theme.colors.background,
                }
              ]}
            >
              <Text style={[styles.dayText, { color: theme.colors.onBackground }]}>{day.slice(0, 3)}</Text>
            </Pressable>
          ))}
        </View>
      </Surface>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tableContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.headerCell]}>Time</Text>
            <Text style={[styles.cell, styles.headerCell]}>Subject</Text>
            <Text style={[styles.cell, styles.headerCell]}>Course Code</Text>
            <Text style={[styles.cell, styles.headerCell]}>Teacher</Text>
          </View>

          {(activeSection === 'A' ? sectionATimetable[activeDay] : sectionBTimetable[activeDay])?.map((slot, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{slot.time}</Text>
              <Text style={styles.cell}>{slot.subject}</Text>
              <Text style={styles.cell}>{slot.courseCode}</Text>
              <Text style={styles.cell}>{slot.teacher}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme, nativeBaseTheme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
  },
  tableContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onBackground,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceVariant,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
  },
  breakRow: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  headerCell: {
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  cell: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 12,
    width: 120,
    color: theme.colors.onSurface,
  },
  sectionContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
  },
  sectionTab: {
    paddingHorizontal: 30,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  sectionText: {
    fontWeight: '600',
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  dayTab: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: 'center',
  },
  dayText: {
    fontWeight: '500',
    fontSize: 14,
  },
  headerContainer: {
    backgroundColor: theme.colors.surface,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    elevation: 4,
    marginHorizontal: -16,
  },
  headerContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
});
*/