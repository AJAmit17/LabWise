import React from 'react';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { Button, Title, Text, Card, Chip } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const HomePage = () => {
  const router = useRouter();
  const currentSemester = "5th Semester";
  const currentSubjects = [
    "Design Analysis of Algorithms",
    "Fundamentals of Data Science",
  ];

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#6200ee', '#9747FF']}
        style={styles.heroSection}
      >
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.heroContent}
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={60} color="white" />
          <Title style={styles.title}>LibWise</Title>
          <Text style={styles.subtitle}>NHCE CSE-DS Lab Portal</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(300).duration(800)}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Batch Information</Title>
              <View style={styles.chipContainer}>
                <Chip icon="calendar" style={styles.chip}>Batch 2026</Chip>
                <Chip icon="school" style={styles.chip}>{currentSemester}</Chip>
              </View>
              <Text style={styles.courseInfo}>
                Computer Science & Data Science Engineering
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)}>
          <Title style={styles.sectionTitle}>Current Subjects</Title>
          <View style={styles.subjectsContainer}>
            {currentSubjects.map((subject, index) => (
              <Chip
                key={index}
                style={styles.subjectChip}
                icon="book-open-variant"
              >
                {subject}
              </Chip>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(800)}>
          <Title style={styles.sectionTitle}>Quick Access</Title>
          <View style={styles.featuresContainer}>
            {[
              {
                icon: "flask",
                text: "Lab Experiments",
                description: "Access all lab manuals and procedures"
              },
              {
                icon: "notebook",
                text: "Lab Solutions",
                description: "Step-by-step solutions and explanations"
              },
              {
                icon: "file-document",
                text: "Resources",
                description: "Additional study materials and references"
              },
              {
                icon: "calendar-check",
                text: "Lab Schedule",
                description: "View upcoming lab sessions and submissions"
              }
            ].map((feature, index) => (
              <Animated.View
                key={index}
                entering={FadeInRight.delay(600 + index * 100).duration(800)}
              >
                <Card style={styles.featureCard} mode="outlined">
                  <Card.Content style={styles.featureContent}>
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={32}
                      color="#6200ee"
                    />
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>{feature.text}</Text>
                      <Text style={styles.featureDescription}>
                        {feature.description}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <LinearGradient
            colors={['#6200ee20', '#9747FF20']}
            style={styles.footerGradient}
          >
            <Text style={styles.footerTitle}>Built by Amit</Text>
            <Text style={styles.footerText}>
              Not on App Store because we can't afford the $99 developer fee{'\n'}
              Fully Open-Source and Free to Use*{'\n'}
              If you dont belive me, check the source code
            </Text>
            <Text style={styles.footerSubtext}>
              * This app runs on hopes, dreams, and Stack Overflow copypasta
            </Text>
            <Button
              mode="contained"
              icon="github"
              style={styles.sourceButton}
              contentStyle={styles.sourceButtonContent}
              onPress={() => router.push('https://github.com/AJAmit17/ConnectCraftApp')}
            >
              Source Code
            </Button>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heroSection: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroContent: {
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 1,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    marginVertical: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  courseInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  subjectChip: {
    margin: 4,
    backgroundColor: '#e8e0ff',
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureCard: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    width: '100%',
  },
  footerGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 12,
    textShadowColor: 'rgba(98, 0, 238, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footerSubtext: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  sourceButton: {
    marginTop: 12,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    elevation: 4,
    paddingHorizontal: 20,
  },
  sourceButtonContent: {
    paddingVertical: 8,
  },
});

export default HomePage;