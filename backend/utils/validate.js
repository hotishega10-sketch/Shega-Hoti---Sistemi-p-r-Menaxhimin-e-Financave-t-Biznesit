const AppError = require('./AppError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Mbledh gabimet e fushave dhe i hedh të gjitha bashkë (400) te done().
class Validator {
  constructor(src) {
    this.src = src && typeof src === 'object' ? src : {};
    this.errors = {};
    this.values = {};
  }

  _fail(field, msg) { if (!this.errors[field]) this.errors[field] = msg; }

  _missing(field, required) {
    const v = this.src[field];
    const empty = v === undefined || v === null || v === '';
    if (empty && required) this._fail(field, `Fusha '${field}' është e detyrueshme.`);
    return empty;
  }

  string(field, { min = 1, max = 255, required = true } = {}) {
    if (this._missing(field, required)) return this;
    const v = this.src[field];
    if (typeof v !== 'string') { this._fail(field, `Fusha '${field}' duhet të jetë tekst.`); return this; }
    const t = v.trim();
    if (t.length < min || t.length > max) {
      this._fail(field, `Fusha '${field}' duhet të ketë ${min}-${max} karaktere.`);
      return this;
    }
    this.values[field] = t;
    return this;
  }

  email(field = 'email') {
    if (this._missing(field, true)) return this;
    const v = this.src[field];
    if (typeof v !== 'string' || v.length > 255 || !EMAIL_RE.test(v.trim())) {
      this._fail(field, 'Email-i nuk ka format të vlefshëm.');
      return this;
    }
    this.values[field] = v.trim().toLowerCase();
    return this;
  }

  password(field = 'password') {
    if (this._missing(field, true)) return this;
    const v = this.src[field];
    if (typeof v !== 'string' || v.length < 8) {
      this._fail(field, 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.');
    } else if (Buffer.byteLength(v) > 72) {
      this._fail(field, 'Fjalëkalimi është shumë i gjatë (maksimumi 72 bajt).');
    } else {
      this.values[field] = v;
    }
    return this;
  }

  oneOf(field, list, { required = true } = {}) {
    if (this._missing(field, required)) return this;
    const v = this.src[field];
    if (!list.includes(v)) this._fail(field, `Fusha '${field}' duhet të jetë një nga: ${list.join(', ')}.`);
    else this.values[field] = v;
    return this;
  }

  id(field, { required = true } = {}) {
    if (this._missing(field, required)) return this;
    const v = Number(this.src[field]);
    if (!Number.isInteger(v) || v <= 0) this._fail(field, `Fusha '${field}' duhet të jetë ID e vlefshme.`);
    else this.values[field] = v;
    return this;
  }

  amount(field = 'amount', { required = true } = {}) {
    if (this._missing(field, required)) return this;
    const raw = String(this.src[field]).trim();
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(raw) || Number(raw) <= 0) {
      this._fail(field, 'Shuma duhet të jetë numër pozitiv me maksimum 2 shifra dhjetore.');
    } else {
      this.values[field] = Number(raw);
    }
    return this;
  }

  date(field = 'date', { required = true } = {}) {
    if (this._missing(field, required)) return this;
    const raw = this.src[field];
    let ok = typeof raw === 'string' && DATE_RE.test(raw);
    if (ok) {
      const d = new Date(`${raw}T00:00:00Z`);
      ok = !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === raw;
    }
    if (!ok) this._fail(field, 'Data duhet të jetë në formatin YYYY-MM-DD dhe e vlefshme.');
    else this.values[field] = raw;
    return this;
  }

  done() {
    if (Object.keys(this.errors).length) {
      throw new AppError(400, 'Të dhënat e dërguara nuk janë të vlefshme.', this.errors);
    }
    return this.values;
  }
}

const isValidDate = (s) => new Validator({ d: s }).date('d').errors.d === undefined;

module.exports = { Validator, isValidDate };
