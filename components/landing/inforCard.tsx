import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Chip, Text, useTheme } from 'react-native-paper';

export default function InfoCard() {
    const theme = useTheme();

    const styles = StyleSheet.create({
        infoCard: {
            borderRadius: 16,
            marginBottom: 20,
            backgroundColor: theme.colors.surface,
        },
        cardTitle: {
            fontSize: 22,
            fontFamily: 'Poppins_600SemiBold',
            marginBottom: 10,
            color: theme.colors.onSurface,
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 12,
        },
        chip: {
            marginRight: 8,
            marginBottom: 8,
            backgroundColor: theme.colors.secondaryContainer,
        },
        courseInfo: {
            fontSize: 16,
            fontFamily: 'Poppins_400Regular',
            color: theme.colors.onSurfaceVariant,
        },
    });

    return (
        <Card style={styles.infoCard} elevation={4}>
            <Card.Content>
                <Title style={styles.cardTitle}>Batch Information</Title>
                <View style={styles.chipContainer}>
                    <Chip icon="calendar" style={styles.chip}>Batch 2026</Chip>
                    <Chip icon="school" style={styles.chip}>5th Semester</Chip>
                </View>
                <Text style={styles.courseInfo}>
                    Computer Science & Engineering - Data Science
                </Text>
            </Card.Content>
        </Card>
    );
}

