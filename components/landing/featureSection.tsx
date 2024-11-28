import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

const features = [
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
        text: "Class Time-Table",
        description: "Quick access to your class schedule"
    }
];

export default function FeaturesSection() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <Title style={styles.sectionTitle}>Quick Access</Title>
            <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInRight.delay(300 * index).duration(500)}
                    >
                        <Card style={styles.featureCard} mode="outlined">
                            <Card.Content style={styles.featureContent}>
                                <MaterialCommunityIcons
                                    name={feature.icon as any}
                                    size={40}
                                    color={theme.colors.primary}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 10,
    },
    featuresContainer: {
        gap: 12,
    },
    featureCard: {
        borderRadius: 12,
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
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
});

