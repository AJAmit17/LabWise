import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Title, Chip, useTheme } from 'react-native-paper';

const currentSubjects = [
  "Design Analysis of Algorithms",
  "Fundamentals of Data Science",
];

export default function SubjectsSection() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 10,
      color: theme.colors.onBackground,
    },
    subjectsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    subjectChip: {
      margin: 4,
      backgroundColor: theme.colors.secondaryContainer,
    },
  });

  return (
    <View style={styles.container}>
      <Title style={styles.sectionTitle}>Current Subjects</Title>
      <View style={styles.subjectsContainer}>
        {currentSubjects.map((subject, index) => (
          <Chip
            key={index}
            style={styles.subjectChip}
            textStyle={{ color: theme.colors.onSecondaryContainer }}
            icon="book-open-variant"
            mode="flat"
          >
            {subject}
          </Chip>
        ))}
      </View>
    </View>
  );
}

