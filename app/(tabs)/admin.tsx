import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { clearSession, getSession } from '@/lib/auth';
import { getAllUsersPaterins, type UserPaterinsRecord } from '@/lib/database';

export default function AdminScreen() {
	const router = useRouter();
	const database = useSQLiteContext();
	const [users, setUsers] = useState<UserPaterinsRecord[]>([]);

	const loadData = useCallback(async () => {
		const currentSession = getSession();

		if (currentSession.role !== 'admin') {
			router.replace('/(tabs)/Login');
			return;
		}

		const usersResult = await getAllUsersPaterins(database);
		setUsers(usersResult);
	}, [database, router]);

	useFocusEffect(
		useCallback(() => {
			void loadData();
		}, [loadData])
	);

	const handleLogout = () => {
		clearSession();
		router.replace('/(tabs)/Login');
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<ThemedText type="title" style={styles.heading}>Admin profils</ThemedText>
			<ThemedText type="subtitle" >Lietotāji</ThemedText>

			<ThemedView style={styles.list}>
				{users.length === 0 ? (
					<ThemedText>Vēl nav lietotāju datu.</ThemedText>
				) : (
					users.map((item) => (
						<ThemedView key={item.id} style={styles.row}>
							<ThemedText>{item.username}</ThemedText>
							<ThemedText>{item.paterins}</ThemedText>
						</ThemedView>
					))
				)}
			</ThemedView>

			<Pressable style={styles.logoutButton} onPress={handleLogout}>
				<ThemedText style={styles.logoutText}>Iziet</ThemedText>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 12,
	},
	heading: {
		marginTop: 24,
		textAlign: 'center',
	},

	subtitle: {
		opacity: 0.75,
	},
	list: {
		marginTop: 8,
		gap: 10,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: '#e5e7eb',
		paddingBottom: 8,
	},
	readingRow: {
		gap: 4,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e7eb',
		paddingBottom: 8,
	},
	logoutButton: {
		marginTop: 12,
		alignSelf: 'flex-start',
		backgroundColor: '#2563eb',
		borderRadius: 6,
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	logoutText: {
		color: '#fff',
	},
});
