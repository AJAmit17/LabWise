import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { Card, Text, ActivityIndicator, useTheme, Button, MD3Theme as Theme } from 'react-native-paper';
import { RefreshControl } from 'react-native';

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMDlhNTIyNC03YzFhLTQ4NzMtOTFlMi1hMGNlY2M3YTQyNjYiLCJlbWFpbCI6ImFtaXRhY2hhcnlhMjYzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0YWNlNjM2NGE5ODIzMTcyOWI3YSIsInNjb3BlZEtleVNlY3JldCI6IjIyODAyODIyNWQ2NmZiOGY2YTM3YzU3MTNhYWQ1OTkwNjRhZDMwNTMwMDQ1NWE5NTU1OWE3MmIxOGNhNWYwZmYiLCJleHAiOjE3NjQzMjk0NDd9.LLW_F-su6evJuh_1oNoqUWa76NnbhJD-wmuslKCOwtg";

interface PinataFile {
    id: string;
    name: string;
    cid: string;
    size: number;
    mime_type: string;
    created_at: string;
}

interface PinataResponse {
    data: {
        files: PinataFile[];
        next_page_token?: string;
    };
}

export default function ResourcesScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [files, setFiles] = useState<PinataFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFiles = async () => {
        try {
            const response = await fetch('https://api.pinata.cloud/v3/files', {
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }

            const data = await response.json();
            setFiles(data.data.files);
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to fetch files. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchFiles();
    }, []);

    useEffect(() => {
        fetchFiles();
    }, []);


    const handleDownload = async (fileCid: string) => {
        try {
            setLoading(true);
            const payload = JSON.stringify({
                url: `https://amethyst-familiar-cephalopod-113.mypinata.cloud/files/${fileCid}`,
                expires: 3600,
                date: Math.floor(Date.now() / 1000),
                method: "GET"
            });

            const response = await fetch('https://api.pinata.cloud/v3/files/sign', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`,
                    'Content-Type': 'application/json'
                },
                body: payload
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Failed to get signed URL: ${data.error || response.statusText}`);
            }

            if (data.data) {
                await Linking.openURL(data.data);
            } else {
                throw new Error('No signed URL in response');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            Alert.alert('Error', 'Failed to download file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Study Materials</Text>

            {loading ? (
                <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
            ) : (
                <ScrollView
                    style={styles.fileList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                            progressBackgroundColor={theme.colors.surface}
                        />
                    }
                >
                    {files.map((file) => (
                        <Card key={file.id} style={styles.fileCard} mode="elevated">
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.fileName}>
                                    {file.name}
                                </Text>
                                <Button
                                    mode="contained"
                                    onPress={() => handleDownload(file.cid)}
                                    icon="download"
                                >
                                    Download
                                </Button>
                            </Card.Content>
                        </Card>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    title: {
        padding: 16,
        textAlign: 'center',
        color: theme.colors.onBackground,
        marginBottom: 8,
    },
    fileList: {
        padding: 16,
    },
    fileCard: {
        marginBottom: 16,
        backgroundColor: theme.colors.elevation.level2,
        borderRadius: 12,
        elevation: 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardContent: {
        padding: 16,
    },
    fileName: {
        color: theme.colors.onSurface,
        marginBottom: 8,
        fontWeight: '600',
    },
    fileInfo: {
        color: theme.colors.onSurfaceVariant,
        marginBottom: 4,
        fontSize: 12,
    },
    loader: {
        flex: 1,
        alignSelf: 'center',
    },
    progressBar: {
        marginTop: 8,
        height: 4,
        borderRadius: 2,
    },
});