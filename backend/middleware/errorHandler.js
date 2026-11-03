const AppError = require('../utils/AppError');

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Rruga ${req.method} ${req.originalUrl} nuk ekziston.` });
};

// Format i njëjtë gabimi për të gjithë API-n: { success:false, message, details? }
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    const body = { success: false, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON-i i dërguar është i pavlefshëm.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Kërkesa është shumë e madhe.' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Ky rekord ekziston tashmë.' });
  }
  console.error(err); // detajet mbeten në server, klientit nuk i dalin
  res.status(500).json({ success: false, message: 'Gabim në server!' });
};

module.exports = { notFound, errorHandler };
