function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    hata: err.message || 'Sunucu hatası oluştu.'
  });
}

function notFound(req, res) {
  res.status(404).json({ hata: 'Endpoint bulunamadı.' });
}

module.exports = { errorHandler, notFound };
