import { Alert, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { setSession } from '@/lib/auth';
import { ensureUser } from '@/lib/database';

export default function LoginScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const isPhone = Platform.OS !== 'web';
  const [lietotajaVards, setLietotajaVards] = useState('');
  const [parole, setParole] = useState('');

  const handleLogin = async () => {
    const username = lietotajaVards.trim();
    const isGuestLogin =
      (username === 'dz1' && parole === 'dz1') ||
      (username === 'dz5' && parole === 'dz5');

    if (!username || !parole) {
      Alert.alert('Kaut kas trūkst', 'Ievadi lietotājvārdu un paroli.');
      return;
    }

    if (username === 'x' && parole === 'x') {
      setSession({ role: 'admin', username });
      router.replace('/(tabs)/admin');
      return;
    }

    if (!isGuestLogin) {
      Alert.alert('Neizdevās', 'Atļautie viesu konti ir tikai dz1/dz1 vai dz5/dz5.');
      return;
    }

    const isAllowed = await ensureUser(database, username, parole);

    if (!isAllowed) {
      Alert.alert('Neizdevās', 'Nepareiza parole šim lietotājam.');
      return;
    }

    setSession({ role: 'user', username });
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={[styles.container, isPhone && styles.containerPhone]}>
      <ThemedText type="title" style={styles.title}>Pieslēgties</ThemedText>
      <TextInput
        style={[styles.input, isPhone && styles.inputPhone]}
        placeholder="Lietotājvārds"
        value={lietotajaVards}
        onChangeText={setLietotajaVards}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, isPhone && styles.inputPhone]}
        placeholder="Parole"
        value={parole}
        onChangeText={setParole}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, isPhone && styles.buttonPhone]}
        onPress={() => {
          void handleLogin();
        }}>
        <ThemedText style={[styles.buttonText, isPhone && styles.buttonTextPhone]}>Pieslēgties</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  containerPhone: {
    padding: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    fontSize: 16,
    width: 320,
    height: 48,
  },
  inputPhone: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 14,
    width: '92%',
    maxWidth: 280,
    height: 42,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    width: 300,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPhone: {
    width: '85%',
    maxWidth: 250,
    height: 40,
  },
  buttonText: {
    color: '#ffffff',
  },
  buttonTextPhone: {
    fontSize: 13,
  },
});
