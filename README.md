# Param — Harcama Takip Uygulaması

Kişisel gelir ve gider takibi için geliştirilmiş full-stack bir web uygulaması.

## Özellikler

- Gelir/gider ekleme, düzenleme ve silme (tam CRUD)
- Kategorilere göre sınıflandırma (renk desteğiyle)
- Başlık/açıklama araması, tür/kategori/tarih filtreleme
- Finansal özet: toplam gelir, toplam gider, net bakiye
- Kategori bazlı harcama grafiği
- Swagger UI ile interaktif API dokümantasyonu

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | Vanilla JavaScript (SPA), HTML5, CSS3 |
| Backend | Node.js, Express |
| Veritabanı | SQLite (better-sqlite3) |
| API Docs | Swagger UI / OpenAPI 3.0 |
| Test | Jest |

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- npm

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Uygulamayı başlat
npm start

# 3. Tarayıcıda aç
# http://localhost:3000
```

### Geliştirme modu (otomatik yenileme)
```bash
npm run dev
```

## API Dokümantasyonu

Uygulama çalışırken Swagger UI'ye şuradan ulaşabilirsiniz:

```
http://localhost:3000/api-docs
```

## API Endpoints

### Harcamalar

| Yöntem | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/harcamalar` | Tüm harcamaları listele (filtreleme destekler) |
| GET | `/api/harcamalar/ozet` | Finansal özet |
| GET | `/api/harcamalar/:id` | Tek harcama |
| POST | `/api/harcamalar` | Yeni harcama ekle |
| PUT | `/api/harcamalar/:id` | Harcama güncelle |
| DELETE | `/api/harcamalar/:id` | Harcama sil |

### Kategoriler

| Yöntem | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/kategoriler` | Tüm kategoriler |
| GET | `/api/kategoriler/:id` | Tek kategori |
| POST | `/api/kategoriler` | Yeni kategori |
| PUT | `/api/kategoriler/:id` | Kategori güncelle |
| DELETE | `/api/kategoriler/:id` | Kategori sil |

### Filtreleme (GET /api/harcamalar)

| Parametre | Tip | Açıklama |
|---|---|---|
| `tur` | `gider` \| `gelir` | Türe göre filtrele |
| `kategori_id` | integer | Kategoriye göre filtrele |
| `baslangic` | YYYY-MM-DD | Başlangıç tarihi |
| `bitis` | YYYY-MM-DD | Bitiş tarihi |
| `arama` | string | Başlık/açıklamada arama |

## Testler

```bash
# Tüm testleri çalıştır
npm test

# Coverage raporu ile
npm test -- --coverage
```

Testler `tests/` klasöründe yer alır ve business logic'i (servis katmanı) kapsar.

## Proje Yapısı

```
harcama-takip/
├── src/
│   ├── app.js              # Express uygulama girişi
│   ├── database.js         # SQLite bağlantısı ve şema
│   ├── routes/
│   │   ├── harcamalar.js   # Harcama route'ları
│   │   └── kategoriler.js  # Kategori route'ları
│   ├── services/
│   │   ├── harcamaService.js   # Harcama iş mantığı
│   │   └── kategoriService.js  # Kategori iş mantığı
│   └── middleware/
│       └── errorHandler.js # Hata yönetimi
├── public/
│   ├── index.html          # SPA ana sayfa
│   ├── css/style.css       # Stiller
│   └── js/
│       ├── api.js          # API yardımcısı
│       ├── ui.js           # UI yardımcıları
│       └── app.js          # Uygulama mantığı
├── tests/
│   ├── harcamaService.test.js
│   └── kategoriService.test.js
├── swagger.yaml            # OpenAPI 3.0 spec
├── jest.config.json
└── package.json
```

## Mimari Kararlar

- **Servis katmanı**: İş mantığı route'lardan ayrıdır; bu sayede birim testleri mümkündür.
- **SQLite**: Kurulum gerektirmeyen, dosya tabanlı veritabanı.
- **Vanilla JS SPA**: Tek sayfalı uygulama, `fetch` API ile asenkron güncelleme.
- **Doğrulama**: Hem frontend (kullanıcı deneyimi) hem backend (güvenlik) tarafında yapılır.
