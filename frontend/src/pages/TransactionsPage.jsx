import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { transactionService, categoryService } from '../services/dataServices';
import { Loading, ErrorBox, EmptyState, Modal, Field, FormError } from '../components/ui';
import { money, todayStr } from '../utils/format';
import { validateAmount, validateDate } from '../utils/validate';

function TransactionForm({ initial, categories, employeeOnly, onClose, onSaved }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({
    amount: initial ? String(initial.amount) : '',
    type: initial ? initial.type : 'expense',
    category_id: initial ? String(initial.category_id) : '',
    date: initial ? initial.date : todayStr(),
    description: initial ? initial.description || '' : '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const cats = categories.filter((c) => c.type === form.type);

  // Rrjedha: forma → validim lokal → POST/PATCH /transactions → backend vlidon + ruan → lista rifreskohet
  async function submit(e) {
    e.preventDefault();
    const errs = {
      amount: validateAmount(form.amount),
      category_id: form.category_id ? null : 'Zgjidh një kategori.',
      date: validateDate(form.date),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    const body = {
      amount: form.amount.trim().replace(',', '.'),
      type: form.type,
      category_id: Number(form.category_id),
      date: form.date,
      description: form.description.trim() || undefined,
    };
    setBusy(true); setFormError('');
    try {
      if (editing) await transactionService.update(initial.id, body);
      else await transactionService.create(body);
      onSaved();
    } catch (err) {
      setFormError(err.message);
      if (err.details) setErrors(err.details);
    } finally { setBusy(false); }
  }

  return (
    <Modal title={editing ? 'Ndrysho transaksionin' : 'Transaksion i ri'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <FormError error={formError} />
        <Field label="Tipi">
          <select value={form.type} disabled={employeeOnly}
            onChange={(e) => setForm({ ...form, type: e.target.value, category_id: '' })}>
            <option value="expense">Shpenzim</option>
            {!employeeOnly && <option value="income">E ardhur</option>}
          </select>
        </Field>
        <Field label="Shuma (€)" error={errors.amount}>
          <input inputMode="decimal" value={form.amount} onChange={set('amount')} placeholder="p.sh. 150.75" autoFocus />
        </Field>
        <Field label="Kategoria" error={errors.category_id}>
          <select value={form.category_id} onChange={set('category_id')}>
            <option value="">Zgjidh...</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Data" error={errors.date}>
          <input type="date" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Përshkrimi (opsional)" error={errors.description}>
          <input value={form.description} onChange={set('description')} maxLength={1000} />
        </Field>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Anulo</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Duke ruajtur...' : 'Ruaj'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function TransactionsPage() {
  const { user, canManage, isOwner } = useAuth();
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | { tx? }
  const [actionError, setActionError] = useState('');

  const cats = useFetch(() => categoryService.list(), []);
  const list = useFetch(
    () => transactionService.list({ ...filters, page, limit: 10 }),
    [filters.type, filters.from, filters.to, page]
  );

  const setFilter = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };

  async function remove(t) {
    if (!window.confirm(`Të fshihet transaksioni prej ${money(t.amount)}?`)) return;
    setActionError('');
    try { await transactionService.remove(t.id); list.reload(); }
    catch (err) { setActionError(err.message); }
  }

  const rows = list.data ? list.data.data : [];
  const pg = list.data ? list.data.pagination : null;
  const pages = pg ? Math.max(1, Math.ceil(pg.total / pg.limit)) : 1;

  return (
    <>
      <div className="page-head">
        <h1>Transaksionet</h1>
        <button className="btn primary" disabled={!cats.data} onClick={() => setModal({})}>+ Transaksion i ri</button>
      </div>
      {user.role === 'punjonjes' && <p className="muted">Si punonjës mund të regjistrosh vetëm shpenzime dhe shikon vetëm shënimet e tua.</p>}

      <div className="card filters">
        <Field label="Tipi">
          <select value={filters.type} onChange={setFilter('type')}>
            <option value="">Të gjitha</option><option value="income">Të hyra</option><option value="expense">Shpenzime</option>
          </select>
        </Field>
        <Field label="Nga"><input type="date" value={filters.from} onChange={setFilter('from')} /></Field>
        <Field label="Deri"><input type="date" value={filters.to} onChange={setFilter('to')} /></Field>
      </div>

      <FormError error={actionError} />
      {list.loading ? <Loading /> : list.error ? <ErrorBox error={list.error} onRetry={list.reload} /> :
        rows.length === 0 ? (
          <EmptyState title="Nuk ka transaksione" hint="Ndrysho filtrat ose shto një transaksion të ri." />
        ) : (
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Data</th><th>Kategoria</th><th>Përshkrimi</th><th className="num">Shuma</th><th /></tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Data">{t.date}</td>
                    <td data-label="Kategoria">{t.category_name}</td>
                    <td data-label="Përshkrimi">{t.description || '—'}</td>
                    <td data-label="Shuma" className={`num ${t.type === 'income' ? 'pos' : 'neg'}`}>
                      {t.type === 'income' ? '+' : '−'}{money(t.amount)}
                    </td>
                    <td className="row-actions">
                      {canManage && <button className="btn small" onClick={() => setModal({ tx: t })}>Ndrysho</button>}
                      {isOwner && <button className="btn small danger" onClick={() => remove(t)}>Fshi</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pager">
              <button className="btn small" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Para</button>
              <span className="muted">Faqja {page} nga {pages} · {pg.total} gjithsej</span>
              <button className="btn small" disabled={page >= pages} onClick={() => setPage(page + 1)}>Pas ›</button>
            </div>
          </div>
        )}

      {modal && (
        <TransactionForm
          initial={modal.tx} categories={cats.data || []} employeeOnly={user.role === 'punjonjes'}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); list.reload(); }}
        />
      )}
    </>
  );
}
