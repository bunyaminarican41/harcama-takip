const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'harcama.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS kategoriler (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad TEXT NOT NULL UNIQUE,
      renk TEXT NOT NULL DEFAULT '#6366f1',
      olusturulma TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS harcamalar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baslik TEXT NOT NULL,
      miktar REAL NOT NULL,
      tur TEXT NOT NULL CHECK(tur IN ('gider', 'gelir')),
      kategori_id INTEGER,
      aciklama TEXT,
      tarih TEXT NOT NULL DEFAULT (date('now')),
      olusturulma TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE SET NULL
    );

    INSERT OR IGNORE INTO kategoriler (ad, renk) VALUES
      ('Yiyecek & İçecek', '#f59e0b'),
      ('Ulaşım', '#3b82f6'),
      ('Eğlence', '#8b5cf6'),
      ('Faturalar', '#ef4444'),
      ('Sağlık', '#10b981'),
      ('Giyim', '#ec4899'),
      ('Maaş', '#22c55e'),
      ('Diğer', '#6b7280');
  `);
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };
