import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import { Field, FormError } from '../components/ui';
import { validateEmail, validatePassword, required } from '../utils/validate';
import { WELCOME_QUOTES, pick } from '../utils/quotes';

export default function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ business_name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const [welcome] = useState(() => pick(WELCOME_QUOTES));

  async function submit(e) {
    e.preventDefault();
    const errs = {
      business_name: required(form.business_name, 'Emri i biznesit'),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true); setFormError('');
    try {
      await authService.register(form.business_name.trim(), form.email.trim(), form.password);
      await login(form.email.trim(), form.password); // pas regjistrimit hyn automatikisht
    } catch (err) {
      setFormError(err.message);
      if (err.details) setErrors(err.details);
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit} noValidate>
        <blockquote className="quote welcome">{welcome}</blockquote>
        <h1>Regjistro biznesin</h1>
        <p className="muted">Do të bëhesh pronar i biznesit të ri.</p>
        <FormError error={formError} />
        <Field label="Emri i biznesit" error={errors.business_name}>
          <input value={form.business_name} onChange={set('business_name')} autoFocus />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="username" />
        </Field>
        <Field label="Fjalëkalimi (min. 8 karaktere)" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <button className="btn primary" disabled={busy}>{busy ? 'Duke regjistruar...' : 'Regjistrohu'}</button>
        <p className="muted center">Ke llogari? <Link to="/hyrja">Hyr</Link></p>
      </form>
    </div>
  );
}
