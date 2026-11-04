const db = require('../config/db');
const { ROLES } = require('../config/constants');

//qe te mos ket gabime me presjet
const pad = (n) => String(n).padStart(2, '0');
const fmt = (c) => (c / 100).toFixed(2);
const cents = (v) => Math.round(Number(v || 0) * 100);

//nese je punonjes shton kushin user_id = ?, numrat dalin nga transaksionet tuaja
exports.get = async (req, res) => {
  const isEmployee = req.user.role === ROLES.EMPLOYEE;
  const base = ['t.business_id = ?'];
  const baseParams = [req.user.business_id];
  if (isEmployee) { base.push('t.user_id = ?'); baseParams.push(req.user.id); }
  const W = base.join(' AND ');

  //nderton listen e 6 muajve te fundit
  const now = new Date();
  const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const thisMonth = monthKey(now);
  const first = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const months = [];
  for (let i = 0; i < 6; i++) months.push(monthKey(new Date(first.getFullYear(), first.getMonth() + i, 1)));

  //merr nga databaza shumen e te hyrave dhe shpenzimeve per qdo muaj
  const [series] = await db.query(
    `SELECT SUBSTR(t.\`date\`, 1, 7) AS month, t.type, SUM(t.amount) AS total
     FROM transactions t WHERE ${W} AND t.\`date\` >= ? GROUP BY SUBSTR(t.\`date\`, 1, 7), t.type`,
    [...baseParams, `${months[0]}-01`]
  );
  //ploteson edhe muaj pa transaksione me 0.00
  const monthly = months.map((m) => ({
    month: m,
    income: fmt(cents((series.find((r) => r.month === m && r.type === 'income') || {}).total)),
    expense: fmt(cents((series.find((r) => r.month === m && r.type === 'expense') || {}).total)),
  }));
  const cur = monthly[monthly.length - 1];
  //numrat e muajit aktual
  const month = { month: thisMonth, income: cur.income, expense: cur.expense, balance: fmt(cents(cur.income) - cents(cur.expense)) };
  //numrat e te gjitha kohrave
  const [totals] = await db.query(`SELECT t.type, SUM(t.amount) AS total FROM transactions t WHERE ${W} GROUP BY t.type`, baseParams);
  const inc = cents((totals.find((r) => r.type === 'income') || {}).total);
  const exp = cents((totals.find((r) => r.type === 'expense') || {}).total);

  //jep shpenzimet e ketij muaji te grupuara sipas kategorise
  const [byCat] = await db.query(
    `SELECT c.name, SUM(t.amount) AS total FROM transactions t JOIN categories c ON c.id = t.category_id
     WHERE ${W} AND t.type = 'expense' AND t.\`date\` >= ? GROUP BY c.name ORDER BY total DESC`,
    [...baseParams, `${thisMonth}-01`]
  );

  //5 transaksionet e fundit
  const [recent] = await db.query(
    `SELECT t.id, t.amount, t.type, t.description, t.\`date\`, c.name AS category_name
     FROM transactions t JOIN categories c ON c.id = t.category_id WHERE ${W}
     ORDER BY t.\`date\` DESC, t.id DESC LIMIT 5`,
    baseParams
  );

    //per pronarin dhe kontabilistin numeron faturat e papaguara te vonuara dhe te paguara me totalet, punjonesi merr null sepse nuk i shikon faturat
  let invoices = null;
  if (!isEmployee) {
    const today = `${thisMonth}-${pad(now.getDate())}`;
    const [rows] = await db.query(
      `SELECT status, due_date, total FROM invoices WHERE business_id = ?`, [req.user.business_id]
    );
    let unpaid = 0, overdue = 0, paid = 0, overdueCount = 0, unpaidCount = 0;
    for (const r of rows) {
      const c = cents(r.total);
      if (r.status === 'e_paguar') paid += c;
      else if (r.due_date < today) { overdue += c; overdueCount++; }
      else { unpaid += c; unpaidCount++; }
    }
    invoices = {
      unpaid_total: fmt(unpaid), unpaid_count: unpaidCount,
      overdue_total: fmt(overdue), overdue_count: overdueCount,
      paid_total: fmt(paid),
    };
  }

  res.json({
    success: true,
    data: {
      month,
      all_time: { income: fmt(inc), expense: fmt(exp), balance: fmt(inc - exp) },
      monthly,
      expenses_by_category: byCat.map((r) => ({ name: r.name, total: fmt(cents(r.total)) })),
      recent,
      invoices,
    },
  });
};