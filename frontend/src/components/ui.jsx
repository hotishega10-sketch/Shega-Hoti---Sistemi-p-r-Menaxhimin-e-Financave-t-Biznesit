import { useEffect } from 'react';
import { STATUS_LABELS } from '../utils/format';

export const Loading = ({ text = 'Duke ngarkuar...' }) => (
  <div className="state" role="status"><span className="spinner" aria-hidden="true" />{text}</div>
);

export const EmptyState = ({ title, hint, action }) => (
  <div className="state empty">
    <strong>{title}</strong>
    {hint && <span className="muted">{hint}</span>}
    {action}
  </div>
);

export const ErrorBox = ({ error, onRetry }) => (
  <div className="state error" role="alert">
    <strong>Nuk u ngarkuan të dhënat</strong>
    <span>{error && error.message}</span>
    {onRetry && <button className="btn" onClick={onRetry}>Provo përsëri</button>}
  </div>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge ${status}`}>{STATUS_LABELS[status] || status}</span>
);

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Mbyll">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Field = ({ label, error, children }) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {error && <small className="field-error">{error}</small>}
  </label>
);

export const FormError = ({ error }) =>
  error ? <div className="form-error" role="alert">{error}</div> : null;
