import React from 'react';
import { StyleSheet, View, Linking, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function Footer() {
    const theme = useTheme();

    const openGitHub = () => {
        Linking.openURL('https://github.com/AJAmit17/LabWise');
    };

    const openPortfolio = () => {
        Linking.openURL('https://amit-acharya.live');
    };

    return (
        <View style={styles.footer}>
            <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.footerGradient}
            >
                <TouchableOpacity onPress={openPortfolio}>
                    <Text style={[styles.footerTitle, { textDecorationLine: 'underline' }]}>Built by Amit</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}>
                    Not on App Store because I can't afford the $25 developer fee{'\n'}
                    Fully Open-Source and Free to Use*
                </Text>
                <Text style={styles.footerSubtext}>
                    * This app runs on hopes, dreams.
                </Text>
                <Button
                    mode="contained"
                    icon="github"
                    style={styles.sourceButton}
                    contentStyle={styles.sourceButtonContent}
                    onPress={openGitHub}
                >
                    Source Code
                </Button>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        marginTop: 32,
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    footerGradient: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    footerTitle: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    footerText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        marginBottom: 8,
    },
    footerSubtext: {
        color: '#FFFFFF',
        opacity: 0.7,
        fontSize: 12,
        fontStyle: 'italic',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 16,
    },
    sourceButton: {
        backgroundColor: '#7375f2',
    },
    sourceButtonContent: {
        paddingVertical: 8,
    },
});

