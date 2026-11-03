const ROLES = { OWNER: 'pronar', ACCOUNTANT: 'kontabilist', EMPLOYEE: 'punjonjes' };
const TX_TYPES = ['income', 'expense'];

// Kategoritë që merr çdo biznes i ri në regjistrim.
const DEFAULT_CATEGORIES = [
  { name: 'Shitje', type: 'income' },
  { name: 'Shërbime', type: 'income' },
  { name: 'Qira', type: 'expense' },
  { name: 'Rroga', type: 'expense' },
  { name: 'Furnizime', type: 'expense' },
];

module.exports = { ROLES, TX_TYPES, DEFAULT_CATEGORIES };
