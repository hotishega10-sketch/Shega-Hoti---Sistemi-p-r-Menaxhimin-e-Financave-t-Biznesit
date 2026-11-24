import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { clientService } from '../services/dataServices';
import { Loading, ErrorBox, EmptyState, Modal, Field, FormError } from '../components/ui';
import { required, validateEmail } from '../utils/validate';

function ClientForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ name: initial?.name || '', email: initial?.email || '', phone: initial?.phone || '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = {
      name: required(form.name, 'Emri'),
      email: form.email.trim() ? validateEmail(form.email.trim()) : null,
    };
    setErrors(errs);
    if (errs.name || errs.email) return;
    const body = { name: form.name.trim(), email: form.email.trim() || undefined, phone: form.phone.trim() || undefined };
    setBusy(true); setFormError('');
    try {
      if (initial) await clientService.update(initial.id, body); else await clientService.create(body);
      onSaved();
    } catch (err) { setFormError(err.message); if (err.details) setErrors(err.details); }
    finally { setBusy(false); }
  }

  return (
    <Modal title={initial ? 'Ndrysho klientin' : 'Klient i ri'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <FormError error={formError} />
        <Field label="Emri" error={errors.name}><input value={form.name} onChange={set('name')} autoFocus /></Field>
        <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Telefoni" error={errors.phone}><input value={form.phone} onChange={set('phone')} /></Field>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Anulo</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Duke ruajtur...' : 'Ruaj'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ClientsPage() {
  const { isOwner } = useAuth();
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [actionError, setActionError] = useState('');
  const { data, loading, error, reload } = useFetch(() => clientService.list(q), [q]);

  async function remove(c) {
    if (!window.confirm(`Të fshihet klienti "${c.name}"?`)) return;
    setActionError('');
    try { await clientService.remove(c.id); reload(); } catch (err) { setActionError(err.message); }
  }

  return (
    <>
      <div className="page-head">
        <h1>Klientët</h1>
        <button className="btn primary" onClick={() => setModal({})}>+ Klient i ri</button>
      </div>
      <div className="card filters">
        <Field label="Kërko sipas emrit"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Shkruaj emrin..." /></Field>
      </div>
      <FormError error={actionError} />
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> :
        data.length === 0 ? <EmptyState title="Nuk ka klientë" hint={q ? 'Asnjë klient nuk përputhet me kërkimin.' : 'Shto klientin e parë.'} /> : (
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Emri</th><th>Email</th><th>Telefoni</th><th /></tr></thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Emri">{c.name}</td>
                    <td data-label="Email">{c.email || '—'}</td>
                    <td data-label="Telefoni">{c.phone || '—'}</td>
                    <td className="row-actions">
                      <button className="btn small" onClick={() => setModal({ client: c })}>Ndrysho</button>
                      {isOwner && <button className="btn small danger" onClick={() => remove(c)}>Fshi</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {modal && <ClientForm initial={modal.client} onClose={() => setModal(null)} onSaved={() => { setModal(null); reload(); }} />}
    </>
  );
}
