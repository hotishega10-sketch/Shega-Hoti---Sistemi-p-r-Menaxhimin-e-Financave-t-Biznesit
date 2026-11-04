const db = require('../config/db');
const AppError = require('../utils/AppError');
const { Validator } = require('../utils/validate');

//kontrollohet qe idja eshte numer pozitiv
function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'ID e pavlefshme.');
  return id;
}

//gjen klient me id brenda biznesit te perdoruesit
async function findOne(businessId, id) {
  const [rows] = await db.query(
    'SELECT id, name, email, phone, created_at FROM clients WHERE id = ? AND business_id = ?',
    [id, businessId]
  );
  if (rows.length === 0) throw new AppError(404, 'Klienti nuk u gjet.');
  return rows[0];
}

//validon te dhenat, emri i detyrueshem, te tjerat opsionale
function fields(body) {
  return new Validator(body)
    .string('name', { max: 255 })
    .string('email', { max: 255, required: false })
    .string('phone', { max: 50, required: false })
    .done();
}

//kthen listen e klienteve te biznesit te renditur sipas emrit
exports.list = async (req, res) => {
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const params = [req.user.business_id];
  let sql = 'SELECT id, name, email, phone, created_at FROM clients WHERE business_id = ?';
  if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY name';
  const [rows] = await db.query(sql, params);
  res.json({ success: true, data: rows });
};

//kthen nje klient
exports.getOne = async (req, res) => {
  res.json({ success: true, data: await findOne(req.user.business_id, parseId(req.params.id)) });
};

//fut nje klient te ri, merr business_id nga req.user nga serveri, ndersa emrin, email edhe tel nga forma
exports.create = async (req, res) => {
  const v = fields(req.body);
  const [r] = await db.query(
    'INSERT INTO clients (business_id, name, email, phone) VALUES (?, ?, ?, ?)',
    [req.user.business_id, v.name, v.email ?? null, v.phone ?? null]
  );
  res.status(201).json({ success: true, data: await findOne(req.user.business_id, r.insertId) });
};

//ndryshon klientin, kontrollon qe ekziston dhe qe eshte i biznesit
exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  await findOne(req.user.business_id, id);
  const v = fields(req.body);
  await db.query(
    'UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ? AND business_id = ?',
    [v.name, v.email ?? null, v.phone ?? null, id, req.user.business_id]
  );
  res.json({ success: true, data: await findOne(req.user.business_id, id) });
};

//fshin klientin, por nese ka fatura te lidhura kthen error
exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  await findOne(req.user.business_id, id);
  const [inv] = await db.query('SELECT id FROM invoices WHERE client_id = ? AND business_id = ? LIMIT 1', [id, req.user.business_id]);
  if (inv.length > 0) throw new AppError(409, 'Klienti ka fatura dhe nuk mund të fshihet.');
  await db.query('DELETE FROM clients WHERE id = ? AND business_id = ?', [id, req.user.business_id]);
  res.json({ success: true, message: 'Klienti u fshi.' });
};