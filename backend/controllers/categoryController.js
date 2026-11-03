const db = require('../config/db');
const AppError = require('../utils/AppError');
const { Validator } = require('../utils/validate');
const { TX_TYPES } = require('../config/constants');

exports.list = async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, name, type FROM categories WHERE business_id = ? ORDER BY type, name',
    [req.user.business_id]
  );
  res.json({ success: true, data: rows });
};

exports.create = async (req, res) => {
  const { name, type } = new Validator(req.body)
    .string('name', { max: 100 })
    .oneOf('type', TX_TYPES)
    .done();

  const [dup] = await db.query(
    'SELECT id FROM categories WHERE business_id = ? AND name = ? AND type = ?',
    [req.user.business_id, name, type]
  );
  if (dup.length > 0) throw new AppError(409, 'Kjo kategori ekziston tashmë.');

  const [r] = await db.query('INSERT INTO categories (business_id, name, type) VALUES (?, ?, ?)', [
    req.user.business_id, name, type,
  ]);
  res.status(201).json({ success: true, data: { id: r.insertId, name, type } });
};
