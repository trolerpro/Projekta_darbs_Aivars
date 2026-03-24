
import { Alert, Platform, Pressable, StyleSheet, TextInput } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getSession } from '@/lib/auth';
import {
  addReading,
  getCurrentMonthLabel,
  getReadings,
  type ReadingRecord,
  updateUserPaterins,
} from '@/lib/database';

export default function HomeScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const isPhone = Platform.OS !== 'web';
  const mobileTextStyle = isPhone ? styles.phoneText : undefined;
  const [thisMonth, setThisMonth] = useState('');
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
      if (getSession().role !== 'user') {
        router.replace('/(tabs)/Login');
        return;
      }

      void loadReadings();
    }, [loadReadings, router])
  );

  const saveReading = async () => {
    const currentUser = getSession().username;
    if (!currentUser) {
      Alert.alert('Neizdevās', 'Nav aktīva profila. Lūdzu ielogojies vēlreiz.');
      return;
    }

    const inputNumber = Number(thisMonth.replace(',', '.'));

    if (!Number.isFinite(inputNumber) || inputNumber < 0) {
      Alert.alert('Nepareizs skaitlis', 'Ievadi derīgu rādījumu.');
      return;
    }

    const roundedReading = Math.round(inputNumber);
    const previousReadingValue = readings[0]?.reading;

    if (typeof previousReadingValue === 'number' && roundedReading < previousReadingValue) {
      Alert.alert('Par mazu', `Jaunais rādījums nevar būt mazāks par iepriekšējo rādījumu (${previousReadingValue}).`);
      return;
    }

    const monthLabel = getCurrentMonthLabel();
    await addReading(database, currentUser, roundedReading, monthLabel);

    const consumption = typeof previousReadingValue === 'number' ? roundedReading - previousReadingValue : 0;
    await updateUserPaterins(database, currentUser, consumption);

    setThisMonth('');
    await loadReadings();
  };

  const previousMonthReading = readings[1] ? String(readings[1].reading) : 'vēl nav';

  const currentReading = readings[0]?.reading;
  const previousReadingNum = readings[1]?.reading;
  const consumption =
    typeof currentReading === 'number' && typeof previousReadingNum === 'number'
      ? currentReading - previousReadingNum
      : null;

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#0000f9ff' }} headerImage={<></>}>
      <ThemedView style={[styles.stepContainer, isPhone && styles.stepContainerPhone]}>
        <ThemedText type="title" style={[mobileTextStyle, { textAlign: 'center', marginBottom: 16 }]}>Rādījumi</ThemedText>

        <ThemedView style={[styles.inputBlock, isPhone && styles.inputBlockPhone]}>
          <ThemedText style={mobileTextStyle}>
            Pagājušā mēneša rādījums: {previousMonthReading}
          </ThemedText>
            <ThemedText style={mobileTextStyle}>
            Šī mēneša rādījums: {currentReading ?? 'vēl nav'}
          </ThemedText>
          <ThemedText style={mobileTextStyle}>Ievadi šī mēneša rādījumu:</ThemedText>
          <ThemedView style={[styles.inputRow, isPhone && styles.inputRowPhone]}>
            <TextInput
              style={[styles.input, isPhone && styles.inputPhone]}
              placeholder="Ievadi"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              maxLength={5}
              value={thisMonth}
              onChangeText={setThisMonth}
            />
            <Pressable
              style={[styles.button, isPhone && styles.buttonPhone]}
              onPress={() => {
                void saveReading();
              }}>
              <ThemedText style={[styles.buttonText, isPhone && styles.buttonTextPhone]}>Saglabāt</ThemedText>
            </Pressable>
          </ThemedView>

        </ThemedView>

        <Link href="/modal" asChild>
          <Pressable>
            <ThemedText style={[styles.linkText, isPhone && styles.linkTextPhone, mobileTextStyle, { textDecorationLine: 'none' }]}>Patēriņš: {consumption ?? 'vēl nav'}</ThemedText>
          </Pressable>
        </Link>

       </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneText: {
    fontSize: 17,
  },
  stepContainer: {
    gap: 14,
    marginBottom: 16,
    padding: 20,
  },
  stepContainerPhone: {
    padding: 16,
  },
  labelText: {
    textAlign: 'left',
  },
  labelTextPhone: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 140,
    fontSize: 14,
    marginTop: 8,
  },
  inputPhone: {
    width: '100%',
    fontSize: 13,
    marginTop: 6,
    maxWidth: 220,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  inputBlock: {
    gap: 8,
  },
  inputBlockPhone: {
    marginTop: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputRowPhone: {
    alignItems: 'flex-start',
    gap: 6,
    width: '100%',
    flexDirection: 'column',
  },
  historyBlock: {
    gap: 10,
    marginTop: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  smallText: {
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonPhone: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  buttonText: {
    color: '#ffffff',
  },
  buttonTextPhone: {
    fontSize: 13,
  },
  linkText: {
    color: '#1d4ed8',
    textAlign: 'left',
    textDecorationLine: 'underline',
  },
  linkTextPhone: {
    fontSize: 13,
  },
});
