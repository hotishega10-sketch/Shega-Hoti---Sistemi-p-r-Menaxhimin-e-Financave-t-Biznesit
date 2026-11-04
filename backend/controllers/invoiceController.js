const db = require('../config/db');
const AppError = require('../utils/AppError');
const { Validator } = require('../utils/validate');

//3 statuset e lejuara te fatures
const STATUSES = ['e_papaguar', 'e_paguar', 'e_vonuar'];

//kthen daten e sotme ne menyre qe mi dit a e ka kaluar afatin ndonje fature
const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// Statusi 'e_vonuar' llogaritet ne lexim: e papaguar me afat te kaluar.
const SELECT_INV = `
  SELECT i.id, i.invoice_number, i.total, i.due_date, i.paid_at, i.created_at, i.client_id,
         c.name AS client_name,
         CASE WHEN i.status = 'e_papaguar' AND i.due_date < ? THEN 'e_vonuar' ELSE i.status END AS status
  FROM invoices i JOIN clients c ON c.id = i.client_id`;

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'ID e pavlefshme.');
  return id;
}

async function findOne(businessId, id) {
  const [rows] = await db.query(`${SELECT_INV} WHERE i.id = ? AND i.business_id = ?`, [today(), id, businessId]);
  if (rows.length === 0) throw new AppError(404, 'Fatura nuk u gjet.');
  const [items] = await db.query(
    'SELECT id, description, quantity, unit_price, total_price FROM invoice_items WHERE invoice_id = ? ORDER BY id',
    [id]
  );
  return { ...rows[0], items };
}

//kthen faturat e biznesit, mund ti filtrosh sipas status apo client_id
exports.list = async (req, res) => {
  const where = ['i.business_id = ?'];
  const params = [today(), req.user.business_id];
  if (req.query.status !== undefined) {
    if (!STATUSES.includes(req.query.status)) throw new AppError(400, `Parametri 'status' duhet të jetë: ${STATUSES.join(', ')}.`);
    const st = req.query.status;
    if (st === 'e_vonuar') { where.push("i.status = 'e_papaguar' AND i.due_date < ?"); params.push(today()); }
    else if (st === 'e_papaguar') { where.push("i.status = 'e_papaguar' AND i.due_date >= ?"); params.push(today()); }
    else where.push("i.status = 'e_paguar'");
  }
  if (req.query.client_id !== undefined) { where.push('i.client_id = ?'); params.push(parseId(req.query.client_id)); }
  const [rows] = await db.query(`${SELECT_INV} WHERE ${where.join(' AND ')} ORDER BY i.due_date DESC, i.id DESC`, params);
  res.json({ success: true, data: rows });
};

kthen nje fature me artikujt
exports.getOne = async (req, res) => {
  res.json({ success: true, data: await findOne(req.user.business_id, parseId(req.params.id)) });
};


exports.create = async (req, res) => {
    //validon klientin dhe afatin
  const v = new Validator(req.body) 
    .id('client_id')
    .date('due_date')
    .string('invoice_number', { max: 50, required: false })
    .done();

    //kontrollon artikujt
  const rawItems = req.body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
    throw new AppError(400, 'Fatura duhet të ketë 1 deri në 50 artikuj.', { items: 'Lista e artikujve është e detyrueshme.' });
  }
  const items = rawItems.map((it, idx) => {
    const iv = new Validator(it).string('description', { max: 255 }).amount('unit_price');
    const qty = Number(it && it.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100000) iv._fail('quantity', 'Sasia duhet të jetë numër i plotë 1-100000.');
    if (Object.keys(iv.errors).length) {
      throw new AppError(400, `Artikulli ${idx + 1} nuk është i vlefshëm.`, { [`items[${idx}]`]: iv.errors });
    }
    //kthen qmimin ne cent qe te mos ket gabime
    const unitCents = Math.round(iv.values.unit_price * 100);
    return { description: iv.values.description, quantity: qty, unitCents, totalCents: unitCents * qty };
  });
  const totalCents = items.reduce((s, i) => s + i.totalCents, 0);
  if (totalCents > 9999999999) throw new AppError(400, 'Totali i faturës është shumë i madh.');

  //kontrollon qe klienti eshte i biznesit tend
  const [client] = await db.query('SELECT id FROM clients WHERE id = ? AND business_id = ?', [v.client_id, req.user.business_id]);
  if (client.length === 0) throw new AppError(400, 'Klienti nuk ekziston.', { client_id: 'Klient i pavlefshëm.' });

  //nese nuk jepet numri i fatures e krijon vet dhe sigurohet qe nuk ekziston
  let number = v.invoice_number;
  if (!number) {
    const [[{ n }]] = await db.query('SELECT COUNT(*) AS n FROM invoices WHERE business_id = ?', [req.user.business_id]);
    number = `FT-${new Date().getFullYear()}-${String(Number(n) + 1).padStart(3, '0')}`;
  }
  const [dup] = await db.query('SELECT id FROM invoices WHERE business_id = ? AND invoice_number = ?', [req.user.business_id, number]);
  if (dup.length > 0) throw new AppError(409, 'Ky numër fature ekziston tashmë.');

  //ruan faturen dhe artikujt ne nje transaksion, ose ruhen te gjitha ose asnje ne rast deshtimi kthehen mbrapsht qe te mos mbetet fature pa artikuj
  const conn = await db.getConnection();
  let invoiceId;
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      "INSERT INTO invoices (business_id, created_by_user_id, client_id, invoice_number, total, status, due_date) VALUES (?, ?, ?, ?, ?, 'e_papaguar', ?)",
      [req.user.business_id, req.user.id, v.client_id, number, (totalCents / 100).toFixed(2), v.due_date]
    );
    invoiceId = r.insertId;
    for (const it of items) {
      await conn.query(
        'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [invoiceId, it.description, it.quantity, (it.unitCents / 100).toFixed(2), (it.totalCents / 100).toFixed(2)]
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  res.status(201).json({ success: true, data: await findOne(req.user.business_id, invoiceId) });
};

//e shenon faturen si te paguar dhe ruan kohen e pageses
exports.markPaid = async (req, res) => {
  const id = parseId(req.params.id);
  const inv = await findOne(req.user.business_id, id);
  if (inv.status === 'e_paguar') throw new AppError(409, 'Fatura është e paguar tashmë.');
  await db.query(
    "UPDATE invoices SET status = 'e_paguar', paid_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?",
    [id, req.user.business_id]
  );
  res.json({ success: true, data: await findOne(req.user.business_id, id) });
};

//fshin artikujt e fatures dhe me pas faturen vet
exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  await findOne(req.user.business_id, id);
  await db.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
  await db.query('DELETE FROM invoices WHERE id = ? AND business_id = ?', [id, req.user.business_id]);
  res.json({ success: true, message: 'Fatura u fshi.' });
};