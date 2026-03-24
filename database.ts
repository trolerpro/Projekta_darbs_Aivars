import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('pdarbs.db');
  }
  return dbPromise;
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  await db.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('lastmonth', '1')`
  );
}

type SettingRow = {
  value: string;
};

type UserRow = {
  id: number;
  username: string;
  password: string;
};

export async function getLastMonthReading(): Promise<string> {
  const db = await getDb();
  const row = await db.getFirstAsync<SettingRow>(
    `SELECT value FROM settings WHERE key = ?`,
    'lastmonth'
  );
  return row?.value ?? '1';
}

export async function setLastMonthReading(value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings (key, value)
     VALUES ('lastmonth', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    value
  );
}

export async function saveOrValidateLogin(
  username: string,
  password: string
): Promise<'created' | 'ok' | 'wrong-password'> {
  const db = await getDb();
  const user = await db.getFirstAsync<UserRow>(
    `SELECT id, username, password FROM users WHERE username = ?`,
    username
  );

  if (!user) {
    await db.runAsync(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      username,
      password
    );
    return 'created';
  }

  if (user.password === password) {
    return 'ok';
  }

  return 'wrong-password';
}
