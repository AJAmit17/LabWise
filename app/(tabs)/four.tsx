import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { Card, Text, ActivityIndicator, useTheme, Button, Searchbar, MD3Theme as Theme, Divider, Banner, Surface } from 'react-native-paper';
import { RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PINATA_JWT = process.env.PINATA_JWT;

interface PinataFile {
    id: string;
    name: string;
    cid: string;
    size: number;
    mime_type: string;
    created_at: string;
}

export default function ResourcesScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [files, setFiles] = useState<PinataFile[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<PinataFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

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

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return 'file-pdf-box';
        if (mimeType.includes('image')) return 'file-image';
        if (mimeType.includes('video')) return 'file-video';
        if (mimeType.includes('audio')) return 'file-music';
        return 'file-document';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        const filtered = files.filter(file =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFiles(filtered);
    }, [searchQuery, files]);

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
            <Surface style={styles.headerContainer} elevation={4}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Study Materials</Text>
                    <Text style={styles.headerSubtitle}>CSE-DS Resources</Text>
                    <Searchbar
                        placeholder="Search files..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbar}
                        iconColor={theme.colors.primary}
                    />
                </View>
            </Surface>

            {error && (
                <Banner
                    visible={true}
                    actions={[{ label: 'Retry', onPress: fetchFiles }]}
                    icon="alert-circle"
                >
                    {error}
                </Banner>
            )}

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loaderText}>Loading resources...</Text>
                </View>
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
                    {filteredFiles.map((file) => (
                        <Card key={file.id} style={styles.fileCard} mode="elevated">
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.fileHeader}>
                                    <MaterialCommunityIcons
                                        name={getFileIcon(file.mime_type)}
                                        size={32}
                                        color={theme.colors.primary}
                                    />
                                    <View style={styles.fileDetails}>
                                        <Text variant="titleMedium" style={styles.fileName}>
                                            {file.name}
                                        </Text>
                                        <Text variant="bodySmall" style={styles.fileInfo}>
                                            {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <Divider style={styles.divider} />
                                <Button
                                    mode="contained-tonal"
                                    onPress={() => handleDownload(file.cid)}
                                    icon="download"
                                    style={styles.downloadButton}
                                >
                                    Download
                                </Button>
                            </Card.Content>
                        </Card>
                    ))}
                    {filteredFiles.length === 0 && !loading && (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="file-search"
                                size={48}
                                color={theme.colors.primary}
                            />
                            <Text variant="titleMedium" style={styles.emptyStateText}>
                                No files found
                            </Text>
                        </View>
                    )}
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
    headerContainer: {
        backgroundColor: theme.colors.surface,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 16,
        elevation: 4,
    },
    headerContent: {
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.onSurfaceVariant,
        marginBottom: 16,
    },
    searchbar: {
        elevation: 0,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceVariant,
    },
    fileList: {
        padding: 16,
    },
    fileCard: {
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        elevation: 2,
        shadowColor: theme.colors.shadow,
        borderWidth: 1,
        borderColor: theme.colors.surfaceVariant,
    },
    cardContent: {
        padding: 16,
    },
    fileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileDetails: {
        marginLeft: 12,
        flex: 1,
    },
    fileName: {
        color: theme.colors.onSurface,
        fontWeight: '600',
        marginBottom: 8,
    },
    fileInfo: {
        color: theme.colors.onSurfaceVariant,
        marginBottom: 4,
        fontSize: 12,
    },
    divider: {
        marginVertical: 12,
        backgroundColor: theme.colors.surfaceVariant,
    },
    downloadButton: {
        marginTop: 8,
        backgroundColor: theme.colors.surfaceVariant,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 16,
        color: theme.colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    emptyStateText: {
        marginTop: 16,
        color: theme.colors.onSurfaceVariant,
    },
    progressBar: {
        marginTop: 8,
        height: 4,
        borderRadius: 2,
    },
});