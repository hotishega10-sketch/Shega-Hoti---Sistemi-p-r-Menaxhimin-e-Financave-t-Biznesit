import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Field, FormError } from '../components/ui';
import { validateEmail, required } from '../utils/validate';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Rrjedha: forma → validim lokal → POST /auth/login → token → /auth/me → ridrejtim
  async function submit(e) {
    e.preventDefault();
    const errs = { email: validateEmail(form.email), password: required(form.password, 'Fjalëkalimi') };
    setErrors(errs);
    if (errs.email || errs.password) return;
    setBusy(true); setFormError('');
    try { await login(form.email.trim(), form.password); }
    catch (err) { setFormError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit} noValidate>
        <h1>Hyr në Financa</h1>
        <p className="muted">Menaxho të hyrat, shpenzimet dhe faturat e biznesit.</p>
        <FormError error={formError} />
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="username" autoFocus />
        </Field>
        <Field label="Fjalëkalimi" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
        </Field>
        <button className="btn primary" disabled={busy}>{busy ? 'Duke hyrë...' : 'Hyr'}</button>
        <p className="muted center">Biznes i ri? <Link to="/regjistrimi">Regjistrohu</Link></p>
        <p className="hint">Demo: pronar@demo.com / Demo1234!</p>
      </form>
    </div>
  );
}
