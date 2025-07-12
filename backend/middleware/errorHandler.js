function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
}

module.exports = { errorHandler };
