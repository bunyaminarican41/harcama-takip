const express = require('express');
const router = express.Router();
const service = require('../services/harcamaService');

router.get('/', (req, res, next) => {
  try {
    const harcamalar = service.tumHarcamalariGetir(req.query);
    res.json(harcamalar);
  } catch (err) {
    next(err);
  }
});

router.get('/ozet', (req, res, next) => {
  try {
    res.json(service.ozetGetir());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const harcama = service.harcamaGetir(Number(req.params.id));
    if (!harcama) return res.status(404).json({ hata: 'Harcama bulunamadı.' });
    res.json(harcama);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { baslik, miktar, tur, kategori_id, aciklama, tarih } = req.body;
    const yeni = service.harcamaOlustur({ baslik, miktar: Number(miktar), tur, kategori_id, aciklama, tarih });
    res.status(201).json(yeni);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const { baslik, miktar, tur, kategori_id, aciklama, tarih } = req.body;
    const guncellendi = service.harcamaGuncelle(Number(req.params.id), {
      baslik,
      miktar: miktar !== undefined ? Number(miktar) : undefined,
      tur,
      kategori_id,
      aciklama,
      tarih
    });
    if (!guncellendi) return res.status(404).json({ hata: 'Harcama bulunamadı.' });
    res.json(guncellendi);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const silindi = service.harcamaSil(Number(req.params.id));
    if (!silindi) return res.status(404).json({ hata: 'Harcama bulunamadı.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
