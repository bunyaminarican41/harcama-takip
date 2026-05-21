const { getDb } = require('../database');

function tumKategorileriGetir() {
  const db = getDb();
  return db.prepare(`
    SELECT k.*, COUNT(h.id) as harcama_sayisi
    FROM kategoriler k
    LEFT JOIN harcamalar h ON k.id = h.kategori_id
    GROUP BY k.id
    ORDER BY k.ad
  `).all();
}

function kategoriGetir(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM kategoriler WHERE id = ?').get(id);
}

function kategoriOlustur({ ad, renk }) {
  if (!ad || ad.trim() === '') throw new Error('Kategori adı zorunludur.');

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (renk && !hexRegex.test(renk)) throw new Error('Renk geçerli bir hex kodu olmalıdır (örn: #ff0000).');

  const db = getDb();
  const mevcut = db.prepare('SELECT id FROM kategoriler WHERE ad = ?').get(ad.trim());
  if (mevcut) throw new Error('Bu isimde bir kategori zaten mevcut.');

  const result = db.prepare('INSERT INTO kategoriler (ad, renk) VALUES (?, ?)').run(
    ad.trim(),
    renk || '#6366f1'
  );
  return kategoriGetir(result.lastInsertRowid);
}

function kategoriGuncelle(id, { ad, renk }) {
  const mevcut = kategoriGetir(id);
  if (!mevcut) return null;

  if (ad !== undefined && ad.trim() === '') throw new Error('Kategori adı boş olamaz.');

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (renk && !hexRegex.test(renk)) throw new Error('Renk geçerli bir hex kodu olmalıdır.');

  const db = getDb();
  if (ad) {
    const cakisan = db.prepare('SELECT id FROM kategoriler WHERE ad = ? AND id != ?').get(ad.trim(), id);
    if (cakisan) throw new Error('Bu isimde bir kategori zaten mevcut.');
  }

  db.prepare(`
    UPDATE kategoriler SET
      ad = COALESCE(?, ad),
      renk = COALESCE(?, renk)
    WHERE id = ?
  `).run(ad ? ad.trim() : null, renk || null, id);

  return kategoriGetir(id);
}

function kategoriSil(id) {
  const mevcut = kategoriGetir(id);
  if (!mevcut) return false;
  const db = getDb();
  db.prepare('DELETE FROM kategoriler WHERE id = ?').run(id);
  return true;
}

module.exports = {
  tumKategorileriGetir,
  kategoriGetir,
  kategoriOlustur,
  kategoriGuncelle,
  kategoriSil
};
