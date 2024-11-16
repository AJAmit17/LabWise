import ExperimentCard from '@/components/ExperimentCard';
import { Experiment } from '@/types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View, StyleSheet } from 'react-native';

const ExperimentList = () => {
  const [isLoading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://connect-craft.vercel.app/api/experiments');
        const json = await response.json();
        setExperiments(json.experiments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          experiments.map((exp) => <ExperimentCard key={exp._id} experiment={exp} />)
        )}
      </View>
    </ScrollView>
  );
};


export default ExperimentList;