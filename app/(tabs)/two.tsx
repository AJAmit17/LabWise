
import ExperimentCard from '@/components/ExperimentCard';
import { Experiment } from '@/types';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, ScrollView, View, RefreshControl, StyleSheet } from 'react-native';

const ExperimentList = () => {
  const [isLoading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

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

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6200ee']} // Android
          tintColor="#6200ee" // iOS
          title="Pull to refresh"
          titleColor="#6200ee"
        />
      }
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          experiments.map((exp) => <ExperimentCard key={exp._id} experiment={exp} />)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default ExperimentList;