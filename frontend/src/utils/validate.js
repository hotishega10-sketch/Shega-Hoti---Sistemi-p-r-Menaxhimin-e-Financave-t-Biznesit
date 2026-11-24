// Validimi në frontend jep përgjigje të shpejtë; backend-i vlidon prapë (nuk i besohet kurrë klientit).
export function validateAmount(v) {
  const raw = String(v).trim().replace(',', '.');
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(raw) || Number(raw) <= 0) {
    return 'Shuma duhet të jetë numër pozitiv me maksimum 2 shifra dhjetore.';
  }
  return null;
}
export const validateDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? null : 'Zgjidh një datë.');
export const validateEmail = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Email-i nuk ka format të vlefshëm.');
export const validatePassword = (v) => (v.length >= 8 ? null : 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.');
export const required = (v, label = 'Fusha') => (String(v).trim() ? null : `${label} është e detyrueshme.`);
