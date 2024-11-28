import { useLocalSearchParams, useNavigation } from "expo-router";
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, Text } from "react-native";
import { ActivityIndicator, Card, Title, Paragraph, Button, Snackbar, MD3Theme as Theme, useTheme } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { Experiment } from "@/types";

const ExperimentDetail = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const markdownStyles = createMarkdownStyles(theme);
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

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
    backgroundColor: theme.colors.elevation.level2,
    borderRadius: 12,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: theme.colors.onSurface,
    marginBottom: 10,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: theme.colors.outline,
  },
  solutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButton: {
    backgroundColor: theme.colors.primary,
  },
  snackbar: {
    backgroundColor: theme.colors.inverseSurface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

const createMarkdownStyles = (theme: Theme) => ({
  body: {
    color: theme.colors.onSurface,
    fontSize: 16,
  },
  code_inline: {
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.primary,
  },
  code_block: {
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.onSurface,
    padding: 12,
    borderRadius: 8,
  },
  fence: {
    backgroundColor: theme.colors.elevation.level1,
    color: theme.colors.onSurface,
    padding: 12,
    borderRadius: 8,
  },
  link: {
    color: theme.colors.primary,
  },
});

export default ExperimentDetail;