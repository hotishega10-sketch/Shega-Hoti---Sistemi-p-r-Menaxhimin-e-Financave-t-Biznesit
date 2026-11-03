const db = require('../config/db');
const AppError = require('../utils/AppError');
const { Validator, isValidDate } = require('../utils/validate');
const { ROLES, TX_TYPES } = require('../config/constants');

const SELECT_TX = `
  SELECT t.id, t.amount, t.type, t.description, t.\`date\`, t.category_id,
         c.name AS category_name, t.user_id, t.created_at
  FROM transactions t JOIN categories c ON c.id = t.category_id`;

// Çdo query është e kufizuar me business_id (izolimi mes bizneseve).
// Punonjësi shikon vetëm transaksionet e veta (user_id).
function scope(req) {
  const where = ['t.business_id = ?'];
  const params = [req.user.business_id];
  if (req.user.role === ROLES.EMPLOYEE) {
    where.push('t.user_id = ?');
    params.push(req.user.id);
  }
  return { where, params };
}

function dateFilters(q, where, params) {
  if (q.from !== undefined) {
    if (!isValidDate(q.from)) throw new AppError(400, "Parametri 'from' duhet të jetë datë YYYY-MM-DD.");
    where.push('t.`date` >= ?'); params.push(q.from);
  }
  if (q.to !== undefined) {
    if (!isValidDate(q.to)) throw new AppError(400, "Parametri 'to' duhet të jetë datë YYYY-MM-DD.");
    where.push('t.`date` <= ?'); params.push(q.to);
  }
}

// Kategoria duhet të jetë e këtij biznesi dhe e të njëjtit tip me transaksionin.
async function assertCategory(categoryId, type, businessId) {
  const [rows] = await db.query('SELECT type FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
  if (rows.length === 0) throw new AppError(400, 'Kategoria nuk ekziston.', { category_id: 'Kategori e pavlefshme.' });
  if (rows[0].type !== type) {
    throw new AppError(400, 'Tipi i kategorisë nuk përputhet me tipin e transaksionit.', {
      category_id: `Kategoria është '${rows[0].type}', transaksioni është '${type}'.`,
    });
  }
}

async function findOne(req, id) {
  const { where, params } = scope(req);
  const [rows] = await db.query(`${SELECT_TX} WHERE ${where.join(' AND ')} AND t.id = ?`, [...params, id]);
  if (rows.length === 0) throw new AppError(404, 'Transaksioni nuk u gjet.');
  return rows[0];
}

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'ID e pavlefshme.');
  return id;
}

exports.list = async (req, res) => {
  const q = req.query;
  const { where, params } = scope(req);

  if (q.type !== undefined) {
    if (!TX_TYPES.includes(q.type)) throw new AppError(400, `Parametri 'type' duhet të jetë: ${TX_TYPES.join(', ')}.`);
    where.push('t.type = ?'); params.push(q.type);
  }
  if (q.category_id !== undefined) {
    where.push('t.category_id = ?'); params.push(parseId(q.category_id));
  }
  dateFilters(q, where, params);

  const page = q.page === undefined ? 1 : Number(q.page);
  const limit = q.limit === undefined ? 20 : Number(q.limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError(400, "Parametrat 'page' (≥1) dhe 'limit' (1-100) duhet të jenë numra të plotë.");
  }

  const w = where.join(' AND ');
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM transactions t WHERE ${w}`, params);
  const [rows] = await db.query(
    `${SELECT_TX} WHERE ${w} ORDER BY t.\`date\` DESC, t.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  res.json({ success: true, data: rows, pagination: { page, limit, total: Number(total) } });
};

exports.summary = async (req, res) => {
  const { where, params } = scope(req);
  dateFilters(req.query, where, params);
  const [rows] = await db.query(
    `SELECT t.type, COALESCE(SUM(t.amount), 0) AS total, COUNT(*) AS count
     FROM transactions t WHERE ${where.join(' AND ')} GROUP BY t.type`,
    params
  );
  const cents = (type) => Math.round(Number((rows.find((r) => r.type === type) || {}).total || 0) * 100);
  const income = cents('income');
  const expense = cents('expense');
  const fmt = (c) => (c / 100).toFixed(2);
  res.json({
    success: true,
    data: { income: fmt(income), expense: fmt(expense), balance: fmt(income - expense) },
  });
};

exports.getOne = async (req, res) => {
  res.json({ success: true, data: await findOne(req, parseId(req.params.id)) });
};

exports.create = async (req, res) => {
  const v = new Validator(req.body)
    .amount()
    .oneOf('type', TX_TYPES)
    .id('category_id')
    .date('date', { required: false })
    .string('description', { max: 1000, required: false })
    .done();

  // Punonjësi regjistron vetëm shpenzime.
  if (req.user.role === ROLES.EMPLOYEE && v.type !== 'expense') {
    throw new AppError(403, 'Punonjësi mund të regjistrojë vetëm shpenzime.');
  }
  await assertCategory(v.category_id, v.type, req.user.business_id);

  const date = v.date || new Date().toISOString().slice(0, 10);
  // business_id dhe user_id vijnë nga token-i, jo nga body.
  const [r] = await db.query(
    `INSERT INTO transactions (business_id, user_id, category_id, amount, type, description, \`date\`)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.business_id, req.user.id, v.category_id, v.amount, v.type, v.description || null, date]
  );
  res.status(201).json({ success: true, data: await findOne(req, r.insertId) });
};

exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const current = await findOne(req, id);

  const v = new Validator(req.body)
    .amount('amount', { required: false })
    .oneOf('type', TX_TYPES, { required: false })
    .id('category_id', { required: false })
    .date('date', { required: false })
    .string('description', { max: 1000, required: false })
    .done();

  if (Object.keys(v).length === 0) throw new AppError(400, 'Nuk u dërgua asnjë fushë për përditësim.');

  await assertCategory(v.category_id ?? current.category_id, v.type ?? current.type, req.user.business_id);

  const sets = Object.keys(v).map((k) => (k === 'date' ? '`date` = ?' : `${k} = ?`));
  await db.query(
    `UPDATE transactions SET ${sets.join(', ')} WHERE id = ? AND business_id = ?`,
    [...Object.values(v), id, req.user.business_id]
  );
  res.json({ success: true, data: await findOne(req, id) });
};

exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  const [r] = await db.query('DELETE FROM transactions WHERE id = ? AND business_id = ?', [id, req.user.business_id]);
  if (r.affectedRows === 0) throw new AppError(404, 'Transaksioni nuk u gjet.');
  res.json({ success: true, message: 'Transaksioni u fshi.' });
};
