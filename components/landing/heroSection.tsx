import React from 'react';
import { StyleSheet, View, Dimensions, ImageBackground, Image } from 'react-native';
import { Surface, Title, Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function HeroSection() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                style={styles.heroSection}
                resizeMode="cover"
            >
                <View style={[
                    styles.overlay,
                    { backgroundColor: theme.colors.primary + '99' }
                ]} />

                <Animated.View
                    entering={FadeIn.duration(1000)}
                    style={styles.contentWrapper}
                >
                    <Surface style={[
                        styles.contentContainer,
                        {
                            backgroundColor: theme.colors.surface,
                            elevation: theme.dark ? 0 : 4,
                        }
                    ]}>
                        <Animated.View
                            entering={SlideInRight.duration(1000).delay(300)}
                            style={styles.logoContainer}
                        >
                            <Image
                                source={require('@/assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </Animated.View>

                        <Animated.View
                            entering={SlideInRight.duration(1000).delay(600)}
                            style={styles.textContainer}
                        >
                            <Title
                                style={[
                                    styles.title,
                                    {
                                        color: theme.colors.onSurface,
                                        fontFamily: 'Poppins_700Bold'
                                    }
                                ]}
                            >
                                LabWise
                            </Title>
                            <Text
                                style={[
                                    styles.subtitle,
                                    {
                                        color: theme.colors.onSurface + 'CC',
                                        fontFamily: 'Poppins_400Regular'
                                    }
                                ]}
                            >
                                Application made for CSE-DS Students
                            </Text>
                        </Animated.View>
                    </Surface>
                </Animated.View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: height * 0.5,
    },
    heroSection: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.7,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    contentContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        overflow: 'hidden',
    },
    logo: {
        width: '70%',
        height: '70%',
    },
    textContainer: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 24,
    },
});