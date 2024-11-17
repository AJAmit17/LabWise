import { useLocalSearchParams, useNavigation } from "expo-router";
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Text } from "react-native";
import { ActivityIndicator, Card, Title, Paragraph, Button, Snackbar } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { Experiment } from "@/types";
import { ThemedText } from "@/components/ThemedText";

const ExperimentDetail = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const stripHtmlTags = (html: string) => {
    return html?.replace(/<[^>]*>?/gm, '');
  };

  const formatSolution = (solution: string) => {
    return solution.replace(/<h1>/g, '# ')
      .replace(/<\/h1>/g, '\n')
      .replace(/<pre class="language-c"><code>/g, '```c\n')
      .replace(/<\/code><\/pre>/g, '\n```\n')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ');
  };

  const copySolution = async () => {
    const solutionText = stripHtmlTags(experiment?.ExpSoln || '');
    await Clipboard.setStringAsync(solutionText);
    setVisible(true);
  };
  useLayoutEffect(() => {
    if (experiment) {
      navigation.setOptions({
        headerTitle: experiment.ExpName,
      });
    }
  }, [navigation, experiment]);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await fetch(
          `https://connect-craft.vercel.app/api/experiments/${id}`
        );
        const json = await response.json();
        setExperiment(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
      </View>
    );
  }

  if (!experiment) {
    return (
      <View style={styles.container}>
        <Paragraph style={styles.text}>Experiment not found</Paragraph>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{experiment.ExpName}</Title>
            <Paragraph style={styles.paragraph}>Year: {experiment.year}</Paragraph>
            <Paragraph style={styles.paragraph}>ACE Year: {experiment.aceYear}</Paragraph>
            <Paragraph style={styles.paragraph}>Branch: {experiment.Branch}</Paragraph>
            <Paragraph style={styles.paragraph}>Course Code: {experiment.CCode}</Paragraph>
            <Paragraph style={styles.paragraph}>Course Name: {experiment.CName}</Paragraph>
            <Paragraph style={styles.paragraph}>Experiment Number: {experiment.ExpNo}</Paragraph>
            <Title style={styles.sectionTitle}>Description</Title>
            <Markdown style={markdownStyles}>{experiment.ExpDesc}</Markdown>
            <View style={styles.solutionHeader}>
              <Title style={styles.sectionTitle}>Solution</Title>
              <Button
                mode="contained"
                onPress={copySolution}
                icon="content-copy"
                compact
                style={styles.copyButton}
              >
                <Text>Copy</Text>
              </Button>
            </View>
            <Markdown style={markdownStyles}>{formatSolution(experiment?.ExpSoln || '')}</Markdown>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        <Text>Solution copied to clipboard!</Text>
      </Snackbar>

    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#ffffff",
    width: width - 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ee",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: "#333333",
    marginBottom: 10,
  },
  divider: {
    marginVertical: 20,
  },
  solutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButton: {
    backgroundColor: '#6200ee',
  },
  snackbar: {
    backgroundColor: '#832cf8',
  },
});

const markdownStyles = {
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 15,
    marginBottom: 8,
  },
};

export default ExperimentDetail;