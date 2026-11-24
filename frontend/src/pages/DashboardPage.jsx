import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dataServices';
import { Loading, ErrorBox, EmptyState } from '../components/ui';
import BarChart from '../components/BarChart';
import { money, monthLabel } from '../utils/format';

const Stat = ({ label, value, tone }) => (
  <div className="card stat"><span className="muted">{label}</span><strong className={tone}>{money(value)}</strong></div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => dashboardService.get(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const { month, all_time, monthly, expenses_by_category, recent, invoices } = data;
  const empty = monthly.every((m) => Number(m.income) === 0 && Number(m.expense) === 0);

  return (
    <>
      <h1>Kryefaqja</h1>
      <p className="muted">
        {monthLabel(month.month + '-01')} {month.month.slice(0, 4)}
        {user.role === 'punjonjes' && ' · po shihen vetëm shënimet e tua'}
      </p>
      <div className="grid stats">
        <Stat label="Të hyra këtë muaj" value={month.income} tone="pos" />
        <Stat label="Shpenzime këtë muaj" value={month.expense} tone="neg" />
        <Stat label="Bilanci i muajit" value={month.balance} tone={Number(month.balance) < 0 ? 'neg' : 'pos'} />
        <Stat label="Bilanci total" value={all_time.balance} />
      </div>

      {invoices && (
        <div className="grid stats">
          <Stat label={`Fatura të papaguara (${invoices.unpaid_count})`} value={invoices.unpaid_total} />
          <Stat label={`Fatura të vonuara (${invoices.overdue_count})`} value={invoices.overdue_total} tone={invoices.overdue_count ? 'neg' : ''} />
          <Stat label="Fatura të paguara" value={invoices.paid_total} tone="pos" />
        </div>
      )}

      <div className="grid two">
        <section className="card">
          <h2>6 muajt e fundit</h2>
          {empty ? <EmptyState title="Ende pa transaksione" hint="Shto transaksionin e parë te faqja Transaksionet." />
            : <><BarChart data={monthly} />
              <div className="legend"><span className="dot inc" /> Të hyra <span className="dot exp" /> Shpenzime</div></>}
        </section>
        <section className="card">
          <h2>Shpenzimet sipas kategorisë (muaji)</h2>
          {expenses_by_category.length === 0 ? <EmptyState title="Pa shpenzime këtë muaj" /> : (
            <ul className="plain">
              {expenses_by_category.map((c) => (
                <li key={c.name}><span>{c.name}</span><strong>{money(c.total)}</strong></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <h2>Transaksionet e fundit</h2>
        {recent.length === 0 ? <EmptyState title="Pa transaksione" /> : (
          <ul className="plain">
            {recent.map((t) => (
              <li key={t.id}>
                <span>{t.description || t.category_name}<small className="muted"> · {t.date}</small></span>
                <strong className={t.type === 'income' ? 'pos' : 'neg'}>
                  {t.type === 'income' ? '+' : '−'}{money(t.amount)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
