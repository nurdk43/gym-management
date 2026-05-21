function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Sunucu hatası';
  res.status(status).json({ message });
}

module.exports = { errorHandler };

