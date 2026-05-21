const express = require('express');
const router = express.Router();
const service = require('../services/kategoriService');

router.get('/', (req, res, next) => {
  try {
    res.json(service.tumKategorileriGetir());
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const kategori = service.kategoriGetir(Number(req.params.id));
    if (!kategori) return res.status(404).json({ hata: 'Kategori bulunamadı.' });
    res.json(kategori);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const yeni = service.kategoriOlustur(req.body);
    res.status(201).json(yeni);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const guncellendi = service.kategoriGuncelle(Number(req.params.id), req.body);
    if (!guncellendi) return res.status(404).json({ hata: 'Kategori bulunamadı.' });
    res.json(guncellendi);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const silindi = service.kategoriSil(Number(req.params.id));
    if (!silindi) return res.status(404).json({ hata: 'Kategori bulunamadı.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
