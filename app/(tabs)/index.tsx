
import { Platform, StyleSheet, TextInput } from 'react-native';


import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState } from 'react';

export default function HomeScreen() {
  const [thismonthShow, setThismonthShow] = useState('');

  const lastMonthShow = '99999';
  const now = thismonthShow ? parseInt(lastMonthShow) - parseInt(thismonthShow)  : '';

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#0000f9ff' }} headerImage={<></>}>
      
      
          
       
    
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle" adjustsFontSizeToFit>Rādijumi</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText >
          
          pagājušā mēneša rādijums: {lastMonthShow}
        </ThemedText>
        <ThemedView style={styles.inputRow}>
          <ThemedText >Šī mēneša rādijums:</ThemedText>
          <TextInput
            style={styles.input}
            value={thismonthShow}
            onChangeText={(text) => setThismonthShow(text.replace(/[^0-9]/g, ''))}
            placeholder="Ievadi rādijumu"
            keyboardType="numeric"
            maxLength={5}
          />
          <ThemedText > Līdz 31.01.2026</ThemedText>
         
        </ThemedView>
        <ThemedText >Patēriņš : {now} </ThemedText>
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
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: 90, 
    marginLeft: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  
  },
  Background: {
        backgroundColor: '#1e37f6ff',
    },
});
