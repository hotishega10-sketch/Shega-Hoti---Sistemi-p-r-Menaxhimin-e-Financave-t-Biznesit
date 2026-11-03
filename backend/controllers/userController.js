const db = require('../config/db');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const { Validator } = require('../utils/validate');
const { ROLES } = require('../config/constants');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

exports.list = async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, email, role, created_at FROM users WHERE business_id = ? ORDER BY id',
    [req.user.business_id]
  );
  res.json({ success: true, data: rows });
};

exports.create = async (req, res) => {
  const { email, password, role } = new Validator(req.body)
    .email()
    .password()
    .oneOf('role', [ROLES.ACCOUNTANT, ROLES.EMPLOYEE])
    .done();

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new AppError(409, 'Ky email është i regjistruar tashmë!');

  const hash = await bcrypt.hash(password, ROUNDS);
  const [r] = await db.query(
    'INSERT INTO users (business_id, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [req.user.business_id, email, hash, role]
  );
  res.status(201).json({
    success: true,
    message: 'Përdoruesi u krijua me sukses!',
    user: { id: r.insertId, email, role, business_id: req.user.business_id },
  });
};
