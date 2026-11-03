const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Autentikimi: kush je ti? (401 nëse token-i mungon ose nuk vlen)
const verifyToken = async (req, res, next) => {
  const [scheme, token] = (req.headers['authorization'] || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Qasja u refuzua! Mungon token-i.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token jo i vlefshëm ose ka skaduar!' });
  }

  // Roli dhe biznesi merren nga databaza, jo nga token-i: nëse pronari ia ndërron
  // rolin dikujt ose e fshin, ndryshimi vlen menjëherë.
  const [rows] = await db.query('SELECT id, business_id, role FROM users WHERE id = ?', [decoded.id]);
  if (rows.length === 0) {
    return res.status(401).json({ success: false, message: 'Përdoruesi nuk ekziston më.' });
  }

  req.user = rows[0];
  next();
};

// Autorizimi: ke leje ti për këtë veprim? (403 nëse jo)
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Nuk keni autorizim për të kryer këtë veprim!',
      });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
