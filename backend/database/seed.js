
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { DEFAULT_CATEGORIES } = require('../config/constants');

const PASSWORD = 'Demo1234!';

// [kategoria, tipi, shuma, pershkrimi, data, kush e regjistron]
const TX = [
  ['Shitje', 'income', 1250.0, 'Shitjet e javës 1', '2026-10-05', 'kontabilist'],
  ['Shitje', 'income', 1480.5, 'Shitjet e javës 2', '2026-10-12', 'kontabilist'],
  ['Shërbime', 'income', 320.0, 'Katering për event', '2026-10-14', 'pronar'],
  ['Shitje', 'income', 1390.0, 'Shitjet e javës 3', '2026-10-19', 'kontabilist'],
  ['Qira', 'expense', 600.0, 'Qiraja e tetorit', '2026-10-01', 'pronar'],
  ['Rroga', 'expense', 900.0, 'Rrogat e tetorit', '2026-10-28', 'pronar'],
  ['Furnizime', 'expense', 210.75, 'Kafe dhe qumësht', '2026-10-06', 'punjonjes'],
  ['Furnizime', 'expense', 95.2, 'Pije dhe ujë', '2026-10-13', 'punjonjes'],
  ['Furnizime', 'expense', 130.0, 'Ambalazh njëpërdorimsh', '2026-10-20', 'punjonjes'],
  ['Furnizime', 'expense', 78.4, 'Detergjentë', '2026-10-22', 'kontabilist'],
];

(async () => {
  const [exists] = await db.query('SELECT id FROM users WHERE email = ?', ['pronar@demo.com']);
  if (exists.length) {
    console.log('Të dhënat demo ekzistojnë tashmë. Nuk u shtua asgjë.');
    return db.end();
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(PASSWORD, 10);

    const [biz] = await conn.query('INSERT INTO businesses (name) VALUES (?)', ['Kafe Prizreni']);
    const bid = biz.insertId;

    const uid = {};
    for (const role of ['pronar', 'kontabilist', 'punjonjes']) {
      const [u] = await conn.query(
        'INSERT INTO users (business_id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [bid, `${role}@demo.com`, hash, role]
      );
      uid[role] = u.insertId;
    }

    const cat = {};
    for (const c of DEFAULT_CATEGORIES) {
      const [r] = await conn.query('INSERT INTO categories (business_id, name, type) VALUES (?, ?, ?)', [bid, c.name, c.type]);
      cat[c.name] = r.insertId;
    }

    for (const [catName, type, amount, desc, date, who] of TX) {
      await conn.query(
        'INSERT INTO transactions (business_id, user_id, category_id, amount, type, description, `date`) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bid, uid[who], cat[catName], amount, type, desc, date]
      );
    }

    const clients = [
      ['Hotel Theranda', 'info@theranda.example', '+383 44 111 222'],
      ['Shkolla "Xhevdet Doda"', 'shkolla@example.com', '+383 44 333 444'],
      ['Agjencia Dukagjini', 'office@dukagjini.example', null],
    ];
    const cid = [];
    for (const [name, email, phone] of clients) {
      const [r] = await conn.query('INSERT INTO clients (business_id, name, email, phone) VALUES (?, ?, ?, ?)', [bid, name, email, phone]);
      cid.push(r.insertId);
    }

    const invoices = [
      ['FT-2026-001', cid[0], 'e_paguar', '2026-10-30', [['Katering për 40 persona', 1, 320.0]]],
      ['FT-2026-002', cid[1], 'e_papaguar', '2026-11-20', [['Kafe për konferencë', 30, 2.5], ['Ëmbëlsira', 30, 1.8]]],
      ['FT-2026-003', cid[2], 'e_vonuar', '2026-10-15', [['Furnizim javor', 4, 45.0]]],
    ];
    for (const [num, clientId, status, due, items] of invoices) {
      const total = items.reduce((s, [, q, p]) => s + q * p, 0);
      const [inv] = await conn.query(
        'INSERT INTO invoices (business_id, created_by_user_id, client_id, invoice_number, total, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bid, uid.kontabilist, clientId, num, total.toFixed(2), status, due]
      );
      for (const [desc, q, p] of items) {
        await conn.query(
          'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [inv.insertId, desc, q, p, (q * p).toFixed(2)]
        );
      }
    }

    await conn.commit();
    console.log('U shtuan të dhënat demo.');
    console.log(`Hyrje: pronar@demo.com | kontabilist@demo.com | punjonjes@demo.com   Fjalëkalimi: ${PASSWORD}`);
  } catch (e) {
    await conn.rollback();
    console.error('Seed dështoi:', e.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await db.end();
  }
})();
