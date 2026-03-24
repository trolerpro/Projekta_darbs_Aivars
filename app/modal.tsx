import { Alert, Platform, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSession } from '@/lib/auth';
import { clearReadings, getReadings, type ReadingRecord } from '@/lib/database';

export default function ModalScreen() {
  const database = useSQLiteContext();
  const isPhone = Platform.OS !== 'web';
  const [readings, setReadings] = useState<ReadingRecord[]>([]);

  const loadReadings = useCallback(async () => {
    const currentUser = getSession().username;
    if (!currentUser) {
      setReadings([]);
      return;
    }

    const result = await getReadings(database, currentUser);
    setReadings(result);
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void loadReadings();
    }, [loadReadings])
  );
  const previousReading = readings[1]?.reading;
  const latestPaterins =
    typeof readings[0]?.reading === 'number' && typeof previousReading === 'number'
      ? readings[0].reading - previousReading
      : null;

  const handleClearHistory = () => {
    if (readings.length === 0) {
      if (isPhone) {
        Alert.alert('Nav ko dzēst', 'Vēsture jau ir tukša.');
      } else {
        alert('Nav ko dzēst: Vēsture jau ir tukša.');
      }
      return;
    }

    const performDelete = async () => {
      try {
        console.log('Starting delete...');
        const currentUser = getSession().username;
        if (!currentUser) {
          throw new Error('Nav aktīva profila.');
        }

        await clearReadings(database, currentUser);
        console.log('Readings cleared');

        console.log('Current user:', currentUser);

        await loadReadings();
        console.log('Readings reloaded');
      } catch (error) {
        console.error('Clear history error:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (isPhone) {
          Alert.alert('Kļūda', `Neizdevās notīrīt vēsturi: ${errorMsg}`);
        } else {
          alert(`Kļūda: Neizdevās notīrīt vēsturi: ${errorMsg}`);
        }
      }
    };

    if (isPhone) {
      Alert.alert('Dzēst vēsturi?', 'Tiks izdzēsti visi saglabātie rādījumi.', [
        {
          text: 'Atcelt',
          style: 'cancel',
        },
        {
          text: 'Dzēst',
          style: 'destructive',
          onPress: () => {
            void performDelete();
          },
        },
      ]);
    } else {
      const confirmed = confirm('Dzēst vēsturi? Tiks izdzēsti visi saglabātie rādījumi.');
      if (confirmed) {
        void performDelete();
      }
    }
  };

  return (
    <ThemedView style={[styles.container, isPhone && styles.containerPhone]}>
      <ThemedText type="title" style={{ textAlign: 'center' }}>Patēriņa pārskats</ThemedText>
      <ThemedText style={[styles.text, isPhone && styles.textPhone]}>
        Pēdējais patēriņš: {latestPaterins === null ? 'vēl nav' : latestPaterins}
      </ThemedText>

      {readings.length >= 2 && (
        <Pressable style={[styles.clearButton, isPhone && styles.clearButtonPhone]} onPress={handleClearHistory}>
          <ThemedText style={[styles.clearButtonText, isPhone && styles.clearButtonTextPhone]}>Notīrīt vēsturi</ThemedText>
        </Pressable>
      )}

      <ThemedView style={styles.list}>
        {readings.length === 0 ? (
          <ThemedText style={[styles.text, isPhone && styles.textPhone]}>Datubāzē vēl nav saglabātu rādījumu.</ThemedText>
        ) : (
          readings.slice(0, 5).map((item, index) => {
            const nextReading = readings[index + 1]?.reading;
            const rowPaterins = typeof nextReading === 'number' ? item.reading - nextReading : null;

            if (rowPaterins === null) {
              return null;
            }

            return (
            <ThemedView key={item.id} style={styles.row}>
              <ThemedText>Datums: {item.month_label}</ThemedText>
              <ThemedText>Patēriņš: {rowPaterins}</ThemedText>
            </ThemedView>
            );
          })
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 20,
  },
  containerPhone: {
    gap: 10,
    padding: 16,
  },
  text: {
    textAlign: 'left',
  },
  textPhone: {
    fontSize: 13,
  },
  list: {
    marginTop: 8,
    gap: 10,
  },
  clearButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  clearButtonPhone: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  clearButtonText: {
    color: '#ffffff',
  },
  clearButtonTextPhone: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
});
