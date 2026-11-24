import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { invoiceService, clientService } from '../services/dataServices';
import { Loading, ErrorBox, EmptyState, Modal, Field, FormError, StatusBadge } from '../components/ui';
import { money, todayStr } from '../utils/format';
import { validateAmount, validateDate, required } from '../utils/validate';

const emptyItem = () => ({ description: '', quantity: '1', unit_price: '' });
const lineTotal = (it) => (Number(it.quantity) || 0) * (Number(String(it.unit_price).replace(',', '.')) || 0);

function InvoiceForm({ clients, onClose, onSaved }) {
  const [form, setForm] = useState({ client_id: '', due_date: todayStr(), invoice_number: '' });
  const [items, setItems] = useState([emptyItem()]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const total = items.reduce((s, it) => s + lineTotal(it), 0);

  const setItem = (i, k) => (e) => setItems(items.map((it, idx) => (idx === i ? { ...it, [k]: e.target.value } : it)));

  async function submit(e) {
    e.preventDefault();
    const errs = { client_id: form.client_id ? null : 'Zgjidh klientin.', due_date: validateDate(form.due_date) };
    items.forEach((it, i) => {
      const d = required(it.description, 'Përshkrimi');
      const p = validateAmount(it.unit_price);
      const q = Number.isInteger(Number(it.quantity)) && Number(it.quantity) >= 1 ? null : 'Sasia duhet të jetë numër i plotë ≥ 1.';
      if (d || p || q) errs[`item${i}`] = d || p || q;
    });
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true); setFormError('');
    try {
      await invoiceService.create({
        client_id: Number(form.client_id),
        due_date: form.due_date,
        invoice_number: form.invoice_number.trim() || undefined,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity),
          unit_price: String(it.unit_price).trim().replace(',', '.'),
        })),
      });
      onSaved();
    } catch (err) { setFormError(err.message); if (err.details && err.details.due_date) setErrors(err.details); }
    finally { setBusy(false); }
  }

  return (
    <Modal title="Faturë e re" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <FormError error={formError} />
        <Field label="Klienti" error={errors.client_id}>
          <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            <option value="">Zgjidh...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="two-cols">
          <Field label="Afati i pagesës" error={errors.due_date}>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Field>
          <Field label="Nr. i faturës (opsional)">
            <input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="auto" />
          </Field>
        </div>
        <h3>Artikujt</h3>
        {items.map((it, i) => (
          <div key={i} className="item-row">
            <input aria-label="Përshkrimi" placeholder="Përshkrimi" value={it.description} onChange={setItem(i, 'description')} />
            <input aria-label="Sasia" type="number" min="1" value={it.quantity} onChange={setItem(i, 'quantity')} />
            <input aria-label="Çmimi" inputMode="decimal" placeholder="Çmimi" value={it.unit_price} onChange={setItem(i, 'unit_price')} />
            <span className="muted">{money(lineTotal(it))}</span>
            {items.length > 1 && <button type="button" className="icon-btn" aria-label="Hiq artikullin" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>✕</button>}
            {errors[`item${i}`] && <small className="field-error full">{errors[`item${i}`]}</small>}
          </div>
        ))}
        <button type="button" className="btn small" onClick={() => setItems([...items, emptyItem()])}>+ Shto artikull</button>
        <p className="total">Totali: <strong>{money(total)}</strong></p>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Anulo</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Duke ruajtur...' : 'Krijo faturën'}</button>
        </div>
      </form>
    </Modal>
  );
}

function InvoiceDetail({ id, onClose, onChanged }) {
  const { canManage, isOwner } = useAuth();
  const { data, loading, error, reload } = useFetch(() => invoiceService.get(id), [id]);
  const [err, setErr] = useState('');

  async function act(fn, msg) {
    if (msg && !window.confirm(msg)) return;
    setErr('');
    try { await fn(); onChanged(); reload(); } catch (e) { setErr(e.message); }
  }

  return (
    <Modal title={data ? `Fatura ${data.invoice_number}` : 'Fatura'} onClose={onClose}>
      {loading ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (
        <>
          <FormError error={err} />
          <p><StatusBadge status={data.status} /> · Klienti: <strong>{data.client_name}</strong> · Afati: {data.due_date}
            {data.paid_at && <> · Paguar: {data.paid_at.slice(0, 10)}</>}</p>
          <table>
            <thead><tr><th>Artikulli</th><th className="num">Sasia</th><th className="num">Çmimi</th><th className="num">Totali</th></tr></thead>
            <tbody>
              {data.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.description}</td><td className="num">{it.quantity}</td>
                  <td className="num">{money(it.unit_price)}</td><td className="num">{money(it.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="total">Totali: <strong>{money(data.total)}</strong></p>
          <div className="actions">
            {isOwner && <button className="btn danger" onClick={() => act(async () => { await invoiceService.remove(id); onClose(); }, 'Të fshihet kjo faturë?')}>Fshi</button>}
            {canManage && data.status !== 'e_paguar' && <button className="btn primary" onClick={() => act(() => invoiceService.pay(id))}>Shëno si të paguar</button>}
          </div>
        </>
      )}
    </Modal>
  );
}

export default function InvoicesPage() {
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null); // 'new' | { id }
  const invoices = useFetch(() => invoiceService.list({ status }), [status]);
  const clients = useFetch(() => clientService.list(''), []);

  return (
    <>
      <div className="page-head">
        <h1>Faturat</h1>
        <button className="btn primary" disabled={!clients.data} onClick={() => setModal('new')}>+ Faturë e re</button>
      </div>
      <div className="card filters">
        <Field label="Statusi">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Të gjitha</option><option value="e_papaguar">Të papaguara</option>
            <option value="e_vonuar">Të vonuara</option><option value="e_paguar">Të paguara</option>
          </select>
        </Field>
      </div>
      {invoices.loading ? <Loading /> : invoices.error ? <ErrorBox error={invoices.error} onRetry={invoices.reload} /> :
        invoices.data.length === 0 ? (
          <EmptyState title="Nuk ka fatura" hint={clients.data && clients.data.length === 0 ? 'Shto fillimisht një klient, pastaj krijo faturën.' : 'Krijo faturën e parë.'} />
        ) : (
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Nr.</th><th>Klienti</th><th>Afati</th><th>Statusi</th><th className="num">Totali</th><th /></tr></thead>
              <tbody>
                {invoices.data.map((i) => (
                  <tr key={i.id}>
                    <td data-label="Nr.">{i.invoice_number}</td>
                    <td data-label="Klienti">{i.client_name}</td>
                    <td data-label="Afati">{i.due_date}</td>
                    <td data-label="Statusi"><StatusBadge status={i.status} /></td>
                    <td data-label="Totali" className="num">{money(i.total)}</td>
                    <td className="row-actions"><button className="btn small" onClick={() => setModal({ id: i.id })}>Hap</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {modal === 'new' && <InvoiceForm clients={clients.data || []} onClose={() => setModal(null)} onSaved={() => { setModal(null); invoices.reload(); }} />}
      {modal && modal.id && <InvoiceDetail id={modal.id} onClose={() => setModal(null)} onChanged={invoices.reload} />}
    </>
  );
}
