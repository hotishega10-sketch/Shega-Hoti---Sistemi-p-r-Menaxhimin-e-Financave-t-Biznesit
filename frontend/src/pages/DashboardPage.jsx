import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { dashboardService } from '../services/dataServices';
import { useAuth } from '../hooks/useAuth';
import { Loading, ErrorBox, EmptyState } from '../components/ui';
import BarChart from '../components/BarChart';
import { money, monthLabel } from '../utils/format';

const Stat = ({ label, value, tone }) => (
  <div className="card stat"><span className="muted">{label}</span><strong className={tone}>{money(value)}</strong></div>
);

export default function DashboardPage() {
  const { canManage } = useAuth();
  const { data, loading, error, reload } = useFetch(() => dashboardService.get(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const { month, monthly, expenses_by_category, recent, invoices } = data;
  const empty = monthly.every((m) => Number(m.income) === 0 && Number(m.expense) === 0);

  return (
    <>
      <h1>Kryefaqja</h1>
      <p className="muted">{monthLabel(month.month + '-01')} {month.month.slice(0, 4)}</p>

      <div className="grid stats">
        <Stat label="Të hyra këtë muaj" value={month.income} tone="pos" />
        <Stat label="Shpenzime këtë muaj" value={month.expense} tone="neg" />
        <Stat label="Bilanci i muajit" value={month.balance} tone={Number(month.balance) < 0 ? 'neg' : 'pos'} />
      </div>

      <div className="grid two">
        <section className="card">
          <h2>6 muajt e fundit</h2>
          {empty ? <EmptyState title="Ende pa transaksione" hint="Shto transaksionin e parë." /> : (
            <>
              <BarChart data={monthly} />
              <div className="legend"><span className="dot inc" /> Të hyra <span className="dot exp" /> Shpenzime</div>
            </>
          )}
        </section>

        {canManage && invoices ? (
          <section className="card">
            <h2>Faturat</h2>
            <div className="kv"><span>Të papaguara ({invoices.unpaid_count})</span><strong>{money(invoices.unpaid_total)}</strong></div>
            <div className="kv"><span>Të vonuara ({invoices.overdue_count})</span>
              <strong className={invoices.overdue_count ? 'neg' : ''}>{money(invoices.overdue_total)}</strong></div>
            <div className="kv"><span>Të paguara</span><strong className="pos">{money(invoices.paid_total)}</strong></div>
            <p><Link className="link" to="/faturat">Shiko faturat →</Link></p>
          </section>
        ) : (
          <section className="card">
            <h2>Shpenzimet sipas kategorisë</h2>
            {expenses_by_category.length === 0 ? <EmptyState title="Pa shpenzime këtë muaj" /> :
              expenses_by_category.slice(0, 4).map((c) => (
                <div className="kv" key={c.name}><span>{c.name}</span><strong>{money(c.total)}</strong></div>
              ))}
          </section>
        )}
      </div>

      <section className="card">
        <h2>Transaksionet e fundit</h2>
        {recent.length === 0 ? <EmptyState title="Pa transaksione" /> : (
          <ul className="plain">
            {recent.slice(0, 4).map((t) => (
              <li key={t.id}>
                <span>{t.description || t.category_name}<small className="muted"> · {t.date}</small></span>
                <strong className={t.type === 'income' ? 'pos' : 'neg'}>{t.type === 'income' ? '+' : '−'}{money(t.amount)}</strong>
              </li>
            ))}
          </ul>
        )}
        <p><Link className="link" to="/transaksionet">Të gjitha transaksionet →</Link></p>
      </section>
    </>
  );
}
