import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useTheme, Text, Searchbar, ActivityIndicator, Surface , MD3Theme as Theme} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import ExperimentCard from '@/components/ExperimentCard';
import { Experiment } from '@/types';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Experiment>);

const ExperimentList: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [isLoading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://connect-craft.vercel.app/api/experiments');
      const json = await response.json();
      setExperiments(json.experiments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = experiments.filter(exp => 
      exp.ExpName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.ExpDesc?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExperiments(filtered);
  }, [searchQuery, experiments]);

  const renderItem: ListRenderItem<Experiment> = useCallback(({ item }) => (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      layout={Layout.springify()}
    >
      <ExperimentCard experiment={item} />
    </Animated.View>
  ), []);

  const ListEmptyComponent = useCallback(() => (
    <Animated.View 
      style={styles.centerContainer}
      entering={FadeIn.duration(300)}
    >
      <Ionicons name="documents-outline" size={48} color={theme.colors.primary} />
      <Text style={styles.emptyStateTitle}>No experiments found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Try adjusting your search or pull to refresh
      </Text>
    </Animated.View>
  ), [styles, theme.colors.primary]);

  return (
    <View style={styles.container}>
      <Surface style={styles.searchContainer} elevation={4}>
        <Searchbar
          placeholder="Search experiments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon={() => <Ionicons name="search" size={20} color={theme.colors.primary} />}
          clearIcon={() => 
            searchQuery ? 
            <Ionicons name="close-circle" size={20} color={theme.colors.primary} /> 
            : undefined
          }
        />
      </Surface>
      
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size={32} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading experiments...</Text>
        </View>
      ) : (
        <AnimatedFlatList
          data={filteredExperiments}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={ListEmptyComponent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
    zIndex: 1,
  },
  searchBar: {
    elevation: 0,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceVariant,
  },
  searchInput: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.primary,
    fontSize: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
  separator: {
    height: 16,
  },
});

export default ExperimentList;