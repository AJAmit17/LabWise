import { Experiment } from '@/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, MD3Theme as Theme, useTheme } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';

const ExperimentCard = ({ experiment }: { experiment: Experiment }) => {
    const router = useRouter();
    const theme = useTheme();
    const styles = createStyles(theme)
    const stylesMarkdown = markdownStyles(theme);

    const handlePress = () => {
        router.push({
            pathname: "/experiment/[id]",
            params: { id: experiment.id }
        });
    };

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={styles.title}>{experiment.ExpName}</Title>
                <Paragraph style={styles.paragraph}>Year: {experiment.year}</Paragraph>
                <Paragraph style={styles.paragraph}>Academic year: {experiment.aceYear}</Paragraph>
                <Paragraph style={styles.paragraph}>Branch: {experiment.Branch}</Paragraph>
                <Paragraph style={styles.paragraph}>Course Code: {experiment.CCode}</Paragraph>
                <Paragraph style={styles.paragraph}>Course Name: {experiment.CName}</Paragraph>
                <Paragraph style={styles.paragraph}>Experiment Number: {experiment.ExpNo}</Paragraph>
                <Markdown style={stylesMarkdown}>{experiment.ExpDesc || 'No description available.'}</Markdown>
            </Card.Content>
            <Card.Actions>
                <Button
                    mode="contained"
                    onPress={handlePress}
                    textColor='white'
                >
                    View Details
                </Button>
            </Card.Actions>
        </Card>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    card: {
        width: Dimensions.get('window').width * 0.9,
        marginVertical: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        elevation: 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        color: theme.colors.onSurface,
        marginBottom: 12,
        fontWeight: '600',
    },
    paragraph: {
        color: theme.colors.onSurfaceVariant,
        marginBottom: 4,
        fontSize: 14,
    },
    content: {
        padding: 16,
    },
});

const markdownStyles = (theme: Theme) => StyleSheet.create({
    body: { color: theme.colors.onSurface },
    heading1: { color: theme.colors.onSurface },
    heading2: { color: theme.colors.onSurface },
    link: { color: theme.colors.primary },
});

export default ExperimentCard;