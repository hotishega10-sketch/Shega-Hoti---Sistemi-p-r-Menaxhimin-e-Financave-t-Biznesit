export const money = (v) =>
  new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR' }).format(Number(v || 0));

export const todayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const MONTHS = ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gus', 'Sht', 'Tet', 'Nën', 'Dhj'];
export const monthLabel = (ym) => MONTHS[Number(ym.slice(5, 7)) - 1];

export const STATUS_LABELS = { e_papaguar: 'E papaguar', e_paguar: 'E paguar', e_vonuar: 'E vonuar' };
export const ROLE_LABELS = { pronar: 'Pronar', kontabilist: 'Kontabilist', punjonjes: 'Punonjës' };
