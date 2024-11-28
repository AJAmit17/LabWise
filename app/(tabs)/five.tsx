import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Avatar, useTheme, ActivityIndicator } from 'react-native-paper';

interface User {
    email_addresses: any;
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    profile_image_url: string;
    last_active_at: number;
    created_at: number;
    has_image: boolean;
}

const CommunityScreen = () => {
    const theme = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const token = "sk_test_PAb4qWI35lcFsTWZxBs5ymqKSivpl0jvubb0xu4hyq";

            const response = await fetch('https://api.clerk.com/v1/users?limit=10&offset=0&order_by=-created_at', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to load community members');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchUsers();
    }, []);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString();
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
                Community Members ({users.length})
            </Text>

            {loading ? (
                <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
            ) : error ? (
                <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
            ) : (
                <ScrollView
                    style={styles.scrollView}
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
                    {users.map((user) => (
                        <Card
                            key={user.id}
                            style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}
                            mode="elevated"
                        >
                            <Card.Content style={styles.cardContent}>
                                <Avatar.Image
                                    size={60}
                                    source={{ uri: user.profile_image_url || user.image_url }}
                                    style={styles.avatar}
                                />
                                <View style={styles.userInfo}>
                                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                                        {user.first_name} {user.last_name}
                                    </Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Email: {user.email_addresses[0].email_address}
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Joined: {formatDate(user.created_at)}
                                    </Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                        Last active: {formatDate(user.last_active_at)}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
    },
    avatar: {
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    loader: {
        flex: 1,
        alignSelf: 'center',
    },
    error: {
        textAlign: 'center',
        marginTop: 20,
    },
    badges: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 12,
        color: 'white',
    },
});

export default CommunityScreen;