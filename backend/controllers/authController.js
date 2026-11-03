const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { Validator } = require('../utils/validate');
const { ROLES, DEFAULT_CATEGORIES } = require('../config/constants');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
// Hash i rremë: login me email që nuk ekziston zgjat po aq sa me email ekzistues.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', ROUNDS);

// Regjistrimi i pavarur krijon GJITHMONË biznes të ri dhe pronarin e tij.
// Kontabilistët dhe punonjësit i krijon pronari (POST /api/users).
exports.register = async (req, res) => {
  const { business_name, email, password } = new Validator(req.body)
    .string('business_name', { min: 2, max: 255 })
    .email()
    .password()
    .done();

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new AppError(409, 'Ky email është i regjistruar tashmë!');

  const hash = await bcrypt.hash(password, ROUNDS);

  // Transaksion: ose krijohet gjithçka (biznes + pronar + kategori), ose asgjë.
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [biz] = await conn.query('INSERT INTO businesses (name) VALUES (?)', [business_name]);
    const [usr] = await conn.query(
      'INSERT INTO users (business_id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [biz.insertId, email, hash, ROLES.OWNER]
    );
    for (const c of DEFAULT_CATEGORIES) {
      await conn.query('INSERT INTO categories (business_id, name, type) VALUES (?, ?, ?)', [biz.insertId, c.name, c.type]);
    }
    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Përdoruesi u regjistrua me sukses!',
      user: { id: usr.insertId, email, role: ROLES.OWNER, business_id: biz.insertId },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new AppError(400, 'Plotësoni email-in dhe fjalëkalimin!');
  }

  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  const user = users[0];

  const isMatch = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !isMatch) throw new AppError(401, 'Kredencialet janë të pasakta!');

  const token = jwt.sign(
    { id: user.id, business_id: user.business_id, role: user.role },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    success: true,
    message: 'Kyçja u krye me sukses!',
    token,
    user: { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
  });
};

exports.me = async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.role, u.business_id, b.name AS business_name
     FROM users u JOIN businesses b ON b.id = u.business_id WHERE u.id = ?`,
    [req.user.id]
  );
  res.json({ success: true, user: rows[0] });
};
