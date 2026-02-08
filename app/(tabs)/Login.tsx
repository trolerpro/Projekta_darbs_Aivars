import { StyleSheet, TextInput, Alert,  } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const [lietotajavards, setLietotajvards] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (lietotajavards && password) {
      Alert.alert(`Sveicināts, ${lietotajavards}!`);
    } else {
      Alert.alert('Lietotājvārds vai parole ir nepareiza');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Log In</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Lietotājvārds "
        value={lietotajavards}
        onChangeText={setLietotajvards}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Parole"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
        <button style={styles.button} onTouchEnd={handleLogin}>Pieslēgties</button>
      
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
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    fontSize: 10,
    width:350,
    height:40,
  },


    button: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    width: 300,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  

  },

});
