const path = require('path');
process.env.DB_PATH = path.join(__dirname, '..', 'test.db');

const { getDb, closeDb } = require('../src/database');
const service = require('../src/services/harcamaService');

beforeEach(() => {
  const db = getDb();
  db.exec('DELETE FROM harcamalar; DELETE FROM kategoriler;');
  db.prepare('INSERT INTO kategoriler (id, ad, renk) VALUES (1, "Test Kategori", "#ff0000")').run();
});

afterAll(() => {
  closeDb();
  const fs = require('fs');
  const dbPath = path.join(__dirname, '..', 'test.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

describe('harcamaOlustur', () => {
  test('geçerli veriyle harcama oluşturur', () => {
    const h = service.harcamaOlustur({ baslik: 'Market', miktar: 100, tur: 'gider' });
    expect(h.id).toBeDefined();
    expect(h.baslik).toBe('Market');
    expect(h.miktar).toBe(100);
    expect(h.tur).toBe('gider');
  });

  test('başlık boşsa hata fırlatır', () => {
    expect(() => service.harcamaOlustur({ baslik: '', miktar: 50, tur: 'gider' }))
      .toThrow('Başlık zorunludur.');
  });

  test('miktar negatifse hata fırlatır', () => {
    expect(() => service.harcamaOlustur({ baslik: 'Test', miktar: -10, tur: 'gider' }))
      .toThrow('Miktar pozitif bir sayı olmalıdır.');
  });

  test('miktar sıfırsa hata fırlatır', () => {
    expect(() => service.harcamaOlustur({ baslik: 'Test', miktar: 0, tur: 'gider' }))
      .toThrow('Miktar pozitif bir sayı olmalıdır.');
  });

  test('geçersiz tür hata fırlatır', () => {
    expect(() => service.harcamaOlustur({ baslik: 'Test', miktar: 50, tur: 'yanlis' }))
      .toThrow('Tür "gider" veya "gelir" olmalıdır.');
  });

  test('kategori_id ile harcama oluşturur', () => {
    const h = service.harcamaOlustur({ baslik: 'Market', miktar: 200, tur: 'gider', kategori_id: 1 });
    expect(h.kategori_id).toBe(1);
    expect(h.kategori_ad).toBe('Test Kategori');
  });

  test('gelir türünde harcama oluşturur', () => {
    const h = service.harcamaOlustur({ baslik: 'Maaş', miktar: 5000, tur: 'gelir' });
    expect(h.tur).toBe('gelir');
  });
});

describe('harcamaGetir', () => {
  test('mevcut harcamayı getirir', () => {
    const olusturulan = service.harcamaOlustur({ baslik: 'Test', miktar: 50, tur: 'gider' });
    const bulunan = service.harcamaGetir(olusturulan.id);
    expect(bulunan).not.toBeNull();
    expect(bulunan.baslik).toBe('Test');
  });

  test('olmayan id için undefined döner', () => {
    const sonuc = service.harcamaGetir(9999);
    expect(sonuc).toBeUndefined();
  });
});

describe('harcamaGuncelle', () => {
  test('başlığı günceller', () => {
    const h = service.harcamaOlustur({ baslik: 'Eski', miktar: 100, tur: 'gider' });
    const guncellendi = service.harcamaGuncelle(h.id, { baslik: 'Yeni' });
    expect(guncellendi.baslik).toBe('Yeni');
    expect(guncellendi.miktar).toBe(100);
  });

  test('olmayan id için null döner', () => {
    const sonuc = service.harcamaGuncelle(9999, { baslik: 'Test' });
    expect(sonuc).toBeNull();
  });

  test('geçersiz miktar güncellemede hata fırlatır', () => {
    const h = service.harcamaOlustur({ baslik: 'Test', miktar: 100, tur: 'gider' });
    expect(() => service.harcamaGuncelle(h.id, { miktar: -5 }))
      .toThrow('Miktar pozitif bir sayı olmalıdır.');
  });
});

describe('harcamaSil', () => {
  test('mevcut harcamayı siler ve true döner', () => {
    const h = service.harcamaOlustur({ baslik: 'Silinecek', miktar: 50, tur: 'gider' });
    expect(service.harcamaSil(h.id)).toBe(true);
    expect(service.harcamaGetir(h.id)).toBeUndefined();
  });

  test('olmayan id için false döner', () => {
    expect(service.harcamaSil(9999)).toBe(false);
  });
});

describe('tumHarcamalariGetir', () => {
  beforeEach(() => {
    service.harcamaOlustur({ baslik: 'Market', miktar: 100, tur: 'gider', kategori_id: 1, tarih: '2026-05-01' });
    service.harcamaOlustur({ baslik: 'Maaş', miktar: 5000, tur: 'gelir', tarih: '2026-05-01' });
    service.harcamaOlustur({ baslik: 'Kira', miktar: 3000, tur: 'gider', tarih: '2026-05-10' });
  });

  test('tüm harcamaları getirir', () => {
    const liste = service.tumHarcamalariGetir();
    expect(liste.length).toBe(3);
  });

  test('türe göre filtreler', () => {
    const giderler = service.tumHarcamalariGetir({ tur: 'gider' });
    expect(giderler.every(h => h.tur === 'gider')).toBe(true);
  });

  test('kategoriye göre filtreler', () => {
    const sonuc = service.tumHarcamalariGetir({ kategori_id: 1 });
    expect(sonuc.every(h => h.kategori_id === 1)).toBe(true);
  });

  test('başlıkta arama yapar', () => {
    const sonuc = service.tumHarcamalariGetir({ arama: 'market' });
    expect(sonuc.length).toBe(1);
    expect(sonuc[0].baslik).toBe('Market');
  });

  test('tarih aralığına göre filtreler', () => {
    const sonuc = service.tumHarcamalariGetir({ baslangic: '2026-05-05', bitis: '2026-05-31' });
    expect(sonuc.length).toBe(1);
    expect(sonuc[0].baslik).toBe('Kira');
  });
});

describe('ozetGetir', () => {
  test('doğru bakiye hesaplar', () => {
    service.harcamaOlustur({ baslik: 'Maaş', miktar: 5000, tur: 'gelir' });
    service.harcamaOlustur({ baslik: 'Market', miktar: 500, tur: 'gider' });
    const ozet = service.ozetGetir();
    expect(ozet.toplam_gelir).toBe(5000);
    expect(ozet.toplam_gider).toBe(500);
    expect(ozet.bakiye).toBe(4500);
  });

  test('boş veritabanında sıfır döner', () => {
    const ozet = service.ozetGetir();
    expect(ozet.bakiye).toBe(0);
  });
});
