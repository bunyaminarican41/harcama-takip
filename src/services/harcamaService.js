const { getDb } = require('../database');

function tumHarcamalariGetir({ kategori_id, tur, baslangic, bitis, arama } = {}) {
  const db = getDb();
  let query = `
    SELECT h.*, k.ad as kategori_ad, k.renk as kategori_renk
    FROM harcamalar h
    LEFT JOIN kategoriler k ON h.kategori_id = k.id
    WHERE 1=1
  `;
  const params = [];

  if (kategori_id) {
    query += ' AND h.kategori_id = ?';
    params.push(Number(kategori_id));
  }
  if (tur) {
    query += ' AND h.tur = ?';
    params.push(tur);
  }
  if (baslangic) {
    query += ' AND h.tarih >= ?';
    params.push(baslangic);
  }
  if (bitis) {
    query += ' AND h.tarih <= ?';
    params.push(bitis);
  }
  if (arama) {
    query += ' AND (h.baslik LIKE ? OR h.aciklama LIKE ?)';
    params.push(`%${arama}%`, `%${arama}%`);
  }

  query += ' ORDER BY h.tarih DESC, h.olusturulma DESC';
  return db.prepare(query).all(...params);
}

function harcamaGetir(id) {
  const db = getDb();
  return db.prepare(`
    SELECT h.*, k.ad as kategori_ad, k.renk as kategori_renk
    FROM harcamalar h
    LEFT JOIN kategoriler k ON h.kategori_id = k.id
    WHERE h.id = ?
  `).get(id);
}

function harcamaOlustur({ baslik, miktar, tur, kategori_id, aciklama, tarih }) {
  if (!baslik || baslik.trim() === '') throw new Error('Başlık zorunludur.');
  if (miktar === undefined || miktar === null) throw new Error('Miktar zorunludur.');
  if (typeof miktar !== 'number' || isNaN(miktar) || miktar <= 0) throw new Error('Miktar pozitif bir sayı olmalıdır.');
  if (!tur || !['gider', 'gelir'].includes(tur)) throw new Error('Tür "gider" veya "gelir" olmalıdır.');

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO harcamalar (baslik, miktar, tur, kategori_id, aciklama, tarih)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    baslik.trim(),
    miktar,
    tur,
    kategori_id || null,
    aciklama ? aciklama.trim() : null,
    tarih || new Date().toISOString().split('T')[0]
  );
  return harcamaGetir(result.lastInsertRowid);
}

function harcamaGuncelle(id, { baslik, miktar, tur, kategori_id, aciklama, tarih }) {
  const mevcut = harcamaGetir(id);
  if (!mevcut) return null;

  if (baslik !== undefined && baslik.trim() === '') throw new Error('Başlık boş olamaz.');
  if (miktar !== undefined && (typeof miktar !== 'number' || isNaN(miktar) || miktar <= 0)) {
    throw new Error('Miktar pozitif bir sayı olmalıdır.');
  }
  if (tur !== undefined && !['gider', 'gelir'].includes(tur)) {
    throw new Error('Tür "gider" veya "gelir" olmalıdır.');
  }

  const db = getDb();
  db.prepare(`
    UPDATE harcamalar SET
      baslik = COALESCE(?, baslik),
      miktar = COALESCE(?, miktar),
      tur = COALESCE(?, tur),
      kategori_id = ?,
      aciklama = COALESCE(?, aciklama),
      tarih = COALESCE(?, tarih)
    WHERE id = ?
  `).run(
    baslik ? baslik.trim() : null,
    miktar || null,
    tur || null,
    kategori_id !== undefined ? (kategori_id || null) : mevcut.kategori_id,
    aciklama ? aciklama.trim() : null,
    tarih || null,
    id
  );
  return harcamaGetir(id);
}

function harcamaSil(id) {
  const mevcut = harcamaGetir(id);
  if (!mevcut) return false;
  const db = getDb();
  db.prepare('DELETE FROM harcamalar WHERE id = ?').run(id);
  return true;
}

function ozetGetir() {
  const db = getDb();
  const toplamlar = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN tur='gelir' THEN miktar ELSE 0 END), 0) as toplam_gelir,
      COALESCE(SUM(CASE WHEN tur='gider' THEN miktar ELSE 0 END), 0) as toplam_gider
    FROM harcamalar
  `).get();

  const kategoriBazli = db.prepare(`
    SELECT k.ad, k.renk, SUM(h.miktar) as toplam, COUNT(*) as adet
    FROM harcamalar h
    JOIN kategoriler k ON h.kategori_id = k.id
    WHERE h.tur = 'gider'
    GROUP BY k.id
    ORDER BY toplam DESC
    LIMIT 5
  `).all();

  return {
    toplam_gelir: toplamlar.toplam_gelir,
    toplam_gider: toplamlar.toplam_gider,
    bakiye: toplamlar.toplam_gelir - toplamlar.toplam_gider,
    kategori_bazli: kategoriBazli
  };
}

module.exports = {
  tumHarcamalariGetir,
  harcamaGetir,
  harcamaOlustur,
  harcamaGuncelle,
  harcamaSil,
  ozetGetir
};
