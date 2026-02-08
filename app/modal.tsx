import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import React from "react";
// import MonthlyChart from '@/components/chart.js';






export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">patēriņa līkne</ThemedText>
    </ThemedView>
  );
  
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  
});
