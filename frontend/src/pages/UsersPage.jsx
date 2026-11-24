import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { userService } from '../services/dataServices';
import { Loading, ErrorBox, EmptyState, Modal, Field, FormError } from '../components/ui';
import { ROLE_LABELS } from '../utils/format';
import { validateEmail, validatePassword } from '../utils/validate';

function UserForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ email: '', password: '', role: 'kontabilist' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = { email: validateEmail(form.email), password: validatePassword(form.password) };
    setErrors(errs);
    if (errs.email || errs.password) return;
    setBusy(true); setFormError('');
    try {
      await userService.create({ email: form.email.trim(), password: form.password, role: form.role });
      onSaved();
    } catch (err) { setFormError(err.message); if (err.details) setErrors(err.details); }
    finally { setBusy(false); }
  }

  return (
    <Modal title="Përdorues i ri" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <FormError error={formError} />
        <Field label="Roli">
          <select value={form.role} onChange={set('role')}>
            <option value="kontabilist">Kontabilist (transaksione, klientë, fatura)</option>
            <option value="punjonjes">Punonjës (vetëm shpenzime të veta)</option>
          </select>
        </Field>
        <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} autoFocus /></Field>
        <Field label="Fjalëkalimi i përkohshëm (min. 8 karaktere)" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Anulo</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Duke ruajtur...' : 'Krijo përdoruesin'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const { data, loading, error, reload } = useFetch(() => userService.list(), []);
  return (
    <>
      <div className="page-head">
        <h1>Përdoruesit</h1>
        <button className="btn primary" onClick={() => setOpen(true)}>+ Përdorues i ri</button>
      </div>
      <p className="muted">Vetëm pronari i krijon kontabilistët dhe punonjësit e biznesit.</p>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        data.length === 0 ? <EmptyState title="Nuk ka përdorues" /> : (
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Email</th><th>Roli</th><th>Krijuar</th></tr></thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u.id}>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Roli"><span className="badge role">{ROLE_LABELS[u.role]}</span></td>
                    <td data-label="Krijuar">{String(u.created_at).slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {open && <UserForm onClose={() => setOpen(false)} onSaved={() => { setOpen(false); reload(); }} />}
    </>
  );
}
