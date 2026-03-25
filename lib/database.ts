import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'pdarbs.db';

export type ReadingRecord = {
  id: number;
  username: string;
  month_label: string;
  reading: number;
  created_at: string;
};

export type UserRecord = {
  id: number;
  username: string;
  password: string;
  paterins: number;
};

export type UserPaterinsRecord = {
  id: number;
  username: string;
  paterins: number;
};

export async function initializeDatabase(database: SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS meter_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      month_label TEXT NOT NULL,
      reading INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      paterins INTEGER DEFAULT 0
    );
  `);

  const readingColumns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(meter_readings)');
  const hasUsernameColumn = readingColumns.some((column) => column.name === 'username');

  if (!hasUsernameColumn) {
    await database.execAsync(`
      ALTER TABLE meter_readings ADD COLUMN username TEXT;
      UPDATE meter_readings SET username = 'dz1' WHERE username IS NULL;
    `);
  }
}

export async function getReadings(database: SQLiteDatabase, username?: string) {
  if (username) {
    return database.getAllAsync<ReadingRecord>(
      'SELECT id, username, month_label, reading, created_at FROM meter_readings WHERE username = ? ORDER BY id DESC',
      [username]
    );
  }

  return database.getAllAsync<ReadingRecord>(
    'SELECT id, username, month_label, reading, created_at FROM meter_readings ORDER BY id DESC'
  );
}

export async function addReading(database: SQLiteDatabase, username: string, reading: number, monthLabel: string) {
  return database.runAsync(
    'INSERT INTO meter_readings (username, month_label, reading, created_at) VALUES (?, ?, ?, ?)',
    [username, monthLabel, reading, new Date().toISOString()]
  );
}

export async function clearReadings(database: SQLiteDatabase, username?: string) {
  if (username) {
    return database.runAsync('DELETE FROM meter_readings WHERE username = ?', [username]);
  }

  return database.runAsync('DELETE FROM meter_readings');
}

export async function addUser(database: SQLiteDatabase, username: string, password: string, paterins: number = 0) {
  return database.runAsync(
    'INSERT INTO users (username, password, paterins) VALUES (?, ?, ?)',
    [username, password, paterins]
  );
}

export async function getUser(database: SQLiteDatabase, username: string) {
  return database.getFirstAsync<UserRecord>(
    'SELECT id, username, password, paterins FROM users WHERE username = ?',
    [username]
  );
}

export async function ensureUser(database: SQLiteDatabase, username: string, password: string) {
  const existing = await getUser(database, username);

  if (!existing) {
    await addUser(database, username, password, 0);
    return true;
  }

  return existing.password === password;
}

export async function updateUserPaterins(database: SQLiteDatabase, username: string, paterins: number) {
  return database.runAsync('UPDATE users SET paterins = ? WHERE username = ?', [paterins, username]);
}

export async function getAllUsersPaterins(database: SQLiteDatabase) {
  return database.getAllAsync<UserPaterinsRecord>(
    'SELECT id, username, paterins FROM users ORDER BY username COLLATE NOCASE ASC'
  );
}

export function getCurrentMonthLabel(date = new Date()) {
  return date.toLocaleDateString('lv-LV', {
    month: 'long',
    year: 'numeric',
  });
}
