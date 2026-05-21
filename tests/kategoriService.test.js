const path = require('path');
process.env.DB_PATH = path.join(__dirname, '..', 'test.db');

const { getDb, closeDb } = require('../src/database');
const service = require('../src/services/kategoriService');

beforeEach(() => {
  const db = getDb();
  db.exec('DELETE FROM harcamalar; DELETE FROM kategoriler;');
});

afterAll(() => {
  closeDb();
});

describe('kategoriOlustur', () => {
  test('geçerli veriyle kategori oluşturur', () => {
    const k = service.kategoriOlustur({ ad: 'Spor', renk: '#ff6600' });
    expect(k.id).toBeDefined();
    expect(k.ad).toBe('Spor');
    expect(k.renk).toBe('#ff6600');
  });

  test('ad boşsa hata fırlatır', () => {
    expect(() => service.kategoriOlustur({ ad: '' })).toThrow('Kategori adı zorunludur.');
  });

  test('aynı isimde iki kategori oluşturulamaz', () => {
    service.kategoriOlustur({ ad: 'Market' });
    expect(() => service.kategoriOlustur({ ad: 'Market' })).toThrow('Bu isimde bir kategori zaten mevcut.');
  });

  test('geçersiz hex renk hata fırlatır', () => {
    expect(() => service.kategoriOlustur({ ad: 'Test', renk: 'kirmizi' }))
      .toThrow('Renk geçerli bir hex kodu olmalıdır');
  });

  test('renk verilmezse varsayılan renk atanır', () => {
    const k = service.kategoriOlustur({ ad: 'Varsayılan' });
    expect(k.renk).toBe('#6366f1');
  });
});

describe('kategoriGuncelle', () => {
  test('adı günceller', () => {
    const k = service.kategoriOlustur({ ad: 'Eski Ad' });
    const guncellendi = service.kategoriGuncelle(k.id, { ad: 'Yeni Ad' });
    expect(guncellendi.ad).toBe('Yeni Ad');
  });

  test('olmayan id için null döner', () => {
    expect(service.kategoriGuncelle(9999, { ad: 'Test' })).toBeNull();
  });
});

describe('kategoriSil', () => {
  test('mevcut kategoriyi siler', () => {
    const k = service.kategoriOlustur({ ad: 'Silinecek' });
    expect(service.kategoriSil(k.id)).toBe(true);
  });

  test('olmayan id için false döner', () => {
    expect(service.kategoriSil(9999)).toBe(false);
  });
});

describe('tumKategorileriGetir', () => {
  test('tüm kategorileri listeler', () => {
    service.kategoriOlustur({ ad: 'A' });
    service.kategoriOlustur({ ad: 'B' });
    const liste = service.tumKategorileriGetir();
    expect(liste.length).toBe(2);
  });
});
