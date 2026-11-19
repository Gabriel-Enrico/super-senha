
import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'super-senha.db';

let banco: SQLiteDatabase | null = null;
let inicializacao: Promise<SQLiteDatabase> | null = null;

async function abrirEPrepararBanco(): Promise<SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Ativa as chaves estrangeiras nesta conexão.
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Cria primeiro a tabela de baralhos.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS baralhos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id TEXT NOT NULL,
      tema_id TEXT NOT NULL,
      nome TEXT NOT NULL
    );
  `);

  // Depois cria a tabela de palavras.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS palavras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baralho_id INTEGER NOT NULL,
      palavra TEXT NOT NULL,
      FOREIGN KEY (baralho_id)
        REFERENCES baralhos(id)
        ON DELETE CASCADE
    );
  `);

  return db;
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (banco) {
    return banco;
  }

  // Evita inicializar duas conexões simultaneamente.
  if (!inicializacao) {
    inicializacao = abrirEPrepararBanco();
  }

  try {
    banco = await inicializacao;
    return banco;
  } catch (error) {
    inicializacao = null;
    console.error('Erro ao inicializar SQLite:', error);
    throw error;
  }
}
